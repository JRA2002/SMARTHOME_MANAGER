"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, FileText, Calendar, User } from "lucide-react"
import { RentalDialog } from "@/components/rental-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { apiClient, type Rental } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadRentals()
  }, [])

  const loadRentals = async () => {
    try {
      const data = await apiClient.getRentals()
      setRentals(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los alquileres",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedRental(null)
    setDialogOpen(true)
  }

  const handleEdit = (rental: Rental) => {
    setSelectedRental(rental)
    setDialogOpen(true)
  }

  const handleDelete = (rental: Rental) => {
    setSelectedRental(rental)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedRental) return

    try {
      await apiClient.deleteRental(selectedRental.id)
      toast({
        title: "Éxito",
        description: "Alquiler eliminado correctamente",
      })
      loadRentals()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el alquiler",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedRental(null)
    }
  }

  const handleSave = async () => {
    setDialogOpen(false)
    await loadRentals()
    toast({
      title: "Éxito",
      description: selectedRental ? "Alquiler actualizado correctamente" : "Alquiler creado correctamente",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      activo: "default",
      finalizado: "secondary",
      pendiente: "destructive",
    }
    const labels: Record<string, string> = {
      activo: "Activo",
      finalizado: "Finalizado",
      pendiente: "Pendiente",
    }
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">Alquileres</h1>
            <p className="text-muted-foreground text-lg">Gestiona contratos y pagos de alquiler</p>
          </div>
          <Button onClick={handleAdd} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Alquiler
          </Button>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contratos de Alquiler
            </CardTitle>
            <CardDescription>
              {rentals.length} {rentals.length === 1 ? "contrato registrado" : "contratos registrados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando alquileres...</div>
            ) : rentals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No hay contratos de alquiler registrados</p>
                <Button onClick={handleAdd} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Contrato
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Inquilino</TableHead>
                      <TableHead>Propiedad</TableHead>
                      <TableHead>Fechas</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentals.map((rental) => (
                      <TableRow key={rental.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{rental.nombre_inquilino}</div>
                              {rental.email_inquilino && (
                                <div className="text-sm text-muted-foreground">{rental.email_inquilino}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {rental.propiedad?.direccion || `Propiedad #${rental.propiedad_id}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{formatDate(rental.fecha_inicio)}</div>
                              <div className="text-muted-foreground">{formatDate(rental.fecha_fin)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">${rental.monto_mensual?.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(rental.estado)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(rental)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(rental)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RentalDialog open={dialogOpen} onOpenChange={setDialogOpen} rental={selectedRental} onSave={handleSave} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Alquiler"
        description={`¿Estás seguro de que deseas eliminar el contrato de alquiler con ${selectedRental?.nombre_inquilino}? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  )
}
