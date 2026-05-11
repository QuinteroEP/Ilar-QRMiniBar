from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class ProductOrderUpdateSchema(BaseModel):
    roomId: Optional[float] = Field(default=None, gt=0)
    productId: Optional[float] = Field(default=None, gt=0)
    quantity: Optional[int] = Field(default=None, ge=1)
    
    model_config = ConfigDict(extra="forbid")
    