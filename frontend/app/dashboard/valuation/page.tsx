"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, TrendingUp, MapPin, Home, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ValuationPage() {
  const [loading, setLoading] = useState(false)
  const [valuation, setValuation] = useState<any>(null)
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    type: "casa",
    square_meters: "",
    bedrooms: "",
    bathrooms: "",
    construction_year: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        square_meters: Number.parseFloat(formData.square_meters) || 0,
        bedrooms: Number.parseInt(formData.bedrooms) || 0,
        bathrooms: Number.parseInt(formData.bathrooms) || 0,
        construction_year: Number.parseInt(formData.construction_year) || 0,
      }

      const result = await apiClient.getPropertyValuation(data)
      setValuation(result)
      toast({
        title: "Valoración Completada",
        description: "La IA ha calculado el valor estimado de la propiedad",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo calcular la valoración",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-balance mb-2">Valoración IA</h1>
          <p className="text-muted-foreground text-lg">
            Calcula el valor de mercado de propiedades con inteligencia artificial
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Datos de la Propiedad
              </CardTitle>
              <CardDescription>Ingresa los detalles para obtener una valoración precisa</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle Principal 123"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Madrid"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Propiedad *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="local">Local Comercial</SelectItem>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="square_meters">Metros Cuadrados *</Label>
                    <Input
                      id="square_meters"
                      type="number"
                      value={formData.square_meters}
                      onChange={(e) => setFormData({ ...formData, square_meters: e.target.value })}
                      placeholder="120"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Habitaciones *</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      placeholder="3"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Baños *</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      placeholder="2"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="construction_year">Año de Construcción *</Label>
                    <Input
                      id="construction_year"
                      type="number"
                      value={formData.construction_year}
                      onChange={(e) => setFormData({ ...formData, construction_year: e.target.value })}
                      placeholder="2015"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Calculando Valoración...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Calcular Valoración
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {valuation ? (
              <>
                <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Valoración Estimada
                    </CardTitle>
                    <CardDescription>Basado en análisis de mercado con IA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold text-primary mb-4">
                      ${valuation.estimated_value?.toLocaleString()}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <span className="text-sm text-muted-foreground">Rango Mínimo</span>
                        <span className="font-semibold">${valuation.min_range?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <span className="text-sm text-muted-foreground">Rango Máximo</span>
                        <span className="font-semibold">${valuation.max_range?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <span className="text-sm text-muted-foreground">Precio por m²</span>
                        <span className="font-semibold">${valuation.price_per_sqm?.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Detalles de la Propiedad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ubicación</span>
                      <span className="font-medium">
                        {valuation.address}, {valuation.city}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tipo</span>
                      <span className="font-medium capitalize">{valuation.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Superficie</span>
                      <span className="font-medium">{valuation.square_meters} m²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Habitaciones</span>
                      <span className="font-medium">{valuation.bedrooms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Baños</span>
                      <span className="font-medium">{valuation.bathrooms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Año</span>
                      <span className="font-medium">{valuation.construction_year}</span>
                    </div>
                  </CardContent>
                </Card>

                {valuation.factors && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Factores de Valoración
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {valuation.factors.map((factor: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-muted-foreground">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-2">
                    Completa el formulario para obtener una valoración
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    Nuestra IA analizará los datos y calculará el valor estimado
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

