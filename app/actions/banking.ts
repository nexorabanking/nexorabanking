"use server"

import { requireAuth } from "@/lib/auth"
import { getAccountByUserId, updateAccountBalance, updateAccountNumber, createTransaction, processWithdrawal, updateTransaction } from "@/lib/db"
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

export async function updateCustomerDetails(formData: FormData) {
  await requireAuth("admin")

  const accountId = Number.parseInt(formData.get("accountId") as string)
  const userId = Number.parseInt(formData.get("userId") as string)
  const newBalance = formData.get("balance") as string
  const newAccountNumber = formData.get("accountNumber") as string

  if (!accountId || !userId) {
    return { error: "Invalid account or user ID" }
  }

  try {
    // Update balance if provided
    if (newBalance && newBalance.trim() !== "") {
      const balanceValue = Number.parseFloat(newBalance)
      if (!isNaN(balanceValue) && balanceValue >= 0) {
        await updateAccountBalance(accountId, balanceValue)
        await createTransaction(accountId, "admin_adjustment", balanceValue, "Admin balance adjustment")
      }
    }

    // Update account number if provided
    if (newAccountNumber && newAccountNumber.trim() !== "") {
      await updateAccountNumber(accountId, newAccountNumber.trim())
    }

    revalidatePath("/admin")
    return { success: true, message: "Customer details updated successfully" }
  } catch (error) {
    return { error: "Failed to update customer details" }
  }
}

// Keep the old function for backward compatibility
export async function updateCustomerBalance(formData: FormData) {
  return updateCustomerDetails(formData)
}

export async function updateTransactionDetails(formData: FormData) {
  await requireAuth("admin")

  const transactionId = Number.parseInt(formData.get("transactionId") as string)
  const description = formData.get("description") as string
  const status = formData.get("status") as "pending" | "completed" | "rejected"
  const createdDate = formData.get("createdDate") as string
  const createdTime = formData.get("createdTime") as string

  if (!transactionId) {
    return { error: "Invalid transaction ID" }
  }

  try {
    const updates: any = {}

    // Update description if provided
    if (description && description.trim() !== "") {
      updates.description = description.trim()
    }

    // Update status if provided
    if (status && ["pending", "completed", "rejected"].includes(status)) {
      updates.status = status
    }

    // Update created date/time if provided
    if (createdDate && createdTime) {
      const dateTimeString = `${createdDate}T${createdTime}`
      updates.created_at = new Date(dateTimeString).toISOString()
    }

    await updateTransaction(transactionId, updates)

    revalidatePath("/admin")
    return { success: true, message: "Transaction updated successfully" }
  } catch (error) {
    return { error: "Failed to update transaction" }
  }
}
