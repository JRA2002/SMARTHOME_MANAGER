"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, DollarSign } from "lucide-react"

const expenses = [
  {
    id: 1,
    property: "Apartamento Palermo",
    category: "Mantenimiento",
    description: "Reparación de aire acondicionado",
    amount: 350,
    date: "2024-10-15",
    status: "Pagado",
  },
  {
    id: 2,
    property: "Casa Belgrano",
    category: "Servicios",
    description: "Factura de electricidad",
    amount: 120,
    date: "2024-10-20",
    status: "Pagado",
  },
  {
    id: 3,
    property: "Loft Recoleta",
    category: "Impuestos",
    description: "ABL - Octubre 2024",
    amount: 280,
    date: "2024-10-25",
    status: "Pendiente",
  },
  {
    id: 4,
    property: "Estudio Microcentro",
    category: "Mantenimiento",
    description: "Pintura y reparaciones",
    amount: 850,
    date: "2024-10-18",
    status: "Pagado",
  },
  {
    id: 5,
    property: "Casa Núñez",
    category: "Servicios",
    description: "Jardinería mensual",
    amount: 200,
    date: "2024-10-22",
    status: "Pagado",
  },
]

const categoryColors: Record<string, string> = {
  Mantenimiento: "bg-chart-3",
  Servicios: "bg-chart-2",
  Impuestos: "bg-chart-4",
}

export function ExpensesList() {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pendingExpenses = expenses
    .filter((e) => e.status === "Pendiente")
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gastos</h1>
          <p className="text-muted-foreground mt-1">Registra y controla los gastos de tus propiedades</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Gasto
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gastos (Octubre)</CardTitle>
            <DollarSign className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{expenses.length} transacciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Pendientes</CardTitle>
            <DollarSign className="h-5 w-5 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${pendingExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.filter((e) => e.status === "Pendiente").length} pagos pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col gap-4 border-b border-border pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${categoryColors[expense.category] || "bg-muted"}`} />
                    <p className="font-medium text-foreground">{expense.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{expense.property}</span>
                    <span>•</span>
                    <span>{expense.category}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {expense.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">${expense.amount.toLocaleString()}</p>
                  </div>
                  <Badge
                    variant={expense.status === "Pagado" ? "default" : "destructive"}
                    className="min-w-[80px] justify-center"
                  >
                    {expense.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
