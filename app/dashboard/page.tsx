import { requireAuth } from "@/lib/auth"
import { getAccountByUserId, getTransactionsByAccountId } from "@/lib/db"
import { CustomerDashboard } from "@/components/customer-dashboard"

export default async function DashboardPage() {
  const user = await requireAuth("customer")
  const account = await getAccountByUserId(user.id)
  const transactions = account ? await getTransactionsByAccountId(account.id) : []

  if (!account) {
    return <div>Account not found</div>
  }

  return <CustomerDashboard user={user} account={account} transactions={transactions} />
}
