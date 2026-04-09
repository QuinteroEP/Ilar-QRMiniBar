from fastapi import FastAPI
from controllers.product_controller import router as products_router
from controllers.order_controller import router as orders_router
from controllers.customer_controller import router as customers_router
from db import database

app = FastAPI()

app.include_router(products_router, prefix="/api", tags=["Products"])
app.include_router(orders_router, prefix="/api", tags=["Orders"])
app.include_router(customers_router, prefix="/api", tags=["Customers"])

@app.on_event("startup")
def on_startup():
    database.innit()

@app.get("/")
def root():
    return {"root"}