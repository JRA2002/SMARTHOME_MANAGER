import type { Property, PropertyCreate } from "@/types/Property"
import type { Rental, RentalCreate } from "@/types/rental"
import type { ValuationRequest, ValuationResponse } from "@/types/valuation"
import type { ChatResponse } from "@/types/chat"
import type { User, LoginCredentials, AuthResponse, RegisterData } from "@/types/auth"
import type { Expense, ExpenseCreate } from "@/types/expense"
import type { Summary } from "@/types/summary"
import type { Activity } from "@/types/activity"
import type { Expirations } from "@/types/expirations"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

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
    console.log("Login response data:", data)
    localStorage.setItem("access_token", data.access_token)
    return data
  }

  async register(data: RegisterData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Registration failed")
    }
   await this.login({
      email: data.email,
      password: data.password,
    })
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

  async updatePropertyStatus(propertyId: number, status: string): Promise<Response> {
    return this.fetchWithAuth(`/api/v1/properties/${propertyId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
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
    const response = await this.fetchWithAuth("/api/v1/rentals")
    if (!response.ok) {
      throw new Error("Failed to fetch rentals")
    }
    const result = await response.json();
    return result.data;
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
    const result = await response.json();
    return result.data;
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

  async sendChatMessage(message: string, history: { role: string; content: string }[]): Promise<ChatResponse> {
    const response = await this.fetchWithAuth("/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    })
    if (!response.ok) {
      throw new Error("Failed to send chat message")
    }
    return response.json()
  }

  async getSummary(): Promise<Summary> {
    const response = await this.fetchWithAuth("/api/v1/summary")
    if (!response.ok) {
      throw new Error("Failed to fetch rentals")
    }
    const data = await response.json()
    if (!data.value || !data.change) {
      throw new Error("Invalid summary response format")
    }

    return data as Summary
  }

  async getRecentActivities(): Promise<Activity[]> {
    const response = await this.fetchWithAuth("/api/v1/recent-activities")
    if (!response.ok) {
      throw new Error("Failed to fetch recent activities")
    }
    const result = await response.json();
    console.log("API Client - Recent Activities Result:", result);
    return result;
  }

  async getNextExpirations(): Promise<Expirations[]> {
    const response = await this.fetchWithAuth("/api/v1/next-expirations")
    if (!response.ok) {
      throw new Error("Failed to fetch next expirations")
    }
    const result = await response.json();
    console.log("API Client - Next Expirations Result:", result);
    return result;
  }
}

export const apiClient = new ApiClient()