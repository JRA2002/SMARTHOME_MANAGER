import type { Property } from "./Property"

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