"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Bot, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  role: "user" | "assistant"
  content: string
}

const suggestedQuestions = [
  "¿Qué propiedades tengo disponibles en Palermo?",
  "¿Cuál es mi ingreso total del último mes?",
  "¿Qué propiedad tiene la mayor rentabilidad?",
  "¿Cuántos contratos vencen este año?",
]

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hola! Soy tu asistente inteligente de SmartHome Manager. Puedo ayudarte a consultar información sobre tus propiedades, analizar rentabilidad, revisar contratos y mucho más. ¿En qué puedo ayudarte hoy?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (message?: string) => {
    const messageToSend = message || input
    if (!messageToSend.trim()) return

    setMessages((prev) => [...prev, { role: "user", content: messageToSend }])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        palermo:
          "Tienes 2 propiedades disponibles en Palermo: 'Apartamento Palermo' (Av. Santa Fe 3500) actualmente ocupado con renta de $1,800/mes, y 'Loft Palermo Norte' disponible para alquiler.",
        ingreso:
          "Tu ingreso total del último mes fue de $48,500 USD, proveniente de 24 propiedades activas. Esto representa un incremento del 12% respecto al mes anterior.",
        rentabilidad:
          "La propiedad con mayor rentabilidad es 'Casa Núñez' con un ROI del 8.5% anual. Le sigue 'Loft Recoleta' con 7.8% y 'Apartamento Palermo' con 7.2%.",
        contratos:
          "Tienes 3 contratos que vencen este año: 'Apartamento Palermo' (enero 2025), 'Casa Belgrano' (mayo 2025), y 'Departamento Caballito' (febrero 2025).",
      }

      let response =
        "He analizado tu consulta. Basándome en los datos de tu cartera, puedo decirte que actualmente gestionas 24 propiedades con una tasa de ocupación del 92%. ¿Hay algo específico que te gustaría saber?"

      const lowerMessage = messageToSend.toLowerCase()
      if (lowerMessage.includes("palermo")) response = responses.palermo
      else if (lowerMessage.includes("ingreso") || lowerMessage.includes("recaud")) response = responses.ingreso
      else if (lowerMessage.includes("rentabilidad")) response = responses.rentabilidad
      else if (lowerMessage.includes("contrato") || lowerMessage.includes("venc")) response = responses.contratos

      setMessages((prev) => [...prev, { role: "assistant", content: response }])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Asistente IA</h1>
        <p className="text-muted-foreground mt-1">
          Consulta información y obtén insights sobre tu cartera de propiedades
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div key={i} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="rounded-lg bg-muted px-4 py-2">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Escribe tu pregunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
              <Button onClick={() => handleSend()} disabled={isLoading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Preguntas Sugeridas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedQuestions.map((question, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 bg-transparent"
                onClick={() => handleSend(question)}
                disabled={isLoading}
              >
                <span className="text-sm leading-relaxed">{question}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
