import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { apiClient }from "@/lib/api"
import clsx from "clsx"

interface EditableStatusCellProps {
  propertyId: number
  initialStatus: string
  onStatusChange?: (newStatus: string) => void
}

export function EditableStatusCell({ propertyId, initialStatus, onStatusChange }: EditableStatusCellProps) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const statusColors: Record<string, string> = {
    available: "text-blue-600",
    rented: "text-yellow-600",
    maintenance: "text-red-600",
    sold: "text-gray-600",
  }

  const handleChange = async (value: string) => {
    setStatus(value)
    setLoading(true)

    try {
      const response = await apiClient.updatePropertyStatus(propertyId, value)
      if (!response.ok) throw new Error("Error al actualizar el estado")

      toast({
        title: "Estado actualizado",
        description: `La propiedad ahora está en estado: ${value}`,
      })

      onStatusChange?.(value)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className={clsx("w-[150px] font-medium border-none focus:ring-0 font-semibold", statusColors[status])}>
        <SelectValue placeholder="Seleccionar estado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="available">Activo</SelectItem>
        <SelectItem value="sold">Vendida</SelectItem>
        <SelectItem value="rented">Alquilado</SelectItem>
        <SelectItem value="maintenance">Mantenimiento</SelectItem>
      </SelectContent>
    </Select>
  )
}