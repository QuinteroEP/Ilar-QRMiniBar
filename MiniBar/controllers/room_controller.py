from fastapi import APIRouter, HTTPException, Depends
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from db.database import connect
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from utils.response_wrapper import api_response
from sqlalchemy.orm import sessionmaker
from models.room_model import Room
from db import database

router = APIRouter()

engine = create_engine(database.DATABASE_URL)

Session = sessionmaker(bind=engine)
session = Session()

@router.get("/rooms")
def get_all_rooms(db: Session = Depends(connect)):
    rooms = session.query(Room).all()
    return api_response(data=rooms, message="All rooms retreived")

@router.get("/rooms/{room_id}")
def get_room_by_id(id:float, db: Session = Depends(connect)):
    room = db.query(Room).filter(Room.id == id).first()
    return api_response(data=room, message="Room found")

@router.post("/rooms/add/")
def post_rooms(number: int, db: Session = Depends(connect)):
    new_room = Room(number=number)
    session.add(new_room)
    session.commit()
    return api_response(data=new_room, message="New room added")

@router.put("/rooms/update/{room_id}")
def put_room(id:float, number: int, db: Session = Depends(connect)):
    updated_room = db.query(Room).filter(Room.id == id).first()
    setattr(updated_room, "number", number)
    
    db.commit()
    db.refresh(updated_room)
    return api_response(data=updated_room, message="Updated room")

@router.delete("/rooms/delete/{room_id}")
def delete_room(id: float, db: Session = Depends(connect)):
    room = db.query(Room).filter(Room.id == id).first()

    if room is None:
        return None
    
    db.delete(room)
    db.commit()
    return api_response(data=room, message="Room deleted")