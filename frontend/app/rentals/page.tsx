import { DashboardLayout } from "@/components/dashboard-layout"
import { RentalsList } from "@/components/rentals-list"

export default function RentalsPage() {
  return (
    <DashboardLayout>
      <RentalsList />
    </DashboardLayout>
  )
}
