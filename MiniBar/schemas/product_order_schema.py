from pydantic import BaseModel, ConfigDict

class ProductOrderSchema(BaseModel):
    roomId: float
    productId: float
    quantity: int
    model_config = ConfigDict(extra="forbid")
    