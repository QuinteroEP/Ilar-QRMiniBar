from fastapi import FastAPI
from controllers.product_controller import router as products_router
from controllers.order_controller import router as orders_router
from controllers.room_controller import router as room_router
from db import database
from models import ORM

app = FastAPI()

app.include_router(products_router, prefix="/api", tags=["Products"])
app.include_router(orders_router, prefix="/api", tags=["Orders"])
app.include_router(room_router, prefix="/api", tags=["Rooms"])

@app.on_event("startup")
def on_startup():
    ORM.orm()

@app.get("/")
def root():
    return {"root"}