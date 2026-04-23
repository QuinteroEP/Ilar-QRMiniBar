from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from db.database import Base

class ProductOrder(Base):
        __tablename__ = "product-order"
        
        id: Mapped[int] = mapped_column(primary_key=True)
        id_product: Mapped[float]
        product_name: Mapped[str]
        product_price: Mapped[float]
        product_quantity: Mapped[int]
        id_order: Mapped[int] = mapped_column(ForeignKey("bar_order.id"))