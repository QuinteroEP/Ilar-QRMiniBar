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
from db import database

router = APIRouter()

engine = create_engine(database.DATABASE_URL)

Session = sessionmaker(bind=engine)
session = Session()

@router.get("/products")
def get_all_products(db: Session = Depends(connect)):
    products = session.query(Product).all()
    return api_response(data=products, message="All products retreived")

@router.get("/products/{product_id}")
def get_product_by_id(id: float, db: Session = Depends(connect)):
    product = db.query(Product).filter(Product.id == id).first()
    return api_response(data=product, message="Product found")

@router.post("/products/add/")
def post_products(name: str, price: float, inventory: int, db: Session = Depends(connect)):
    new_product = Product(name=name, price=price, inventory=inventory)
    session.add(new_product)
    session.commit()
    return api_response(data=new_product, message="New product added")

@router.put("/products/update/{product_id}")
def update_product(name: str, price: float, inventory: int, id: float, db: Session = Depends(connect)):
   updated_product = db.query(Product).filter(Product.id == id).first()    
   setattr(updated_product, "name", name)
   setattr(updated_product, "price", price)
   setattr(updated_product, "inventory", inventory)
   db.commit()
   db.refresh(updated_product)
   return api_response(data=updated_product, message="Updated product")

@router.delete("/products/delete/{product_id}")
def delete_product(id: float, db: Session = Depends(connect)):
    product = db.query(Product).filter(Product.id == id).first()

    if product is None:
        return None
    
    db.delete(product)
    db.commit()
    return api_response(data=product, message="Product deleted")