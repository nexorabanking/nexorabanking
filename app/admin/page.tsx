import { requireAuth } from "@/lib/auth"
import { getAllCustomers, getAllTransactions } from "@/lib/db"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  await requireAuth("admin")
  const customers = await getAllCustomers()
  const transactions = await getAllTransactions()

  return <AdminDashboard customers={customers} transactions={transactions} />
}
