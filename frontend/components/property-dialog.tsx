"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiClient, type Property } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface PropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property | null
  onSave: () => void
}

export function PropertyDialog({ open, onOpenChange, property, onSave }: PropertyDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    direccion: "",
    ciudad: "",
    tipo: "casa",
    precio_alquiler: "",
    estado: "disponible",
    descripcion: "",
  })

  useEffect(() => {
    if (property) {
      setFormData({
        direccion: property.direccion,
        ciudad: property.ciudad || "",
        tipo: property.tipo,
        precio_alquiler: property.precio_alquiler?.toString() || "",
        estado: property.estado,
        descripcion: property.descripcion || "",
      })
    } else {
      setFormData({
        direccion: "",
        ciudad: "",
        tipo: "casa",
        precio_alquiler: "",
        estado: "disponible",
        descripcion: "",
      })
    }
  }, [property, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        precio_alquiler: Number.parseFloat(formData.precio_alquiler) || 0,
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Calle Principal 123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Madrid"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Propiedad *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger id="tipo">
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

            <div className="space-y-2">
              <Label htmlFor="precio_alquiler">Precio de Alquiler *</Label>
              <Input
                id="precio_alquiler"
                type="number"
                step="0.01"
                value={formData.precio_alquiler}
                onChange={(e) => setFormData({ ...formData, precio_alquiler: e.target.value })}
                placeholder="1200.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado *</Label>
            <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
              <SelectTrigger id="estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="alquilada">Alquilada</SelectItem>
                <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción detallada de la propiedad..."
              rows={4}
            />
          </div>

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
