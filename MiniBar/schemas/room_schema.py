from pydantic import BaseModel, ConfigDict

class RoomSchema(BaseModel):
    number: int
    model_config = ConfigDict(extra="forbid")