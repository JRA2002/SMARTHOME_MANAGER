"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, MapPin, Home } from "lucide-react"
import { PropertyDialog } from "@/components/property-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { apiClient} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Property } from "@/types/Property"
import { EditableStatusCell } from "@/components/editablestatuscell"

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const data = await apiClient.getProperties()
      setProperties(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las propiedades",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedProperty(null)
    setDialogOpen(true)
  }

  const handleEdit = (property: Property) => {
    setSelectedProperty(property)
    setDialogOpen(true)
  }

  const handleDelete = (property: Property) => {
    setSelectedProperty(property)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProperty) return

    try {
      await apiClient.deleteProperty(selectedProperty.id)
      toast({
        title: "Éxito",
        description: "Propiedad eliminada correctamente",
      })
      loadProperties()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la propiedad",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedProperty(null)
    }
  }

  const handleSave = async () => {
    setDialogOpen(false)
    await loadProperties()
    toast({
      title: "Éxito",
      description: selectedProperty ? "Propiedad actualizada correctamente" : "Propiedad creada correctamente",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      disponible: "default",
      alquilada: "secondary",
      mantenimiento: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">Propiedades</h1>
            <p className="text-muted-foreground text-lg">Gestiona tu portfolio de propiedades</p>
          </div>
          <Button onClick={handleAdd} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Nueva Propiedad
          </Button>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Lista de Propiedades
            </CardTitle>
            <CardDescription>
              {properties.length} {properties.length === 1 ? "propiedad registrada" : "propiedades registradas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando propiedades...</div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No hay propiedades registradas</p>
                <Button onClick={handleAdd} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Propiedad
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    
                    {Array.isArray(properties) &&
                    properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="font-medium">{property.address}</div>
                              {property.address&& (
                                <div className="text-sm text-muted-foreground">{property.address}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{property.type}</TableCell>
                        <TableCell className="font-semibold">${property.price?.toLocaleString() || "N/A"}</TableCell>
                        <TableCell>
                          <EditableStatusCell
                            propertyId={property.id}
                            initialStatus={property.status}
                            onStatusChange={(newStatus) => console.log("Nuevo estado:", newStatus)}
                          />
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(property)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(property)}
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

      <PropertyDialog open={dialogOpen} onOpenChange={setDialogOpen} property={selectedProperty} onSave={handleSave} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Propiedad"
        description={`¿Estás seguro de que deseas eliminar la propiedad "${selectedProperty?.address}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  )
}