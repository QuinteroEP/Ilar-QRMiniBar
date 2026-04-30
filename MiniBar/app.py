from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from controllers.product_controller import router as products_router
from controllers.order_controller import router as orders_router
from controllers.room_controller import router as room_router
from models import ORM
from utils.response_wrapper import api_response
from utils import websocket_manager

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

manager = websocket_manager.ConnectionManager()

@app.get("/")
def root():
    return {"Backend Running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Sending message: {data}", websocket)
            await manager.broadcast(f"Message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("User dsiconnected")