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