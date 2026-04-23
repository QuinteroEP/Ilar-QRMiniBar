from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from db.database import Base

class Room(Base):
        __tablename__ = "room"

        id: Mapped[int] = mapped_column(primary_key=True)
        number: Mapped[int]