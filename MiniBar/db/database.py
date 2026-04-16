from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

load_dotenv()

dbuser = os.getenv("DB_USER")
dbpass = os.getenv("ILAR_PASS")
dbaddress = os.getenv("DB_ADDR")
dbport = os.getenv("DB_PORT")
dbname = os.getenv("DB_NAME")


DATABASE_URL = f"postgresql://{dbuser}:{dbpass}@{dbaddress}:{dbport}/{dbname}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

def connect():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()