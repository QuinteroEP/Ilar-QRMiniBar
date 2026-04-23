from pydantic import BaseModel

class RoomSchema(BaseModel):
    number: int