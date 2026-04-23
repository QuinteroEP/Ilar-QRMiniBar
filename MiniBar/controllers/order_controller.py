from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.database import connect
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from utils.response_wrapper import api_response
from sqlalchemy.orm import sessionmaker
from models.product_model import Product
from models.bar_order_model import Bar_Order
from models.product_order_model import ProductOrder
from schemas.product_order_schema import ProductOrderSchema
from db import database

router = APIRouter()

engine = create_engine(database.DATABASE_URL)

Session = sessionmaker(bind=engine)
session = Session()
    
@router.get("/orders")
def get_all_orders(db: Session = Depends(connect)):
    orders = session.query(Bar_Order).all()
    if orders is None:
        return api_response(data=None, message="No orders registered", error=404)
    return api_response(data=orders, message="All orders retreived")

@router.get("/orders/")
def get_order_by_id(id: float, db: Session = Depends(connect)):
    order = db.query(Bar_Order).filter(Bar_Order.id == id).first()
    if order is None:
        return api_response(data=None, message="Order not found", error=404)
    return api_response(data=order, message="Order found")
 
@router.post("/orders/")
def post_orders(itemData: ProductOrderSchema, roomId: float, productId: float, db: Session = Depends(connect)):
    room_order = db.query(Bar_Order).filter(Bar_Order.room_id == roomId).first()
    item = db.query(Product).filter(Product.id == productId).first()

    if item.inventory == 0:
        return api_response(data=None, message="Product out of stock")
    
    if(room_order is None):
        room_order = Bar_Order(room_id=roomId, cost=0)
        db.add(room_order)
        db.commit()
        db.refresh(room_order)

    total_cost = room_order.cost

    item_order = ProductOrder(
        id_product = item.id,
        product_name = item.name,
        product_price = item.price,
        product_quantity = itemData.quantity,
        id_order = room_order.id
    )
    total_cost += item_order.product_price * item_order.product_quantity
    
    setattr(room_order, "cost", total_cost)

    db.add(item_order)
    db.commit()
    db.refresh(item_order)
    
    return api_response(data=room_order, message="New order generated")

@router.put("/orders/")
def put_order(id: float, itemData: ProductOrderSchema, roomId: float, productId: float, db: Session = Depends(connect)):
    item = db.query(Product).filter(Product.id == productId).first()
    updated_order = db.query(Bar_Order).filter(Bar_Order.id == id).first()
    old_entry = db.query(ProductOrder).filter(ProductOrder.id_order == id, ProductOrder.id_product == productId).first()
    
    if(old_entry is None or updated_order is None):
        return api_response(data=None, message="Data not found", error=404)

    setattr(updated_order, "room_id", roomId)
    new_cost = updated_order.cost - (old_entry.product_price * old_entry.product_quantity)
    setattr(updated_order, "cost", new_cost)

    db.delete(old_entry)
    db.commit()

    new_item_order = ProductOrder(
        id_product = item.id,
        product_name = item.name,
        product_price = item.price,
        product_quantity = itemData.quantity,
        id_order = updated_order.id
    )
    new_cost += new_item_order.product_price * new_item_order.product_quantity
    
    setattr(updated_order, "cost", new_cost)

    db.add(new_item_order)
    db.commit()
    db.refresh(new_item_order)

    return api_response(data=updated_order, message="Updated order")

@router.delete("/orders/")
def delete_order(id: float, db: Session = Depends(connect)):
    order = db.query(Bar_Order).filter(Bar_Order.id == id).first()

    if order is None:
        return api_response(data=None, message="Order not found", error=404)
    
    db.delete(order)
    db.commit()
    return api_response(data=order, message="Order deleted")