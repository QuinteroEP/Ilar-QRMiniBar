from models.product_order_model import ProductOrder
from models.bar_order_model import BarOrder

def serialize_order(order: ProductOrder):
    return{
        "id_product": order.id_product,
        "product_name": order.product_name,
        "product_price": order.product_price,
        "product_quantity": order.product_quantity,
        "id_order": order.id_order
    }

def serialize_bar_order(order: BarOrder):
    return{
        "room": order.room_id,
        "cost": order.cost
    }