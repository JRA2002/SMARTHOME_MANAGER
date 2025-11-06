import re
from enum import Enum

class Intent(str, Enum):
    INCOME = "income"
    PROPERTY_COUNT = "property_count"
    TOP_PROPERTY = "top_property"
    EXPENSES = "expenses"
    UNKNOWN = "unknown"

def detect_intent(message: str) -> Intent:
    message = message.lower().strip()
    
    if re.search(r"(gan|ingres|rent|cuánto gano|gané|cuanto gano|gane|beneficio|utilidad)", message):
        return Intent.INCOME
    
    elif re.search(r"(cuántas|cuantos|número|total).*(propiedad|propiedades)", message):
        return Intent.PROPERTY_COUNT
    
    elif re.search(r"(mejor|más rentable|mayor ganancia|más dinero)", message):
        return Intent.TOP_PROPERTY

    elif re.search(r"(gast|cost|pagué|deuda|pago)", message):
        return Intent.EXPENSES

    else:
        return Intent.UNKNOWN
