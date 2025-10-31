"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api"
import { Building2, Loader2 } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await apiClient.register(formData)
      router.push("/login?registered=true")
    } catch (err) {
      setError("Error al registrar. El usuario o email ya existe.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md border-2 shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-2">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-balance">Crear Cuenta</CardTitle>
          <CardDescription className="text-base">Únete a SmartHome Manager hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="nombre completo"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-11"
              />
            </div>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
