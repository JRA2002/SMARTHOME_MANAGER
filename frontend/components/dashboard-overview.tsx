"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const stats = [
  {
    title: "Total Propiedades",
    value: "24",
    change: "+2 este mes",
    icon: Building2,
    color: "text-primary",
  },
  {
    title: "Ingresos Mensuales",
    value: "$48,500",
    change: "+12% vs mes anterior",
    icon: DollarSign,
    color: "text-chart-2",
  },
  {
    title: "Tasa de Ocupación",
    value: "92%",
    change: "+5% este trimestre",
    icon: TrendingUp,
    color: "text-chart-3",
  },
  {
    title: "Mantenimientos Pendientes",
    value: "3",
    change: "Requieren atención",
    icon: AlertCircle,
    color: "text-chart-4",
  },
]

const revenueData = [
  { month: "Ene", revenue: 42000 },
  { month: "Feb", revenue: 45000 },
  { month: "Mar", revenue: 43500 },
  { month: "Abr", revenue: 47000 },
  { month: "May", revenue: 46500 },
  { month: "Jun", revenue: 48500 },
]

const occupancyData = [
  { month: "Ene", rate: 88 },
  { month: "Feb", rate: 87 },
  { month: "Mar", rate: 90 },
  { month: "Abr", rate: 89 },
  { month: "May", rate: 91 },
  { month: "Jun", rate: 92 },
]

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general de tu cartera de propiedades</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" stroke="rgb(var(--color-muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="rgb(var(--color-muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(var(--color-card))",
                    border: "1px solid rgb(var(--color-border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "rgb(var(--color-foreground))" }}
                />
                <Bar dataKey="revenue" fill="rgb(var(--color-primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Tasa de Ocupación</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyData}>
                <XAxis dataKey="month" stroke="rgb(var(--color-muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="rgb(var(--color-muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(var(--color-card))",
                    border: "1px solid rgb(var(--color-border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "rgb(var(--color-foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="rgb(var(--color-chart-2))"
                  strokeWidth={2}
                  dot={{ fill: "rgb(var(--color-chart-2))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Propiedades Destacadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Apartamento Palermo",
                address: "Av. Santa Fe 3500, Buenos Aires",
                status: "Ocupado",
                rent: "$1,800/mes",
              },
              {
                name: "Casa Belgrano",
                address: "Calle Juramento 2100, Buenos Aires",
                status: "Ocupado",
                rent: "$2,500/mes",
              },
              {
                name: "Loft Recoleta",
                address: "Av. Callao 1200, Buenos Aires",
                status: "Disponible",
                rent: "$2,200/mes",
              },
            ].map((property, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{property.name}</p>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{property.rent}</p>
                  <p
                    className={cn("text-sm", property.status === "Ocupado" ? "text-primary" : "text-muted-foreground")}
                  >
                    {property.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
