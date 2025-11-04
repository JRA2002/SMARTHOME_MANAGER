import type { Property } from "./Property"

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