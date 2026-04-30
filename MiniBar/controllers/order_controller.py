from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.database import connect
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from utils.response_wrapper import api_response
from sqlalchemy.orm import sessionmaker
from models.product_model import Product
from models.bar_order_model import BarOrder
from models.product_order_model import ProductOrder
from schemas.product_order_schema import ProductOrderSchema
from db import database
from utils import websocket_manager, serializer

router = APIRouter()

engine = create_engine(database.DATABASE_URL)

Session = sessionmaker(bind=engine)
session = Session()
manager = websocket_manager.ConnectionManager()
    
@router.get("/orders")
async def get_all_orders(id: float | None = None, db: Session = Depends(connect)):
    if id is not None:
        orders = db.query(BarOrder).filter(BarOrder.room_id == id).all()
    else:
        orders = db.query(BarOrder).all()
    
    if orders is None:
        return api_response(data=None, message="No orders registered", error=404)

    return api_response(data=orders, message="All orders retreived")

@router.get("/orders/")
def get_order_by_id(id: float, db: Session = Depends(connect)):
    order = db.query(BarOrder).filter(BarOrder.id == id).first()
    if order is None:
        return api_response(data=None, message="Order not found", error=404)
    return api_response(data=order, message="Order found")
 
@router.post("/orders")
async def post_orders(itemData: ProductOrderSchema, db: Session = Depends(connect)):
    room_order = db.query(BarOrder).filter(BarOrder.room_id == itemData.roomId).first()
    item = db.query(Product).filter(Product.id == itemData.productId).first()

    if item.inventory == 0 or item.inventory < itemData.quantity:
        return api_response(data=None, message="Not enough stock available")
    
    if(room_order is None):
        room_order = BarOrder(room_id=itemData.roomId, cost=0)
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
    new_inv = item.inventory - item_order.product_quantity
    
    setattr(room_order, "cost", total_cost)
    setattr(item, "inventory", new_inv)

    db.add(item_order)
    db.commit()
    db.refresh(item_order)
    db.refresh(item)

    await manager.broadcast({
        "type": "new_order",
        "item_order": serializer.serialize_order(item_order),
        "bar_order": serializer.serialize_bar_order(room_order)
    })
    
    return api_response(data=room_order, message="New order generated")

@router.put("/orders/")
def put_order(id: float, itemData: ProductOrderSchema, db: Session = Depends(connect)):
    item = db.query(Product).filter(Product.id == itemData.productId).first()
    updated_order = db.query(BarOrder).filter(BarOrder.id == id).first()
    old_entry = db.query(ProductOrder).filter(ProductOrder.id_order == id, ProductOrder.id_product == itemData.productId).first()
    
    if(old_entry is None or updated_order is None):
        return api_response(data=None, message="Data not found", error=404)

    setattr(updated_order, "room_id", itemData.roomId)
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
    room_order = db.query(BarOrder).filter(BarOrder.id == id).first()

    if room_order is None:
        return api_response(data=None, message="Order not found", error=404)
    
    db.delete(room_order)
    db.commit()
    return api_response(data=room_order, message="Order deleted")