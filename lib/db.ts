import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

// Mock database functions - replace with your actual database connection
export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  role: "customer" | "admin"
  is_verified: boolean
}

export interface Account {
  id: number
  user_id: number
  balance: number
  account_number: string
}

export interface Transaction {
  id: number
  account_id: number
  type: "deposit" | "withdrawal" | "admin_adjustment"
  amount: number
  status: "pending" | "completed" | "rejected"
  description?: string
  created_at: Date
  processed_at?: Date
}

// Mock data store
const users: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@cryptobank.com",
    password_hash: "hashed_admin_password",
    role: "admin",
    is_verified: true,
  },
  {
    id: 2,
    username: "customer",
    email: "customer@example.com",
    password_hash: "hashed_customer_password",
    role: "customer",
    is_verified: true,
  },
]

const accounts: Account[] = [
  {
    id: 1,
    user_id: 1,
    balance: 0,
    account_number: "ACC0000000001",
  },
  {
    id: 2,
    user_id: 2,
    balance: 1000.5,
    account_number: "ACC0000000002",
  },
]

const transactions: Transaction[] = []

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    return null
  }

  if (!data) {
    return null
  }

  return data as User
}

export async function createUser(username: string, email: string, passwordHash: string): Promise<User> {
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert([
      {
        username,
        email,
        password_hash: passwordHash,  // Use the already hashed password
        role: 'customer',
        is_verified: false
      }
    ])
    .select()
    .single()

  if (userError || !user) {
    throw new Error('Failed to create user')
  }

  // Create account for new user
  const { error: accountError } = await supabase
    .from('accounts')
    .insert([
      {
        user_id: user.id,
        balance: 0,
        account_number: `ACC${String(user.id).padStart(10, '0')}`
      }
    ])

  if (accountError) {
    throw new Error('Failed to create account')
  }

  return user as User
}

export async function verifyUser(email: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ is_verified: true })
    .eq('email', email)

  if (error) {
    throw new Error('Failed to verify user')
  }
}

export async function getAccountByUserId(userId: number): Promise<Account | null> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data as Account
}

export async function getAllCustomers(): Promise<(User & { account: Account })[]> {
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'customer')

  if (usersError || !users) {
    throw new Error('Failed to fetch customers')
  }

  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('*')
    .in('user_id', (users as User[]).map((u: User) => u.id))

  if (accountsError || !accounts) {
    throw new Error('Failed to fetch accounts')
  }

  return (users as User[]).map((user: User) => ({
    ...user,
    account: (accounts as Account[]).find((acc: Account) => acc.user_id === user.id)!
  })) as (User & { account: Account })[]
}

export async function updateAccountBalance(accountId: number, newBalance: number): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', accountId)

  if (error) {
    throw new Error('Failed to update account balance')
  }
}

export async function updateAccountNumber(accountId: number, newAccountNumber: string): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .update({ account_number: newAccountNumber })
    .eq('id', accountId)

  if (error) {
    throw new Error('Failed to update account number')
  }
}

export async function updateUserEmail(userId: number, newEmail: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ email: newEmail })
    .eq('id', userId)

  if (error) {
    throw new Error('Failed to update user email')
  }
}

export async function createTransaction(
  accountId: number,
  type: Transaction["type"],
  amount: number,
  description?: string,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        account_id: accountId,
        type,
        amount,
        status: "pending",
        description,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error || !data) {
    throw new Error('Failed to create transaction')
  }

  return data as Transaction
}

export async function getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    throw new Error('Failed to fetch transactions')
  }

  return data as Transaction[]
}

export async function processWithdrawal(transactionId: number): Promise<void> {
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (transactionError || !transaction) {
    throw new Error('Transaction not found')
  }

  if (transaction.type !== 'withdrawal') {
    throw new Error('Invalid transaction type')
  }

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', transaction.account_id)
    .single()

  if (accountError || !account) {
    throw new Error('Account not found')
  }

  if (account.balance >= transaction.amount) {
    // Update account balance
    await updateAccountBalance(account.id, account.balance - transaction.amount)
    
    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', transactionId)

    if (updateError) {
      throw new Error('Failed to update transaction status')
    }
  } else {
    // Update transaction status to rejected
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'rejected',
        processed_at: new Date().toISOString()
      })
      .eq('id', transactionId)

    if (updateError) {
      throw new Error('Failed to update transaction status')
    }
  }
}

export async function getAllTransactions(): Promise<(Transaction & { user: User; account: Account })[]> {
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (transactionsError || !transactions) {
    throw new Error('Failed to fetch transactions')
  }

  // Get all unique account IDs
  const accountIds = [...new Set((transactions as Transaction[]).map(t => t.account_id))]

  // Get accounts for these transactions
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('*')
    .in('id', accountIds)

  if (accountsError || !accounts) {
    throw new Error('Failed to fetch accounts')
  }

  // Get all unique user IDs
  const userIds = [...new Set((accounts as Account[]).map(a => a.user_id))]

  // Get users for these accounts
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds)

  if (usersError || !users) {
    throw new Error('Failed to fetch users')
  }

  return (transactions as Transaction[]).map(transaction => {
    const account = (accounts as Account[]).find(a => a.id === transaction.account_id)!
    const user = (users as User[]).find(u => u.id === account.user_id)!
    return {
      ...transaction,
      user,
      account
    }
  }) as (Transaction & { user: User; account: Account })[]
}

export async function updateTransaction(
  transactionId: number,
  updates: {
    description?: string
    created_at?: string
    processed_at?: string
    status?: "pending" | "completed" | "rejected"
  }
): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)

  if (error) {
    throw new Error('Failed to update transaction')
  }
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('username', username)
    .single()

  if (error) {
    return null
  }

  if (!data) {
    return null
  }

  return data as User
}
