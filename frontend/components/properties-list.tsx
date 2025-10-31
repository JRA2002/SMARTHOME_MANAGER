"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MapPin, Bed, Bath, Maximize } from "lucide-react"

const properties = [
  {
    id: 1,
    name: "Apartamento Palermo",
    address: "Av. Santa Fe 3500, Buenos Aires",
    type: "Apartamento",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    rent: 1800,
    status: "Ocupado",
    image: "/modern-apartment-living.png",
  },
  {
    id: 2,
    name: "Casa Belgrano",
    address: "Calle Juramento 2100, Buenos Aires",
    type: "Casa",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    rent: 2500,
    status: "Ocupado",
    image: "/modern-house.png",
  },
  {
    id: 3,
    name: "Loft Recoleta",
    address: "Av. Callao 1200, Buenos Aires",
    type: "Loft",
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    rent: 2200,
    status: "Disponible",
    image: "/modern-loft.png",
  },
  {
    id: 4,
    name: "Departamento Caballito",
    address: "Av. Rivadavia 5200, Buenos Aires",
    type: "Apartamento",
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    rent: 1500,
    status: "Ocupado",
    image: "/modern-apartment-building.png",
  },
  {
    id: 5,
    name: "Estudio Microcentro",
    address: "Av. Corrientes 800, Buenos Aires",
    type: "Estudio",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    rent: 1200,
    status: "Mantenimiento",
    image: "/cozy-studio-apartment.png",
  },
  {
    id: 6,
    name: "Casa Núñez",
    address: "Av. Cabildo 3800, Buenos Aires",
    type: "Casa",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    rent: 3200,
    status: "Disponible",
    image: "/cozy-family-house.png",
  },
]

export function PropertiesList() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Propiedades</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu cartera de propiedades</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Propiedad
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar propiedades..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Properties Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={property.image || "/placeholder.svg"}
                alt={property.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-foreground">{property.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {property.address}
                  </div>
                </div>
                <Badge
                  variant={
                    property.status === "Ocupado"
                      ? "default"
                      : property.status === "Disponible"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {property.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Maximize className="h-4 w-4" />
                      <span>{property.area}m²</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Renta mensual</p>
                    <p className="text-xl font-bold text-foreground">${property.rent.toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
