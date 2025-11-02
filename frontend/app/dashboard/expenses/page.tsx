"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, DollarSign, TrendingDown, Calendar } from "lucide-react"
import { ExpenseDialog } from "@/components/expense-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { apiClient, type Expense } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const data = await apiClient.getExpenses()
      setExpenses(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los gastos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedExpense(null)
    setDialogOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setDialogOpen(true)
  }

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedExpense) return

    try {
      await apiClient.deleteExpense(selectedExpense.id)
      toast({
        title: "Éxito",
        description: "Gasto eliminado correctamente",
      })
      loadExpenses()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedExpense(null)
    }
  }

  const handleSave = async () => {
    setDialogOpen(false)
    await loadExpenses()
    toast({
      title: "Éxito",
      description: selectedExpense ? "Gasto actualizado correctamente" : "Gasto registrado correctamente",
    })
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      mantenimiento: "bg-chart-1 text-primary-foreground",
      reparacion: "bg-chart-2 text-accent-foreground",
      servicios: "bg-chart-3 text-primary-foreground",
      impuestos: "bg-chart-4 text-primary-foreground",
      seguro: "bg-chart-5 text-primary-foreground",
      otro: "bg-muted text-muted-foreground",
    }
    const labels: Record<string, string> = {
      mantenimiento: "Mantenimiento",
      reparacion: "Reparación",
      servicios: "Servicios",
      impuestos: "Impuestos",
      seguro: "Seguro",
      otro: "Otro",
    }
    return (
      <Badge className={colors[category] || colors.otro} variant="outline">
        {labels[category] || category}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">Gastos</h1>
            <p className="text-muted-foreground text-lg">Registra y controla los gastos de tus propiedades</p>
          </div>
          <Button onClick={handleAdd} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Gasto
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Gastos</CardTitle>
              <DollarSign className="h-5 w-5 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Todos los gastos registrados</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Este Mes</CardTitle>
              <TrendingDown className="h-5 w-5 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                $
                {expenses
                  .filter((e) => {
                    const expenseDate = new Date(e.date)
                    const now = new Date()
                    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
                  })
                  .reduce((sum, e) => sum + (e.amount || 0), 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Gastos del mes actual</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Registros</CardTitle>
              <Calendar className="h-5 w-5 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{expenses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Gastos registrados</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Registro de Gastos
            </CardTitle>
            <CardDescription>
              {expenses.length} {expenses.length === 1 ? "gasto registrado" : "gastos registrados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando gastos...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No hay gastos registrados</p>
                <Button onClick={handleAdd} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Gasto
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Propiedad</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <div className="font-medium">{expense.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {expense.property?.address || `Propiedad #${expense.property_id}`}
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(expense.date)}</TableCell>
                        <TableCell className="font-semibold text-destructive">
                          -${expense.amount?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(expense)}
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

      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} expense={selectedExpense} onSave={handleSave} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Gasto"
        description={`¿Estás seguro de que deseas eliminar el gasto "${selectedExpense?.description}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  )
}

