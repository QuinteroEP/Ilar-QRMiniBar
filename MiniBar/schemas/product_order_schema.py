from pydantic import BaseModel, ConfigDict, Field

class ProductOrderSchema(BaseModel):
    roomId: float = Field(gt=0)
    productId: float = Field(gt=0)
    quantity: int = Field(ge=1)
    model_config = ConfigDict(extra="forbid")
    