"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiClient} from "@/lib/api"
import type { Expense } from "@/types/expense"
import type { Property } from "@/types/Property"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, FileText, X } from "lucide-react"

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  onSave: () => void
}

export function ExpenseDialog({ open, onOpenChange, expense, onSave }: ExpenseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    property_id: "",
    category: "mantenimiento",
    description: "",
    amount: "",
    date: "",
    receipt_url: "",
  })

  useEffect(() => {
    if (open) {
      loadProperties()
    }
  }, [open])

  useEffect(() => {
    if (expense) {
      setFormData({
        property_id: expense.property_id.toString(),
        category: expense.category,
        description: expense.description,
        amount: expense.amount.toString(),
        date: expense.date.split("T")[0],
        receipt_url: expense.receipt_url || "",
      })
    } else {
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        property_id: "",
        category: "mantenimiento",
        description: "",
        amount: "",
        date: today,
        receipt_url: "",
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos PDF, JPG o PNG",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no debe superar los 5MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return `https://storage.example.com/receipts/${Date.now()}-${file.name}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let receiptUrl = formData.receipt_url
      if (selectedFile) {
        setUploadProgress(true)
        receiptUrl = await uploadFile(selectedFile)
        setUploadProgress(false)
      }
      const data = {
        property_id: Number.parseInt(formData.property_id),
        category: formData.category,
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        date: formData.date,
        receipt_url: formData.receipt_url || undefined,
      }

      if (expense) {
        await apiClient.updateExpense(expense.id, data)
      } else {
        await apiClient.createExpense(data)
      }

      onSave()
    } catch (error) {
      console.error("Error saving expense:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el gasto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadProgress(false)
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

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger id="category">
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
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Reparación de tubería en el baño principal"
              rows={3}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="150.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recibo / Factura</Label>
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Subir Archivo (PDF, JPG, PNG)
                </Button>
              )}

              {formData.receipt_url && !selectedFile && (
                <div className="text-sm text-muted-foreground">
                  <a
                    href={formData.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    Ver recibo actual
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploadProgress}>
              {loading || uploadProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress ? "Subiendo..." : "Guardando..."}
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

