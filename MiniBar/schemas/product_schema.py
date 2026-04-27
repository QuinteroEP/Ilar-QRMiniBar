from pydantic import BaseModel, ConfigDict

class ProductSchema(BaseModel):
    name: str
    price: float
    inventory: int
    model_config = ConfigDict(extra="forbid")