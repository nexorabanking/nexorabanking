import { requireAuth } from "@/lib/auth"
import { getAllCustomers } from "@/lib/db"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  await requireAuth("admin")
  const customers = await getAllCustomers()

  return <AdminDashboard customers={customers} />
}
