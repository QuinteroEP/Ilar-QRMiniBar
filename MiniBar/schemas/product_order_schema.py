from pydantic import BaseModel, ConfigDict

class ProductOrderSchema(BaseModel):
    quantity: int
    model_config = ConfigDict(extra="forbid")
    