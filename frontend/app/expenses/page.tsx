import { DashboardLayout } from "@/components/dashboard-layout"
import { ExpensesList } from "@/components/expenses-list"

export default function ExpensesPage() {
  return (
    <DashboardLayout>
      <ExpensesList />
    </DashboardLayout>
  )
}
