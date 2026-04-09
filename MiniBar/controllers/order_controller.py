from fastapi import APIRouter, HTTPException, Depends

router = APIRouter()
    
@router.get("/orders")
def get_all_orders():
    return {}

@router.get("/orders/{order_id}")
def get_order_by_id():
    return {}

#Copiar producto y no referencia
@router.post("/orders/add/")
def post_orders():
    return {}

@router.put("/orders/update/{order_id}")
def put_order():
    return {}

@router.delete("/orders/delete/{order_id}")
def delete_order(id: float):
    return {}