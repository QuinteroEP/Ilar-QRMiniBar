# config.py
from dotenv import load_dotenv
import os

load_dotenv()

def get_db_pass():
    dbpass = os.getenv("ILAR_PASS")
    if dbpass is None:
        raise ValueError("ILAR_PASS not set")
    return dbpass