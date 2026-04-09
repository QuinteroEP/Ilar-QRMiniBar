import os
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


def innit():
    dbpass = os.getenv("ILAR_PASS") 

    try:
        connection = psycopg2.connect(database="ilar", user="postgres", password=dbpass, host="localhost", port=5432)
    except:
        print("Connection Error")

    print("Connection started")
    cursor = connection.cursor()
    
    create = (
        """
        CREATE TABLE IF NOT EXISTS product (
            id SERIAL PRIMARY KEY, 
            name TEXT NOT NULL, 
            inventory INTEGER,
            price FLOAT NOT NULL
        )
        """,

        """
        CREATE TABLE IF NOT EXISTS customer (
            room_number SERIAL PRIMARY KEY, 
            id INTEGER
        )
        """
        )
    
    for command in create:
        cursor.execute(command)

    connection.commit()
    
    print("Tables created")