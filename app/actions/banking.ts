"use server"

import { requireAuth } from "@/lib/auth"
import { getAccountByUserId, updateAccountBalance, updateAccountNumber, createTransaction, processWithdrawal, updateTransaction } from "@/lib/db"
import { supabase } from "@/lib/supabase"
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

    if (Object.keys(updates).length === 0) {
      return { error: "No changes to update" }
    }

    await updateTransaction(transactionId, updates)

    revalidatePath("/admin")
    return { success: true, message: "Transaction updated successfully" }
  } catch (error) {
    return { error: "Failed to update transaction" }
  }
}

export async function createAdminTransaction(formData: FormData) {
  await requireAuth("admin")

  const accountId = Number.parseInt(formData.get("accountId") as string)
  const amount = Number.parseFloat(formData.get("amount") as string)
  const description = formData.get("description") as string
  const transactionType = formData.get("transactionType") as "credit" | "debit"

  if (!accountId || !amount || !description || !transactionType) {
    return { error: "All fields are required" }
  }

  if (amount <= 0) {
    return { error: "Amount must be greater than 0" }
  }

  // Check if amount is too large for the database field
  if (amount >= 1000000000000) { // 1 trillion
    return { error: "Amount is too large. Maximum allowed is $999,999,999,999.99" }
  }

  if (!["credit", "debit"].includes(transactionType)) {
    return { error: "Invalid transaction type" }
  }

  try {
    // Get current account balance
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single()

    if (accountError || !account) {
      return { error: "Account not found" }
    }

    const currentBalance = account.balance
    let newBalance: number

    // Calculate new balance based on transaction type
    if (transactionType === "credit") {
      newBalance = currentBalance + amount
    } else {
      // For debit, check if there's sufficient balance
      if (currentBalance < amount) {
        return { error: "Insufficient balance for debit transaction" }
      }
      newBalance = currentBalance - amount
    }

    // Update account balance
    await updateAccountBalance(accountId, newBalance)

    // Create transaction record
    const dbTransactionType = transactionType === "credit" ? "deposit" : "withdrawal"
    await createTransaction(accountId, dbTransactionType, amount, description)

    revalidatePath("/admin")
    return { 
      success: true, 
      message: `${transactionType === "credit" ? "Credit" : "Debit"} transaction created successfully` 
    }
  } catch (error) {
    console.error("Error creating admin transaction:", error)
    return { error: "Failed to create transaction" }
  }
}
