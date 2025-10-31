"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, TrendingUp, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AIValuation() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [valuation, setValuation] = useState<number | null>(null)

  const handleCalculate = () => {
    setIsCalculating(true)
    // Simulate AI calculation
    setTimeout(() => {
      setValuation(Math.floor(Math.random() * 200000) + 150000)
      setIsCalculating(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Valoración IA</h1>
        <p className="text-muted-foreground mt-1">
          Obtén una estimación del valor de mercado usando inteligencia artificial
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Datos de la Propiedad
            </CardTitle>
            <CardDescription>Completa la información para obtener una valoración precisa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" placeholder="Ej: Av. Santa Fe 3500, Buenos Aires" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Propiedad</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="loft">Loft</SelectItem>
                    <SelectItem value="studio">Estudio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Área (m²)</Label>
                <Input id="area" type="number" placeholder="85" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Habitaciones</Label>
                <Input id="bedrooms" type="number" placeholder="2" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input id="bathrooms" type="number" placeholder="2" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Antigüedad (años)</Label>
                <Input id="age" type="number" placeholder="10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities</Label>
              <Select>
                <SelectTrigger id="amenities">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="standard">Estándar</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full gap-2" onClick={handleCalculate} disabled={isCalculating}>
              {isCalculating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Calculando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Calcular Valoración
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Valoración Estimada</CardTitle>
              <CardDescription>Basada en datos de mercado y análisis predictivo</CardDescription>
            </CardHeader>
            <CardContent>
              {valuation ? (
                <div className="space-y-6">
                  <div className="rounded-lg bg-primary/10 p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Valor estimado</p>
                    <p className="text-4xl font-bold text-primary">${valuation.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-2">USD</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <span className="text-sm text-muted-foreground">Rango mínimo</span>
                      <span className="font-semibold text-foreground">${(valuation * 0.9).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <span className="text-sm text-muted-foreground">Rango máximo</span>
                      <span className="font-semibold text-foreground">${(valuation * 1.1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Completa el formulario para obtener una valoración</p>
                </div>
              )}
            </CardContent>
          </Card>

          {valuation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Factores Clave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Ubicación</p>
                    <p className="text-sm text-muted-foreground">Zona premium con alta demanda</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Tendencia de mercado</p>
                    <p className="text-sm text-muted-foreground">Crecimiento del 8% en el último año</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
