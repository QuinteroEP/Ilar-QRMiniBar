from pydantic import BaseModel, ConfigDict, Field

class RoomSchema(BaseModel):
    number: int = Field(gt=0)
    model_config = ConfigDict(extra="forbid")