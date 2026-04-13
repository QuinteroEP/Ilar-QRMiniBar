import uuid
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.database import Base

class Product(Base):
        __tablename__ = "product"

        id: Mapped[int] = mapped_column(primary_key=True)
        name: Mapped[str]
        inventory: Mapped[int]
        price: Mapped[float]
