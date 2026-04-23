from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.database import Base
from models.product_order_model import ProductOrder

class Bar_Order(Base):
        __tablename__ = "bar_order"

        id: Mapped[int] = mapped_column(primary_key=True)
        room_id: Mapped[int] = mapped_column(ForeignKey("room.id"))
        cost: Mapped[float]
        productOrders = relationship(ProductOrder, cascade="all, delete-orphan")