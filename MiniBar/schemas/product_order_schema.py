from pydantic import BaseModel, ConfigDict, Field

class ProductOrderSchema(BaseModel):
    roomId: float
    productId: float
    quantity: int = Field(gt=1)
    model_config = ConfigDict(extra="forbid")
    