from fastapi import APIRouter, HTTPException, Depends
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from db.database import connect
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from utils.response_wrapper import api_response
from sqlalchemy.orm import sessionmaker
from models.product_model import Product
from models.bar_oder_model import Bar_Order
from models.product_order_model import ProductOrder
from db import database

router = APIRouter()

engine = create_engine(database.DATABASE_URL)

Session = sessionmaker(bind=engine)
session = Session()
    
@router.get("/orders")
def get_all_orders(db: Session = Depends(connect)):
    orders = session.query(Bar_Order).all()
    return api_response(data=orders, message="All orders retreived")

@router.get("/orders/{order_id}")
def get_order_by_id(id: float, db: Session = Depends(connect)):
    orders = db.query(Bar_Order).filter(Bar_Order.id == id).first()
    return api_response(data=orders, message="Order found")
 
@router.post("/orders/add/")
def post_orders(room_id: float, products_id: list[float], amounts: list[int], db: Session = Depends(connect)):
    total_cost = 0
    new_order = Bar_Order(room_id=room_id, cost=0)

    session.add(new_order)
    session.commit()

    for item, quantity in zip(products_id, amounts):
        session.add(ProductOrder(id_product=item, id_order=new_order.id, quantity = quantity))
        total_cost += + db.query(Product.price).filter(Product.id == item).scalar() * quantity

    setattr(new_order, "cost", total_cost)
    session.commit()
    
    return api_response(data=new_order, message="New order generated")

@router.put("/orders/update/{order_id}")
def put_order(id: float, room_id: float, products_id: list[float], amounts: list[int], db: Session = Depends(connect)):
    updated_order = db.query(Bar_Order).filter(Bar_Order.id == id).first()
    updated_order.room_id = room_id

    db.query(ProductOrder).filter(ProductOrder.id_order == id).delete()

    total_cost = 0

    for item, quantity in zip(products_id, amounts):
        db.add(ProductOrder(
            id_order=id,
            id_product=item,
            quantity=quantity
        ))

        total_cost += db.query(Product.price).filter(Product.id == item).scalar() * quantity

    updated_order.cost = total_cost

    db.commit()
    db.refresh(updated_order)
    return api_response(data=updated_order, message="Updated order")

@router.delete("/orders/delete/{order_id}")
def delete_order(id: float, db: Session = Depends(connect)):
    order = db.query(Bar_Order).filter(Bar_Order.id == id).first()

    if order is None:
        return None
    
    db.delete(order)
    db.commit()
    return api_response(data=order, message="Order deleted")