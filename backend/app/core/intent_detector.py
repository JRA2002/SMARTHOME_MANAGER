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
    print("estoy aqui en intent detector con el mensaje:", message)
    # 💰 Ingresos o ganancias
    if re.search(r"(gan|ingres|rent|cuánto gano|gané|cuanto gano|gane|beneficio|utilidad)", message):
        return Intent.INCOME
    
    # 🏠 Número de propiedades
    elif re.search(r"(cuántas|cuantos|número|total).*(propiedad|propiedades)", message):
        return Intent.PROPERTY_COUNT
    
    # 🏆 Propiedad con más ingresos
    elif re.search(r"(mejor|más rentable|mayor ganancia|más dinero)", message):
        return Intent.TOP_PROPERTY

    # 💸 Gastos
    elif re.search(r"(gast|cost|pagué|deuda|pago)", message):
        return Intent.EXPENSES

    # ❓ Desconocido
    else:
        return Intent.UNKNOWN
