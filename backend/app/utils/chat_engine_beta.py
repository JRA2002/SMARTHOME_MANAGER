from openai import OpenAI

# 🔑 Tu API key de Groq (https://console.groq.com/)
client = OpenAI(
    base_url="hola",
    api_key="hola"
)

print("🤖 Asistente Groq listo. Escribe 'salir' para terminar.\n")

# 🧠 Mantiene la conversación
messages = [
    {"role": "system", "content": "Eres un asistente amable y experto en análisis de propiedades."}
]

while True:
    user_input = input("Tú: ")

    if user_input.lower() in ["salir", "exit", "quit"]:
        print("👋 ¡Hasta luego!")
        break

    messages.append({"role": "user", "content": user_input})

    # 💬 Envía el mensaje al modelo
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",  # modelo gratuito y rápido
        messages=messages,
        temperature=0.7,
    )

    ai_message = response.choices[0].message.content
    messages.append({"role": "assistant", "content": ai_message})

    print(f"Groq: {ai_message}\n")


