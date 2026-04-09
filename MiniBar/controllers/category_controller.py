from fastapi import APIRouter, HTTPException, Depends

router = APIRouter()
    
@router.get("/category")
def get_all_category():
    return {}

@router.get("/category/{category_id}")
def get_category_by_id(id: float):
    return {}

@router.post("/category/add/")
def post_category(name: str, price: float, inventory: int):
    return {}

@router.put("/category/update/{category_id}")
def put_category(name: str, price: float, inventory: int):
    return {}

@router.delete("/category/delete/{category_id}")
def delete_category(id: float):
    return {}