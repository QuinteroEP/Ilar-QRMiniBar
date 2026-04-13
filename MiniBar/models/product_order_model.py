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

class ProductOrder(Base):
        __tablename__ = "product-order"
        
        id: Mapped[int] = mapped_column(primary_key=True)
        id_product: Mapped[int] = mapped_column(ForeignKey("product.id"))
        id_order: Mapped[int] = mapped_column(ForeignKey("bar_order.id"))