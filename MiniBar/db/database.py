from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

load_dotenv()

dbpass = os.getenv("ILAR_PASS")

DATABASE_URL = f"postgresql://postgres:{dbpass}@localhost:5432/ilar"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

def connect():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()