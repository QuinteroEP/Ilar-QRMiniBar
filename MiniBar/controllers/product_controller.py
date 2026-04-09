from fastapi import APIRouter, HTTPException, Depends
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

router = APIRouter()

dbpass = os.getenv("ILAR_PASS") 

try:
    connection = psycopg2.connect(database="ilar", user="postgres", password=dbpass, host="localhost", port=5432)
except:
    print("Connection Error")

cursor = connection.cursor()
    
@router.get("/products")
def get_all_products():
    get_all_query = """
        SELECT * FROM product
        """
    cursor.execute(get_all_query)
    return cursor.fetchall()

@router.get("/products/{product_id}")
def get_product_by_id(id: float):
    find_query = """
        SELECT * FROM product
        WHERE id = %s
        """
    cursor.execute(find_query, (id,))
    return cursor.fetchone()

@router.post("/products/add/")
def post_products(name: str, price: float, inventory: int):
    insert_data = (name, price, inventory)
    insert_query = """
        INSERT INTO product (name, price, inventory)
        VALUES (%s, %s, %s);
        """
    cursor.execute(insert_query, insert_data)
    connection.commit()
    return {}

@router.put("/products/update/{product_id}")
def update_product(name: str, price: float, inventory: int, id: float):
    params = (name, price, inventory, id)
    update_query = """
        UPDATE product 
        SET name = %s, price = %s, inventory = %s
        WHERE id = %s
        """
    cursor.execute(update_query, params)
    connection.commit()
    return {}

@router.delete("/products/delete/{product_id}")
def delete_product(id: float):
    delete_query = """
        DELETE FROM product
        WHERE id = %s
        """
    cursor.execute(delete_query, (id,))
    connection.commit()
    return {}