"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient, type Rental, type Property } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface RentalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rental: Rental | null
  onSave: () => void
}

export function RentalDialog({ open, onOpenChange, rental, onSave }: RentalDialogProps) {
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    propiedad_id: "",
    nombre_inquilino: "",
    email_inquilino: "",
    telefono_inquilino: "",
    fecha_inicio: "",
    fecha_fin: "",
    monto_mensual: "",
    deposito: "",
    estado: "activo",
  })

  useEffect(() => {
    if (open) {
      loadProperties()
    }
  }, [open])

  useEffect(() => {
    if (rental) {
      setFormData({
        propiedad_id: rental.propiedad_id.toString(),
        nombre_inquilino: rental.nombre_inquilino,
        email_inquilino: rental.email_inquilino || "",
        telefono_inquilino: rental.telefono_inquilino || "",
        fecha_inicio: rental.fecha_inicio.split("T")[0],
        fecha_fin: rental.fecha_fin.split("T")[0],
        monto_mensual: rental.monto_mensual?.toString() || "",
        deposito: rental.deposito?.toString() || "",
        estado: rental.estado,
      })
    } else {
      setFormData({
        propiedad_id: "",
        nombre_inquilino: "",
        email_inquilino: "",
        telefono_inquilino: "",
        fecha_inicio: "",
        fecha_fin: "",
        monto_mensual: "",
        deposito: "",
        estado: "activo",
      })
    }
  }, [rental, open])

  const loadProperties = async () => {
    try {
      const data = await apiClient.getProperties()
      setProperties(data)
    } catch (error) {
      console.error("Error loading properties:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        propiedad_id: Number.parseInt(formData.propiedad_id),
        nombre_inquilino: formData.nombre_inquilino,
        email_inquilino: formData.email_inquilino || undefined,
        telefono_inquilino: formData.telefono_inquilino || undefined,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        monto_mensual: Number.parseFloat(formData.monto_mensual) || 0,
        deposito: Number.parseFloat(formData.deposito) || 0,
        estado: formData.estado,
      }

      if (rental) {
        await apiClient.updateRental(rental.id, data)
      } else {
        await apiClient.createRental(data)
      }

      onSave()
    } catch (error) {
      console.error("Error saving rental:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rental ? "Editar Alquiler" : "Nuevo Alquiler"}</DialogTitle>
          <DialogDescription>
            {rental ? "Actualiza la información del contrato" : "Crea un nuevo contrato de alquiler"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propiedad_id">Propiedad *</Label>
            <Select
              value={formData.propiedad_id}
              onValueChange={(value) => setFormData({ ...formData, propiedad_id: value })}
            >
              <SelectTrigger id="propiedad_id">
                <SelectValue placeholder="Selecciona una propiedad" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.direccion} - {property.ciudad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre_inquilino">Nombre del Inquilino *</Label>
              <Input
                id="nombre_inquilino"
                value={formData.nombre_inquilino}
                onChange={(e) => setFormData({ ...formData, nombre_inquilino: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_inquilino">Email</Label>
              <Input
                id="email_inquilino"
                type="email"
                value={formData.email_inquilino}
                onChange={(e) => setFormData({ ...formData, email_inquilino: e.target.value })}
                placeholder="inquilino@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono_inquilino">Teléfono</Label>
            <Input
              id="telefono_inquilino"
              value={formData.telefono_inquilino}
              onChange={(e) => setFormData({ ...formData, telefono_inquilino: e.target.value })}
              placeholder="+34 600 000 000"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monto_mensual">Monto Mensual *</Label>
              <Input
                id="monto_mensual"
                type="number"
                step="0.01"
                value={formData.monto_mensual}
                onChange={(e) => setFormData({ ...formData, monto_mensual: e.target.value })}
                placeholder="1200.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposito">Depósito</Label>
              <Input
                id="deposito"
                type="number"
                step="0.01"
                value={formData.deposito}
                onChange={(e) => setFormData({ ...formData, deposito: e.target.value })}
                placeholder="2400.00"
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
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
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
              ) : rental ? (
                "Actualizar"
              ) : (
                "Crear Alquiler"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
