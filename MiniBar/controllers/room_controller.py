from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.database import connect
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from utils.response_wrapper import api_response
from sqlalchemy.orm import sessionmaker
from models.room_model import Room
from db import database
from schemas.room_schema import RoomSchema

router = APIRouter()

engine = create_engine(database.DATABASE_URL)

Session = sessionmaker(bind=engine)
session = Session()

@router.get("/rooms")
def get_all_rooms(db: Session = Depends(connect)):
    rooms = session.query(Room).all()
    if rooms is None:
        return api_response(data=None, message="No rooms registered", error=404)
    return api_response(data=rooms, message="All rooms retreived")

@router.get("/rooms/")
def get_room_by_id(id:float, db: Session = Depends(connect)):
    room = db.query(Room).filter(Room.id == id).first()
    if room is None:
        return api_response(data=None, message="No room found", error=404)
    return api_response(data=room, message="Room found")

@router.post("/rooms")
def post_rooms(room: RoomSchema, db: Session = Depends(connect)):
    new_room = Room(number=room.number)
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return api_response(data=new_room, message="New room added")

@router.put("/rooms/")
def put_room(id:float, room: RoomSchema, db: Session = Depends(connect)):
    updated_room = db.query(Room).filter(Room.id == id).first()
    if updated_room is None:
        return api_response(data=None, message="Room not found", error=404)
    
    setattr(updated_room, "number", room.number)
    
    db.commit()
    db.refresh(updated_room)
    return api_response(data=updated_room, message="Updated room")

@router.delete("/rooms/")
def delete_room(id: float, db: Session = Depends(connect)):
    room = db.query(Room).filter(Room.id == id).first()

    if room is None:
        return api_response(data=None, message="Room not found", error=404)
    
    db.delete(room)
    db.commit()
    return api_response(data=room, message="Room deleted")