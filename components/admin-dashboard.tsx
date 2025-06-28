"use client"

import { useState } from "react"
import { logout } from "@/app/actions/auth"
import { updateCustomerDetails, updateTransactionDetails } from "@/app/actions/banking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowRight,
  LogOut,
  Users,
  Edit,
  Wallet,
  BarChart3,
  Shield,
  Search,
  Bell,
  Settings,
  Menu,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Filter,
  Lock,
  Eye,
} from "lucide-react"

interface Transaction {
  id: number
  account_id: number
  type: "deposit" | "withdrawal" | "admin_adjustment"
  amount: number
  status: "pending" | "completed" | "rejected"
  description?: string
  created_at: Date
  processed_at?: Date
  user: {
    id: number
    email: string
    username: string
  }
  account: {
    id: number
    account_number: string
  }
}

interface Customer {
  id: number
  email: string
  is_verified: boolean
  account: {
    id: number
    balance: number
    account_number: string
  }
}

interface AdminDashboardProps {
  customers: Customer[]
  transactions: Transaction[]
}

export function AdminDashboard({ customers, transactions }: AdminDashboardProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [newBalance, setNewBalance] = useState("")
  const [newAccountNumber, setNewAccountNumber] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newStatus, setNewStatus] = useState<"pending" | "completed" | "rejected">("pending")
  const [newCreatedDate, setNewCreatedDate] = useState("")
  const [newCreatedTime, setNewCreatedTime] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)

  async function handleCustomerUpdate(formData: FormData) {
    setLoading(true)
    setError("")
    setMessage("")

    const result = await updateCustomerDetails(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setMessage("Customer details updated successfully")
      setNewBalance("")
      setNewAccountNumber("")
      setSelectedCustomer(null)
      setDialogOpen(false)
    }

    setLoading(false)
  }

  async function handleTransactionUpdate(formData: FormData) {
    setLoading(true)
    setError("")
    setMessage("")

    const result = await updateTransactionDetails(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setMessage("Transaction updated successfully")
      setNewDescription("")
      setNewStatus("pending")
      setNewCreatedDate("")
      setNewCreatedTime("")
      setSelectedTransaction(null)
      setTransactionDialogOpen(false)
    }

    setLoading(false)
  }

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.account.account_number.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate statistics
  const totalBalance = customers.reduce((sum, c) => sum + c.account.balance, 0)
  const verifiedUsers = customers.filter((c) => c.is_verified).length
  const pendingUsers = customers.length - verifiedUsers
  const averageBalance = totalBalance / (customers.length || 1)

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Purple Glow Effect */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-600/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-sm" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">Nexora</h1>
                <p className="text-white/60 text-sm -mt-1">Banking</p>
              </div>
            </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-1/3">
              <Search className="h-4 w-4 text-white/40 mr-2" />
              <input
                type="text"
                placeholder="Search customers..."
                className="bg-transparent border-none text-white/80 placeholder-white/40 focus:outline-none w-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button type="button" aria-label="Notifications" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <Bell className="h-5 w-5 text-white/70" />
              </button>
              <button type="button" aria-label="Settings" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <Settings className="h-5 w-5 text-white/70" />
              </button>
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-pink-400 flex items-center justify-center text-white font-medium">
                  A
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">Admin</p>
                  <p className="text-white/50 text-xs">Administrator</p>
                </div>
              </div>
              <form action={logout}>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </form>
              <button type="button" aria-label="Menu" className="hidden p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <Menu className="h-5 w-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Admin Navigation */}
        <div className="mb-8">
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="customers"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
              >
                Customers
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-white/60">Welcome to the Olsa Banking administration portal.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60">Total Customers</p>
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{customers.length}</p>
                  <p className="text-white/40 text-sm mt-1">
                    {customers.length > 0 ? "+1 this week" : "No customers yet"}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60">Verified Users</p>
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{verifiedUsers}</p>
                  <p className="text-white/40 text-sm mt-1">
                    {pendingUsers > 0 ? `${pendingUsers} pending` : "All verified"}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60">Total Balance</p>
                    <Wallet className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">${totalBalance.toFixed(2)}</p>
                  <p className="text-white/40 text-sm mt-1">Across all accounts</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60">Average Balance</p>
                    <BarChart3 className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">${averageBalance.toFixed(2)}</p>
                  <p className="text-white/40 text-sm mt-1">Per customer</p>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/30 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="mb-6 bg-green-500/10 border-green-500/30 text-green-200">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {/* Customer Overview */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-400" />
                    Customer Overview
                  </h2>
                  <div className="flex items-center space-x-2">
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group" onClick={() => setActiveTab("customers")}>
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Account</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Balance</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Status</th>
                        <th className="text-right py-3 px-4 text-white/60 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.slice(0, 5).map((customer) => (
                        <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-medium mr-3">
                                {customer.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{customer.email}</p>
                                <p className="text-white/40 text-xs">ID: {customer.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-white/80 font-mono text-sm">{customer.account.account_number}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-white font-medium">${customer.account.balance.toFixed(2)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                customer.is_verified
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              }
                            >
                              {customer.is_verified ? "Verified" : "Pending"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                              <DialogTrigger asChild>
                                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group" onClick={() => {
                                    setSelectedCustomer(customer)
                                    setNewBalance(customer.account.balance.toString())
                                    setNewAccountNumber(customer.account.account_number)
                                    setDialogOpen(true)
                                  }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 text-white">
                                <DialogHeader>
                                  <DialogTitle className="text-white">Update Customer Details</DialogTitle>
                                  <DialogDescription className="text-white/60">
                                    Adjust the customer details for {customer.email}
                                  </DialogDescription>
                                </DialogHeader>

                                <form action={handleCustomerUpdate} className="space-y-6">
                                  <input type="hidden" name="accountId" value={customer.account.id} />
                                  <input type="hidden" name="userId" value={customer.id} />

                                  <div className="space-y-3">
                                    <Label htmlFor="accountNumber" className="text-white/90">
                                      Account Number
                                    </Label>
                                    <Input
                                      id="accountNumber"
                                      name="accountNumber"
                                      type="text"
                                      placeholder="Enter new account number"
                                      value={newAccountNumber}
                                      onChange={(e) => setNewAccountNumber(e.target.value)}
                                      className="bg-white/5 border-white/20 text-white pl-8"
                                    />
                                  </div>

                                  <div className="space-y-3">
                                    <Label htmlFor="balance" className="text-white/90">
                                      New Balance
                                    </Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                                        $
                                      </span>
                                      <Input
                                        id="balance"
                                        name="balance"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={newBalance}
                                        onChange={(e) => setNewBalance(e.target.value)}
                                        className="bg-white/5 border-white/20 text-white pl-8"
                                      />
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-white/50">Current Balance</span>
                                      <span className="text-white font-medium">
                                        ${customer.account.balance.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>

                                  <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                                    disabled={loading}
                                  >
                                    {loading ? (
                                      "Updating..."
                                    ) : (
                                      <>
                                        Update Details
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </>
                                    )}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Status */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-400" />
                    System Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white/70">API Services</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/70">Database</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/70">Authentication</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/70">Payment Processing</p>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Partial Outage</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mt-1">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-white font-medium">New customer verified</p>
                        <p className="text-white/40 text-sm">customer@example.com</p>
                        <p className="text-white/40 text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mt-1">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Balance updated</p>
                        <p className="text-white/40 text-sm">ACC0000000002</p>
                        <p className="text-white/40 text-xs">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mt-1">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Failed login attempt</p>
                        <p className="text-white/40 text-sm">IP: 192.168.1.1</p>
                        <p className="text-white/40 text-xs">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="mt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Customer Management</h2>
                  <p className="text-white/60">Manage all customer accounts and balances</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <div className="relative md:hidden">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      placeholder="Search customers..."
                      className="bg-white/5 border-white/20 text-white pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Customer Table */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Account</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Balance</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Status</th>
                        <th className="text-right py-3 px-4 text-white/60 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-white/60">
                            No customers found matching your search
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-medium mr-3">
                                  {customer.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{customer.email}</p>
                                  <p className="text-white/40 text-xs">ID: {customer.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white/80 font-mono text-sm">{customer.account.account_number}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white font-medium">${customer.account.balance.toFixed(2)}</p>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  customer.is_verified
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                }
                              >
                                {customer.is_verified ? "Verified" : "Pending"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                  <DialogTrigger asChild>
                                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group" onClick={() => {
                                        setSelectedCustomer(customer)
                                        setNewBalance(customer.account.balance.toString())
                                        setNewAccountNumber(customer.account.account_number)
                                        setDialogOpen(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 text-white">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">Update Customer Details</DialogTitle>
                                      <DialogDescription className="text-white/60">
                                        Adjust the customer details for {customer.email}
                                      </DialogDescription>
                                    </DialogHeader>

                                    <form action={handleCustomerUpdate} className="space-y-6">
                                      <input type="hidden" name="accountId" value={customer.account.id} />
                                      <input type="hidden" name="userId" value={customer.id} />

                                      <div className="space-y-3">
                                        <Label htmlFor="accountNumber" className="text-white/90">
                                          Account Number
                                        </Label>
                                        <Input
                                          id="accountNumber"
                                          name="accountNumber"
                                          type="text"
                                          placeholder="Enter new account number"
                                          value={newAccountNumber}
                                          onChange={(e) => setNewAccountNumber(e.target.value)}
                                          className="bg-white/5 border-white/20 text-white pl-8"
                                        />
                                      </div>

                                      <div className="space-y-3">
                                        <Label htmlFor="balance" className="text-white/90">
                                          New Balance
                                        </Label>
                                        <div className="relative">
                                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                                            $
                                          </span>
                                          <Input
                                            id="balance"
                                            name="balance"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={newBalance}
                                            onChange={(e) => setNewBalance(e.target.value)}
                                            className="bg-white/5 border-white/20 text-white pl-8"
                                          />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-white/50">Current Balance</span>
                                          <span className="text-white font-medium">
                                            ${customer.account.balance.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>

                                      <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                                        disabled={loading}
                                      >
                                        {loading ? (
                                          "Updating..."
                                        ) : (
                                          <>
                                            Update Details
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                          </>
                                        )}
                                      </Button>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="mt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Transaction Management</h2>
                  <p className="text-white/60">Monitor and manage all system transactions</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Transaction ID</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Account</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-white/60 font-medium">Description</th>
                        <th className="text-right py-3 px-4 text-white/60 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-white/60">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4">
                              <p className="text-white/80 font-mono text-sm">#{transaction.id}</p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {transaction.user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{transaction.user.username}</p>
                                  <p className="text-white/60 text-xs">{transaction.user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white/80 font-mono text-sm">{transaction.account.account_number}</p>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  transaction.type === "deposit"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : transaction.type === "withdrawal"
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                }
                              >
                                {transaction.type.replace("_", " ").toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <p className={`font-medium ${transaction.type === "withdrawal" ? "text-red-400" : "text-green-400"}`}>
                                {transaction.type === "withdrawal" ? "-" : "+"}${transaction.amount.toFixed(2)}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  transaction.status === "completed"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : transaction.status === "pending"
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                                }
                              >
                                {transaction.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white/80 text-sm">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-white/40 text-xs">
                                {new Date(transaction.created_at).toLocaleTimeString()}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white/70 text-sm max-w-xs truncate">
                                {transaction.description || "No description"}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group"
                                    onClick={() => {
                                      setSelectedTransaction(transaction)
                                      setNewDescription(transaction.description || "")
                                      setNewStatus(transaction.status)
                                      const date = new Date(transaction.created_at)
                                      setNewCreatedDate(date.toISOString().split('T')[0])
                                      setNewCreatedTime(date.toTimeString().split(' ')[0])
                                      setTransactionDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 text-white">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Update Transaction Details</DialogTitle>
                                    <DialogDescription className="text-white/60">
                                      Edit transaction #{transaction.id} details
                                    </DialogDescription>
                                  </DialogHeader>

                                  <form action={handleTransactionUpdate} className="space-y-6">
                                    <input type="hidden" name="transactionId" value={transaction.id} />

                                    <div className="space-y-3">
                                      <Label htmlFor="description" className="text-white/90">
                                        Description
                                      </Label>
                                      <Input
                                        id="description"
                                        name="description"
                                        type="text"
                                        placeholder="Enter transaction description"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        className="bg-white/5 border-white/20 text-white"
                                      />
                                    </div>

                                    <div className="space-y-3">
                                      <Label htmlFor="status" className="text-white/90">
                                        Status
                                      </Label>
                                      <select
                                        id="status"
                                        name="status"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value as "pending" | "completed" | "rejected")}
                                        className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        aria-label="Transaction status"
                                        title="Transaction status"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="rejected">Rejected</option>
                                      </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-3">
                                        <Label htmlFor="createdDate" className="text-white/90">
                                          Date
                                        </Label>
                                        <Input
                                          id="createdDate"
                                          name="createdDate"
                                          type="date"
                                          value={newCreatedDate}
                                          onChange={(e) => setNewCreatedDate(e.target.value)}
                                          className="bg-white/5 border-white/20 text-white"
                                        />
                                      </div>
                                      <div className="space-y-3">
                                        <Label htmlFor="createdTime" className="text-white/90">
                                          Time
                                        </Label>
                                        <Input
                                          id="createdTime"
                                          name="createdTime"
                                          type="time"
                                          value={newCreatedTime}
                                          onChange={(e) => setNewCreatedTime(e.target.value)}
                                          className="bg-white/5 border-white/20 text-white"
                                        />
                                      </div>
                                    </div>

                                    <Button
                                      type="submit"
                                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                                      disabled={loading}
                                    >
                                      {loading ? (
                                        "Updating..."
                                      ) : (
                                        <>
                                          Update Transaction
                                          <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                      )}
                                    </Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">System Settings</h2>
                  <p className="text-white/60">Configure system-wide settings and preferences</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-purple-400" />
                    Security Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="two-factor" className="text-white/90">
                        Two-Factor Authentication
                      </Label>
                      <input
                        type="checkbox"
                        id="two-factor"
                        aria-label="Two-Factor Authentication"
                        defaultChecked
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="session-timeout" className="text-white/90">
                        Auto Session Timeout
                      </Label>
                      <input
                        type="checkbox"
                        id="session-timeout"
                        aria-label="Auto Session Timeout"
                        defaultChecked
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audit-logs" className="text-white/90">
                        Audit Logging
                      </Label>
                      <input
                        type="checkbox"
                        id="audit-logs"
                        aria-label="Audit Logging"
                        defaultChecked
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-400" />
                    System Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="max-withdrawal" className="text-white/90">
                        Max Withdrawal Limit
                      </Label>
                      <Input
                        id="max-withdrawal"
                        defaultValue="10000"
                        className="bg-white/5 border-white/20 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min-balance" className="text-white/90">
                        Minimum Account Balance
                      </Label>
                      <Input id="min-balance" defaultValue="0" className="bg-white/5 border-white/20 text-white mt-1" />
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
