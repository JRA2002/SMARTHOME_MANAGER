"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, DollarSign, TrendingUp } from "lucide-react"

const stats = [
  {
    name: "Total Propiedades",
    value: "24",
    change: "+12%",
    icon: Building2,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    name: "Alquileres Activos",
    value: "18",
    change: "+8%",
    icon: FileText,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    name: "Ingresos Mensuales",
    value: "$45,230",
    change: "+23%",
    icon: DollarSign,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    name: "Valor Portfolio",
    value: "$2.4M",
    change: "+15%",
    icon: TrendingUp,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
]

export default function DashboardPage() {

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-balance mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Bienvenido a tu panel de gestión de propiedades</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-chart-3 font-semibold">{stat.change}</span> vs mes anterior
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas transacciones y eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pago recibido - Propiedad #{i}</p>
                      <p className="text-xs text-muted-foreground">Hace {i} horas</p>
                    </div>
                    <span className="text-sm font-semibold text-chart-3">+$1,200</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Próximos Vencimientos</CardTitle>
              <CardDescription>Contratos y pagos pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Contrato - Propiedad #{i}</p>
                      <p className="text-xs text-muted-foreground">Vence en {i * 3} días</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
