# assistant_router.py
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from openai import OpenAI
from app.database import get_db
from app.models.property import Property, Rental, Expense
from sqlalchemy import func

router = APIRouter(prefix="/api/v1/assistant", tags=["Assistant"])

client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key="TU_API_KEY_GROQ")

# 🧰 FUNCIONES QUE LA IA PUEDE USAR
def get_property_summary(db: Session, user_id: int):
    total_properties = db.query(Property).filter(Property.user_id == user_id).count()
    total_income = db.query(func.sum(Rental.monthly_amount)).join(Property).filter(Property.user_id == user_id).scalar() or 0
    total_expenses = db.query(func.sum(Expense.amount)).join(Property).filter(Property.user_id == user_id).scalar() or 0
    net_profit = total_income - total_expenses
    return {
        "total_properties": total_properties,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_profit": net_profit
    }

# 📩 ENDPOINT PRINCIPAL
@router.post("/")
async def chat_with_assistant(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    user_message = body.get("message", "")
    user_id = 1  # <- reemplaza con tu lógica de usuario autenticado

    # Definimos las herramientas disponibles
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_property_summary",
                "description": "Get the user's total properties, income, expenses, and net profit.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                },
            },
        }
    ]

    # Llamada inicial al modelo
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are a real estate assistant that helps the user understand their properties and finances."
            },
            {"role": "user", "content": user_message},
        ],
        tools=tools,
    )

    message = response.choices[0].message

    # Si el modelo solicita usar una función
    if message.tool_calls:
        tool_call = message.tool_calls[0]
        if tool_call.function.name == "get_property_summary":
            result = get_property_summary(db, user_id)
            # Respondemos con el resultado de la función
            follow_up = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a real estate assistant."
                    },
                    {"role": "user", "content": user_message},
                    {"role": "assistant", "tool_calls": message.tool_calls},
                    {"role": "tool", "tool_call_id": tool_call.id, "content": str(result)},
                ],
            )
            answer = follow_up.choices[0].message.content
            return {"response": answer}

    # Si no requiere función, solo devuelve la respuesta
    return {"response": message.content}
