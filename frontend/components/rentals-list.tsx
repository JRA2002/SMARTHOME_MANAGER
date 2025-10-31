"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, User } from "lucide-react"

const rentals = [
  {
    id: 1,
    property: "Apartamento Palermo",
    tenant: "María González",
    startDate: "2024-01-15",
    endDate: "2025-01-14",
    monthlyRent: 1800,
    status: "Activo",
    paymentStatus: "Al día",
  },
  {
    id: 2,
    property: "Casa Belgrano",
    tenant: "Carlos Rodríguez",
    startDate: "2023-06-01",
    endDate: "2025-05-31",
    monthlyRent: 2500,
    status: "Activo",
    paymentStatus: "Al día",
  },
  {
    id: 3,
    property: "Departamento Caballito",
    tenant: "Ana Martínez",
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    monthlyRent: 1500,
    status: "Activo",
    paymentStatus: "Pendiente",
  },
  {
    id: 4,
    property: "Loft Recoleta",
    tenant: "-",
    startDate: "-",
    endDate: "-",
    monthlyRent: 2200,
    status: "Sin contrato",
    paymentStatus: "-",
  },
]

export function RentalsList() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Alquileres</h1>
          <p className="text-muted-foreground mt-1">Gestiona contratos y arrendatarios</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Contrato
        </Button>
      </div>

      <div className="grid gap-4">
        {rentals.map((rental) => (
          <Card key={rental.id}>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-foreground">{rental.property}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {rental.tenant}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={rental.status === "Activo" ? "default" : "secondary"}>{rental.status}</Badge>
                  <Badge
                    variant={
                      rental.paymentStatus === "Al día"
                        ? "default"
                        : rental.paymentStatus === "Pendiente"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {rental.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">{rental.startDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de fin</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">{rental.endDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renta mensual</p>
                  <p className="text-xl font-bold text-foreground mt-1">${rental.monthlyRent.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Ver contrato
                </Button>
                <Button variant="outline" size="sm">
                  Historial de pagos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
