"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api"
import { Loader2, Upload, FileText, X, Plus, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Property } from "@/types/Property"
import type { Expense } from "@/types/expense"

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
  const [aiProcessing, setAiProcessing] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()


  const [formData, setFormData] = useState({
    property_id: "",
    category: "",
    description: "",
    amount: "",
    date: "",
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
      })
      setSelectedFile(null)
      setManualEntry(true)
      setSelectedFile(null)
      setManualEntry(true)
    } else {
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        property_id: "",
        category: "",
        description: "",
        amount: "",
        date: today,
      })
      setSelectedFile(null)
      setManualEntry(false)
      setSelectedFile(null)
      setManualEntry(false)
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

  const analyzeReceiptWithAI = async (file: File) => {
    console.log("[v0] Starting AI analysis for file:", file.name)
    setAiProcessing(true)
    console.log("[v0] aiProcessing state set to true")

    try {
      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2500))

      const today = new Date().toISOString().split("T")[0]
      const extractedData = {
        description: `Gasto procesado desde ${file.name}`,
        amount: "",
        category: "mantenimiento",
        date: today,
      }

      setFormData((prev) => ({
        ...prev,
        description: extractedData.description,
        amount: extractedData.amount,
        category: extractedData.category,
        date: extractedData.date,
      }))

      console.log("[v0] AI analysis completed")

      toast({
        title: "Análisis completado",
        description: "La IA ha procesado tu factura. Verifica los datos antes de guardar.",
      })
    } catch (error) {
      console.error("Error analyzing receipt:", error)
      toast({
        title: "Error en el análisis",
        description: "No se pudo analizar la factura automáticamente",
        variant: "destructive",
      })
    } finally {
      setAiProcessing(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log("[v0] File selected:", file?.name)


    if (file) {
      const validTypes = ["application/pdf"]
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos PDF",
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
      setManualEntry(true)

      await analyzeReceiptWithAI(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedFile && !formData.property_id) {
      toast({
        title: "Propiedad requerida",
        description: "Por favor selecciona una propiedad para el gasto",
        variant: "destructive",
      })
      return
    }


    if (selectedFile && !formData.property_id) {
      toast({
        title: "Propiedad requerida",
        description: "Por favor selecciona una propiedad para el gasto",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (selectedFile) {
        setUploadProgress(true)
        setUploadProgress(false)
      }


      const data = {
        property_id: Number.parseInt(formData.property_id),
        category: formData.category,
        description: formData.description || "Gasto registrado desde archivo",
        amount: formData.amount ? Number.parseFloat(formData.amount) : 0,
        date: formData.date,
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

  console.log(
    "[v0] Render - aiProcessing:",
    aiProcessing,
    "manualEntry:",
    manualEntry,
    "selectedFile:",
    selectedFile?.name,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {aiProcessing && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card border rounded-lg p-8 shadow-lg max-w-sm text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Analizando factura con IA</h3>
                <p className="text-sm text-muted-foreground">Estamos extrayendo la información de tu documento...</p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </div>
          </div>
        )}

      <DialogContent className="max-w-2xl">
        {aiProcessing && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card border rounded-lg p-8 shadow-lg max-w-sm text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Analizando factura con IA</h3>
                <p className="text-sm text-muted-foreground">Estamos extrayendo la información de tu documento...</p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle>{expense ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle>
          <DialogDescription>
            {expense
              ? "Actualiza la información del gasto"
              : manualEntry
                ? "Completa los detalles del gasto"
                : "Sube tu factura o recibo para registrar el gasto"}
            {expense
              ? "Actualiza la información del gasto"
              : manualEntry
                ? "Completa los detalles del gasto"
                : "Sube tu factura o recibo para registrar el gasto"}
          </DialogDescription>
        </DialogHeader>

        {!manualEntry && !expense ? (
          <div className="space-y-6 py-6">
            <div className="flex flex-col items-center justify-center gap-6 p-8 border-2 border-dashed rounded-lg bg-muted/30">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Sube tu Factura o Recibo</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  La IA extraerá automáticamente los datos de tu documento
                </p>
                <p className="text-xs text-muted-foreground">Formatos: PDF (máx. 5MB)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                type="button"
                size="lg"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={aiProcessing}
              >
                <Upload className="h-5 w-5" />
                Seleccionar Archivo
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">o</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 bg-transparent"
              onClick={() => setManualEntry(true)}
              disabled={aiProcessing}
            >
              <Plus className="h-4 w-4" />
              Ingresar Manualmente
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedFile(null)
                    if (!expense) setManualEntry(false)
                  }}
                  disabled={aiProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="property_id">Propiedad *</Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                disabled={aiProcessing}
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
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={aiProcessing}
              >
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
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={aiProcessing}
              >
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
              <Label htmlFor="description">Descripción {!selectedFile && "*"}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Reparación de tubería en el baño principal"
                rows={3}
                required={!selectedFile}
                disabled={aiProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción {!selectedFile && "*"}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Reparación de tubería en el baño principal"
                rows={3}
                required={!selectedFile}
                disabled={aiProcessing}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto {!selectedFile && "*"}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="150.00"
                  required={!selectedFile}
                  disabled={aiProcessing}
                />
              </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto {!selectedFile && "*"}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="150.00"
                  required={!selectedFile}
                  disabled={aiProcessing}
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
                  disabled={aiProcessing}
                />
              </div>
            </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  disabled={aiProcessing}
                />
              </div>
            </div>

            {!selectedFile && (
              <div className="space-y-2">
                <Label>Recibo / Factura (Opcional)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Subir Archivo (PDF)
                </Button>

                {/* {formData.receipt_url && (
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
                )} */}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || aiProcessing}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || uploadProgress || aiProcessing}>
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
        )}
      </DialogContent>
    </Dialog>
  )
}