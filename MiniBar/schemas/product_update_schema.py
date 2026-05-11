from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class ProductUpdateSchema(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    inventory: Optional[int] = Field(default=None, gt=0)
    
    model_config = ConfigDict(extra="forbid")