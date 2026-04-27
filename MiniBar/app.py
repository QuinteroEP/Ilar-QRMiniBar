from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from controllers.product_controller import router as products_router
from controllers.order_controller import router as orders_router
from controllers.room_controller import router as room_router
from models import ORM
from utils.response_wrapper import api_response

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content=api_response(
            data=None,
            message="Invalid request body",
            error=400
        )
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router, prefix="/api", tags=["Products"])
app.include_router(orders_router, prefix="/api", tags=["Orders"])
app.include_router(room_router, prefix="/api", tags=["Rooms"])

@app.on_event("startup")
def on_startup():
    ORM.orm()

@app.get("/")
def root():
    return {"Backend Running"}