from pydantic import BaseModel

class BarOrderSchema(BaseModel):
    roomId: int
    cost: float
    