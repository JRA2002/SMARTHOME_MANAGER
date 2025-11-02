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
    property_id: "",
    tenant_name: "",
    tenant_email: "",
    tenant_phone: "",
    start_date: "",
    end_date: "",
    monthly_amount: "",
    deposit: "",
  })

  useEffect(() => {
    if (open) {
      loadProperties()
    }
  }, [open])

  useEffect(() => {
    if (rental) {
      setFormData({
        property_id: rental.property_id.toString(),
        tenant_name: rental.tenant_name,
        tenant_email: rental.tenant_email,
        tenant_phone: rental.tenant_phone || "",
        start_date: rental.start_date.split("T")[0],
        end_date: rental.end_date ? rental.end_date.split("T")[0] : "",
        monthly_amount: rental.monthly_amount.toString(),
        deposit: rental.deposit.toString(),
      })
    } else {
      setFormData({
        property_id: "",
        tenant_name: "",
        tenant_email: "",
        tenant_phone: "",
        start_date: "",
        end_date: "",
        monthly_amount: "",
        deposit: "",
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
        property_id: Number.parseInt(formData.property_id),
        tenant_name: formData.tenant_name,
        tenant_email: formData.tenant_email,
        tenant_phone: formData.tenant_phone || undefined,
        monthly_amount: Number.parseFloat(formData.monthly_amount),
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        deposit: Number.parseFloat(formData.deposit),
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
            <Label htmlFor="property_id">Propiedad *</Label>
            <Select
              value={formData.property_id}
              onValueChange={(value) => setFormData({ ...formData, property_id: value })}
            >
              <SelectTrigger id="property_id">
                <SelectValue placeholder="Selecciona una propiedad" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.title} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant_name">Nombre del Inquilino *</Label>
              <Input
                id="tenant_name"
                value={formData.tenant_name}
                onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant_email">Email *</Label>
              <Input
                id="tenant_email"
                type="email"
                value={formData.tenant_email}
                onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
                placeholder="inquilino@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant_phone">Teléfono</Label>
            <Input
              id="tenant_phone"
              value={formData.tenant_phone}
              onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
              placeholder="+34 600 000 000"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de Inicio *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthly_amount">Monto Mensual *</Label>
              <Input
                id="monthly_amount"
                type="number"
                step="0.01"
                value={formData.monthly_amount}
                onChange={(e) => setFormData({ ...formData, monthly_amount: e.target.value })}
                placeholder="1200.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Depósito *</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                placeholder="2400.00"
                required
              />
            </div>
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

