from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base
from models.product_order_model import ProductOrder

class BarOrder(Base):
        __tablename__ = "bar_order"

        id: Mapped[int] = mapped_column(primary_key=True)
        room_id: Mapped[int] = mapped_column(ForeignKey("room.id"))
        cost: Mapped[float]
        
        productOrders = relationship(ProductOrder, cascade="all, delete-orphan", back_populates="orderData", lazy="selectin")