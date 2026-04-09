from fastapi import APIRouter, HTTPException, Depends

router = APIRouter()
    
@router.get("/customers")
def get_all_customers():
    return {}

@router.get("/customers/{customer_id}")
def get_customer_by_id():
    return {}

@router.post("/customers/add/")
def post_customers(name: str, price: float, inventory: int):
    return {}

@router.put("/customers/update/{customer_id}")
def put_customer(name: str, price: float, inventory: int):
    return {}

@router.delete("/customers/delete/{customer_id}")
def delete_customer(id: float):
    return {}