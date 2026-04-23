from pydantic import BaseModel

class ProductOrderSchema(BaseModel):
    quantity: int
    