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
from schemas.product_schema import ProductSchema

router = APIRouter()

engine = create_engine(database.DATABASE_URL)

Session = sessionmaker(bind=engine)

@router.get("/products")
def get_all_products(db: Session = Depends(connect)):
    products = db.query(Product).all()
    return api_response(data=products, message="All products retreived")

@router.get("/products/")
def get_product_by_id(id: float, db: Session = Depends(connect)):
    product = db.query(Product).filter(Product.id == id).first()
    return api_response(data=product, message="Product found")

@router.post("/products/")
def post_products(product: ProductSchema, db: Session = Depends(connect)):
    new_product = Product(
        name=product.name,
        price=product.price,
        inventory=product.inventory
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return api_response(data=new_product, message="New product added")

@router.put("/products/")
def update_product(product: ProductSchema, id: float, db: Session = Depends(connect)):
   updated_product = db.query(Product).filter(Product.id == id).first()

   setattr(updated_product, "name", product.name)
   setattr(updated_product, "price", product.price)
   setattr(updated_product, "inventory", product.inventory)
   
   db.commit()
   db.refresh(updated_product)
   return api_response(data=updated_product, message="Updated product")

@router.delete("/products/")
def delete_product(id: float, db: Session = Depends(connect)):
    product = db.query(Product).filter(Product.id == id).first()

    if product is None:
        return None
    
    db.delete(product)
    db.commit()
    return api_response(data=product, message="Product deleted")