import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.mysql import CHAR
from ..db.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    inventory = Column(int(100), nullable=False)
    price = Column(float(255), nullable=False)