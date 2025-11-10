"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Calendar, Shield, Lock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { apiClient } from "@/lib/api"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    id: user?.id,
    fullname: "",
    email: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
    
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await apiClient.updateProfile(profileData)

      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      })
      return
    }

    setPasswordLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await apiClient.updatePassword(passwordData)

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente",
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña",
        variant: "destructive",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-4xl font-bold text-balance mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground text-lg">Administra tu información personal y configuración</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Detalles de tu cuenta</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Miembro desde:</span>
                <span className="font-medium">{format(new Date(user.created_at), "dd MMM yyyy", { locale: es })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Estado:</span>
                <span className={`font-medium ${user.is_active ? "text-green-600" : "text-red-600"}`}>
                  {user.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                <Lock className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>Protege tu cuenta</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Autenticación JWT</p>
                  <p className="text-xs text-muted-foreground">Token de acceso seguro</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Última sesión</p>
                  <p className="text-xs text-muted-foreground">Hace unos minutos</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Actualizar Información</CardTitle>
            <CardDescription>Cambia tu nombre y email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={profileData.fullname}
                    onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="juan@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña para mayor seguridad</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={passwordLoading} variant="secondary">
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    "Cambiar Contraseña"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}