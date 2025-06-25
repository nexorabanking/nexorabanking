"use server"

import { requireAuth } from "@/lib/auth"
import { getAccountByUserId, updateAccountBalance, createTransaction, processWithdrawal } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function requestWithdrawal(formData: FormData) {
  const user = await requireAuth("customer")
  const amount = Number.parseFloat(formData.get("amount") as string)

  if (!amount || amount <= 0) {
    return { error: "Invalid withdrawal amount" }
  }

  const account = await getAccountByUserId(user.id)
  if (!account) {
    return { error: "Account not found" }
  }

  if (account.balance < amount) {
    return { error: "Insufficient balance" }
  }

  const transaction = await createTransaction(account.id, "withdrawal", amount, "Customer withdrawal request")

  // Process withdrawal immediately for demo
  await processWithdrawal(transaction.id)

  revalidatePath("/dashboard")
  return { success: true, message: "Withdrawal processed successfully" }
}

export async function updateCustomerBalance(formData: FormData) {
  await requireAuth("admin")

  const accountId = Number.parseInt(formData.get("accountId") as string)
  const newBalance = Number.parseFloat(formData.get("balance") as string)

  if (!accountId || isNaN(newBalance) || newBalance < 0) {
    return { error: "Invalid account ID or balance" }
  }

  await updateAccountBalance(accountId, newBalance)
  await createTransaction(accountId, "admin_adjustment", newBalance, "Admin balance adjustment")

  revalidatePath("/admin")
  return { success: true, message: "Balance updated successfully" }
}
