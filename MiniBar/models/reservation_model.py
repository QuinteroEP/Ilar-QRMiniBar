from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from db.database import Base

class Reservation(Base):
        __tablename__ = "reservation"

        id: Mapped[int] = mapped_column(primary_key=True)