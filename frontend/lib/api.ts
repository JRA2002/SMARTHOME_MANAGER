const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  fullname: string
  password: string
}

export interface User {
  id: number
  email: string
  fullname: string
  is_active: boolean
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface Property {
  id: number
  title: string
  address: string
  type: "house" | "apartment" | "comercial" | "office" | "land"
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  description?: string
  image_url?: string
  user_id: number
  status: "available"| "rented" | "maintenance" | "sold"
  created_at: string
  updated_at: string
}

export interface PropertyCreate {
  title: string
  address: string
  type: "house" | "apartment" | "comercial" | "office" | "land"
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  description?: string
  image_url?: string
}

export interface Rental {
  id: number
  property_id: number
  tenant_name: string
  tenant_email: string
  tenant_phone?: string
  monthly_amount: number
  start_date: string
  end_date?: string | null
  deposit: number
  status: string
  created_at: string
  property?: Property
}

export interface RentalCreate {
  property_id: number
  tenant_name: string
  tenant_email: string
  tenant_phone?: string
  monthly_amount: number
  start_date: string
  end_date?: string
  deposit: number
}

export interface Expense {
  id: number
  property_id: number
  category: string
  description: string
  amount: number
  date: string
  receipt_url?: string
  created_at: string
  property?: Property
}

export interface ExpenseCreate {
  property_id: number
  category: string
  description: string
  amount: number
  date: string
  receipt_url?: string
}

export interface ValuationRequest {
  address: string
  city: string
  type: string
  square_meters: number
  bedrooms: number
  bathrooms: number
  construction_year: number
}

export interface ValuationResponse {
  estimated_value: number
  min_range: number
  max_range: number
  price_per_sqm: number
  address: string
  city: string
  type: string
  square_meters: number
  bedrooms: number
  bathrooms: number
  construction_year: number
  factors?: string[]
}

export interface ChatMessage {
  message: string
}

export interface ChatResponse {
  response: string
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
    const formData = new URLSearchParams()
    formData.append("email", credentials.email)
    formData.append("password", credentials.password)

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
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
    const response = await this.fetchWithAuth("/api/v1/properties")
    if (!response.ok) {
      throw new Error("Failed to fetch properties")
    }
    const result = await response.json();
    return result.data;
  }

  async createProperty(data: PropertyCreate): Promise<Property> {
    const response = await this.fetchWithAuth("/api/v1/properties", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create property")
    }
    return response.json()
  }

  async updateProperty(id: number, data: Partial<PropertyCreate>): Promise<Property> {
    const response = await this.fetchWithAuth(`/api/v1/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to update property")
    }
    return response.json()
  }

  async deleteProperty(id: number): Promise<void> {
    const response = await this.fetchWithAuth(`/api/v1/properties/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete property")
    }
  }

  async getRentals(): Promise<Rental[]> {
    console.log("Fetching rentals from API...");
    const response = await this.fetchWithAuth("/api/v1/rentals")
    console.log("Rentals response:", response);
    if (!response.ok) {
      throw new Error("Failed to fetch rentals")
    }
    return response.json()
  }

  async createRental(data: RentalCreate): Promise<Rental> {
    const response = await this.fetchWithAuth("/api/v1/rentals", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create rental")
    }
    return response.json()
  }

  async updateRental(id: number, data: Partial<RentalCreate>): Promise<Rental> {
    const response = await this.fetchWithAuth(`/api/v1/rentals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to update rental")
    }
    return response.json()
  }

  async deleteRental(id: number): Promise<void> {
    const response = await this.fetchWithAuth(`/api/v1/rentals/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete rental")
    }
  }

  async getExpenses(): Promise<Expense[]> {
    const response = await this.fetchWithAuth("/api/v1/expenses")
    if (!response.ok) {
      throw new Error("Failed to fetch expenses")
    }
    return response.json()
  }

  async createExpense(data: ExpenseCreate): Promise<Expense> {
    const response = await this.fetchWithAuth("/api/v1/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create expense")
    }
    return response.json()
  }

  async updateExpense(id: number, data: Partial<ExpenseCreate>): Promise<Expense> {
    const response = await this.fetchWithAuth(`/api/v1/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to update expense")
    }
    return response.json()
  }

  async deleteExpense(id: number): Promise<void> {
    const response = await this.fetchWithAuth(`/api/v1/expenses/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete expense")
    }
  }

  async getPropertyValuation(data: ValuationRequest): Promise<ValuationResponse> {
    const response = await this.fetchWithAuth("/api/v1/predict-value", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to get valuation")
    }
    return response.json()
  }

  async sendChatMessage(message: string): Promise<ChatResponse> {
    const response = await this.fetchWithAuth("/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    })
    if (!response.ok) {
      throw new Error("Failed to send chat message")
    }
    return response.json()
  }
}

export const apiClient = new ApiClient()