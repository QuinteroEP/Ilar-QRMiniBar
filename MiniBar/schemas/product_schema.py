from pydantic import BaseModel, ConfigDict, Field

class ProductSchema(BaseModel):
    name: str
    price: float = Field(gt=0)
    inventory: int = Field(ge=0)
    model_config = ConfigDict(extra="forbid")