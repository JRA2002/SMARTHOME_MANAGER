const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  fullname?: string
}

export interface User {
  id: number
  email: string
  username: string
  fullname?: string
  is_active: boolean
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface Property {
  id: number
  direccion: string
  ciudad?: string
  tipo: string
  precio_alquiler?: number
  estado: string
  descripcion?: string
  propietario_id: number
}

export interface PropertyCreate {
  direccion: string
  ciudad?: string
  tipo: string
  precio_alquiler?: number
  estado: string
  descripcion?: string
}

export interface Rental {
  id: number
  propiedad_id: number
  nombre_inquilino: string
  email_inquilino?: string
  telefono_inquilino?: string
  fecha_inicio: string
  fecha_fin: string
  monto_mensual?: number
  deposito?: number
  estado: string
  propiedad?: Property
}

export interface RentalCreate {
  propiedad_id: number
  nombre_inquilino: string
  email_inquilino?: string
  telefono_inquilino?: string
  fecha_inicio: string
  fecha_fin: string
  monto_mensual?: number
  deposito?: number
  estado: string
}

export interface Expense {
  id: number
  propiedad_id: number
  descripcion: string
  monto?: number
  fecha: string
  categoria: string
  notas?: string
  propiedad?: Property
}

export interface ExpenseCreate {
  propiedad_id: number
  descripcion: string
  monto?: number
  fecha: string
  categoria: string
  notas?: string
}

export interface ValuationRequest {
  direccion: string
  ciudad: string
  tipo: string
  metros_cuadrados: number
  habitaciones: number
  banos: number
  ano_construccion: number
}

export interface ValuationResponse {
  valor_estimado: number
  rango_minimo: number
  rango_maximo: number
  precio_por_m2: number
  direccion: string
  ciudad: string
  tipo: string
  metros_cuadrados: number
  habitaciones: number
  banos: number
  ano_construccion: number
  factores?: string[]
}

export interface ChatMessage {
  mensaje: string
}

export interface ChatResponse {
  respuesta: string
}

class ApiClient {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (includeAuth) {
      const token = localStorage.getItem("access_token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    return headers
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
  
    const response = await fetch(`${API_BASE_URL}/api/v1/propiedades/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    const data = await response.json()
    localStorage.setItem("access_token", data.access_token)
    return data
  }

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/v1/propiedades/auth/register`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Registration failed")
    }
    return response.json()
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/v1/propiedades/auth/me`, {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get user")
    }

    return response.json()
  }

  async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (response.status === 401) {
      localStorage.removeItem("access_token")
      window.location.href = "/login"
      throw new Error("Unauthorized")
    }

    return response
  }

  logout() {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }

  async getProperties(): Promise<Property[]> {
    const response = await this.fetchWithAuth("/api/v1/propiedades/propiedades")
    if (!response.ok) {
      throw new Error("Failed to fetch properties")
    }
    return response.json()
  }

  async createProperty(data: PropertyCreate): Promise<Property> {
    const response = await this.fetchWithAuth("/api/v1/propiedades/propiedades", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create property")
    }
    return response.json()
  }

  async updateProperty(id: number, data: Partial<PropertyCreate>): Promise<Property> {
    const response = await this.fetchWithAuth(`/api/v1/propiedades/propiedades/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to update property")
    }
    return response.json()
  }

  async deleteProperty(id: number): Promise<void> {
    const response = await this.fetchWithAuth(`/api/v1/propiedades/propiedades/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete property")
    }
  }

  async getRentals(): Promise<Rental[]> {
    const response = await this.fetchWithAuth("/api/v1/propiedades/alquileres")
    if (!response.ok) {
      throw new Error("Failed to fetch rentals")
    }
    return response.json()
  }

  async createRental(data: RentalCreate): Promise<Rental> {
    const response = await this.fetchWithAuth("/api/v1/propiedades/alquileres", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create rental")
    }
    return response.json()
  }

  async updateRental(id: number, data: Partial<RentalCreate>): Promise<Rental> {
    const response = await this.fetchWithAuth(`/api/v1/propiedades/alquileres/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to update rental")
    }
    return response.json()
  }

  async deleteRental(id: number): Promise<void> {
    const response = await this.fetchWithAuth(`/api/v1/propiedades/alquileres/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete rental")
    }
  }

  async getExpenses(): Promise<Expense[]> {
    const response = await this.fetchWithAuth("/api/v1/propiedades/gastos")
    if (!response.ok) {
      throw new Error("Failed to fetch expenses")
    }
    return response.json()
  }

  async createExpense(data: ExpenseCreate): Promise<Expense> {
    const response = await this.fetchWithAuth("/api/v1/propiedades/gastos", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create expense")
    }
    return response.json()
  }

  async updateExpense(id: number, data: Partial<ExpenseCreate>): Promise<Expense> {
    const response = await this.fetchWithAuth(`/api/v1/propiedades/gastos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to update expense")
    }
    return response.json()
  }

  async deleteExpense(id: number): Promise<void> {
    const response = await this.fetchWithAuth(`/api/v1/propiedades/gastos/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete expense")
    }
  }

  async getPropertyValuation(data: ValuationRequest): Promise<ValuationResponse> {
    const response = await this.fetchWithAuth("/api/v1/propiedades/ia/valoracion", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to get valuation")
    }
    return response.json()
  }

  async sendChatMessage(mensaje: string): Promise<ChatResponse> {
    const response = await this.fetchWithAuth("/api/v1/propiedades/ia/chat", {
      method: "POST",
      body: JSON.stringify({ mensaje }),
    })
    if (!response.ok) {
      throw new Error("Failed to send chat message")
    }
    return response.json()
  }
}

export const apiClient = new ApiClient()
