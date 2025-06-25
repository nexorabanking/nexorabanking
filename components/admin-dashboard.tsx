"use client"

import { useState } from "react"
import { logout } from "@/app/actions/auth"
import { updateCustomerBalance } from "@/app/actions/banking"
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
}

export function AdminDashboard({ customers }: AdminDashboardProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [newBalance, setNewBalance] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")

  async function handleBalanceUpdate(formData: FormData) {
    setLoading(true)
    setError("")
    setMessage("")

    const result = await updateCustomerBalance(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setMessage("Balance updated successfully")
      setNewBalance("")
      setSelectedCustomer(null)
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
              <button type="button" aria-label="Menu" className="md:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
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
                            <Dialog>
                              <DialogTrigger asChild>
                                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group" onClick={() => {
                                    setSelectedCustomer(customer)
                                    setNewBalance(customer.account.balance.toString())
                                  }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 text-white">
                                <DialogHeader>
                                  <DialogTitle className="text-white">Update Customer Balance</DialogTitle>
                                  <DialogDescription className="text-white/60">
                                    Adjust the account balance for {customer.email}
                                  </DialogDescription>
                                </DialogHeader>

                                <form action={handleBalanceUpdate} className="space-y-6">
                                  <input type="hidden" name="accountId" value={customer.account.id} />

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
                                        required
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
                                        Update Balance
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
                                <Dialog>
                                  <DialogTrigger asChild>
                                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group" onClick={() => {
                                        setSelectedCustomer(customer)
                                        setNewBalance(customer.account.balance.toString())
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 text-white">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">Update Customer Balance</DialogTitle>
                                      <DialogDescription className="text-white/60">
                                        Adjust the account balance for {customer.email}
                                      </DialogDescription>
                                    </DialogHeader>

                                    <form action={handleBalanceUpdate} className="space-y-6">
                                      <input type="hidden" name="accountId" value={customer.account.id} />

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
                                            required
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
                                            Update Balance
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

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-white/30" />
                  </div>
                  <p className="text-white/70">Transaction monitoring coming soon</p>
                  <p className="text-white/40 text-sm mt-1">This feature will be available in the next update</p>
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
