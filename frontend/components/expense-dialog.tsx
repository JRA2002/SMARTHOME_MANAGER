"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiClient, type Expense, type Property } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  onSave: () => void
}

export function ExpenseDialog({ open, onOpenChange, expense, onSave }: ExpenseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    propiedad_id: "",
    descripcion: "",
    monto: "",
    fecha: "",
    categoria: "mantenimiento",
    notas: "",
  })

  useEffect(() => {
    if (open) {
      loadProperties()
    }
  }, [open])

  useEffect(() => {
    if (expense) {
      setFormData({
        propiedad_id: expense.propiedad_id.toString(),
        descripcion: expense.descripcion,
        monto: expense.monto?.toString() || "",
        fecha: expense.fecha.split("T")[0],
        categoria: expense.categoria,
        notas: expense.notas || "",
      })
    } else {
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        propiedad_id: "",
        descripcion: "",
        monto: "",
        fecha: today,
        categoria: "mantenimiento",
        notas: "",
      })
    }
  }, [expense, open])

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
        descripcion: formData.descripcion,
        monto: Number.parseFloat(formData.monto) || 0,
        fecha: formData.fecha,
        categoria: formData.categoria,
        notas: formData.notas || undefined,
      }

      if (expense) {
        await apiClient.updateExpense(expense.id, data)
      } else {
        await apiClient.createExpense(data)
      }

      onSave()
    } catch (error) {
      console.error("Error saving expense:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle>
          <DialogDescription>
            {expense ? "Actualiza la información del gasto" : "Registra un nuevo gasto para tu propiedad"}
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

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Reparación de tubería"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto *</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                placeholder="150.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData({ ...formData, categoria: value })}
            >
              <SelectTrigger id="categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="reparacion">Reparación</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
                <SelectItem value="impuestos">Impuestos</SelectItem>
                <SelectItem value="seguro">Seguro</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Notas adicionales sobre el gasto..."
              rows={3}
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
              ) : expense ? (
                "Actualizar"
              ) : (
                "Registrar Gasto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
