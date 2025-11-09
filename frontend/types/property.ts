export interface Property {
    id: number
    title: string
    address: string
    city: string
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
    city: string
    type: "house" | "apartment" | "comercial" | "office" | "land"
    price: number
    area: number
    bedrooms: number
    bathrooms: number
    description?: string
    image_url?: string
  }