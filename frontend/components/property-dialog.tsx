"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiClient} from "@/lib/api"
import { Loader2 } from "lucide-react"
import type { Property } from "@/types/Property"

interface PropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property | null
  onSave: () => void
}

export function PropertyDialog({ open, onOpenChange, property, onSave }: PropertyDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    city: "",
    type: "house" as "house" | "apartment" | "comercial" | "office" | "land",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    image_url: "",
  })

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        address: property.address,
        city: property.city,
        type: property.type,
        price: property.price.toString(),
        area: property.area.toString(),
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        description: property.description || "",
        image_url: property.image_url || "",
      })
    } else {
      setFormData({
        title: "",
        address: "",
        city: "",
        type: "house",
        price: "",
        area: "",
        bedrooms: "",
        bathrooms: "",
        description: "",
        image_url: "",
      })
    }
  }, [property, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        title: formData.title,
        address: formData.address,
        city: formData.city,
        type: formData.type,
        price: Number.parseFloat(formData.price),
        area: Number.parseFloat(formData.area),
        bedrooms: Number.parseInt(formData.bedrooms),
        bathrooms: Number.parseInt(formData.bathrooms),
        description: formData.description || undefined,
        image_url: formData.image_url || undefined,
      }

      if (property) {
        await apiClient.updateProperty(property.id, data)
      } else {
        await apiClient.createProperty(data)
      }

      onSave()
    } catch (error) {
      console.error("Error saving property:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property ? "Editar Propiedad" : "Nueva Propiedad"}</DialogTitle>
          <DialogDescription>
            {property ? "Actualiza la información de la propiedad" : "Agrega una nueva propiedad a tu portfolio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Apartamento moderno en el centro"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle Principal 456"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Ciudad *</Label>
              <Input
                id="address"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Madrid"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Propiedad *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="comercial">Local Comercial</SelectItem>
                  <SelectItem value="office">Oficina</SelectItem>
                  <SelectItem value="land">Terreno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="250000.00"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="area">Área (m²) *</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="120.50"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada de la propiedad..."
              rows={4}
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="image_url">URL de Imagen</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://imagen.com/imagen.jpg"
            />
          </div> */}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : property ? (
                "Actualizar"
              ) : (
                "Crear Propiedad"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

