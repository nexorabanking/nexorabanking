"use client"

import { useState, useEffect } from "react"
import { logout } from "@/app/actions/auth"
import { requestWithdrawal } from "@/app/actions/banking"
import { useInactivityTimeout } from "@/hooks/use-inactivity-timeout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  LogOut,
  CreditCard,
  BarChart3,
  Clock,
  ChevronRight,
  Download,
  Plus,
  RefreshCw,
  Settings,
  Bell,
  Search,
  Menu,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface CustomerDashboardProps {
  user: { id: number; email: string; role: string; username?: string }
  account: { id: number; balance: number; account_number: string }
  transactions: Array<{
    id: number
    type: string
    amount: number
    status: string
    description?: string
    created_at: string
  }>
}

interface LivePriceData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  type: 'crypto' | 'stock'
  icon?: string
}

export function CustomerDashboard({ user, account, transactions }: CustomerDashboardProps) {
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [livePrices, setLivePrices] = useState<LivePriceData[]>([])
  const [pricesLoading, setPricesLoading] = useState(true)

  // List of major American banks and credit unions
  const americanBanks = [
    { value: "chase", label: "Chase Bank" },
    { value: "bank-of-america", label: "Bank of America" },
    { value: "wells-fargo", label: "Wells Fargo" },
    { value: "citibank", label: "Citibank" },
    { value: "us-bank", label: "U.S. Bank" },
    { value: "pnc-bank", label: "PNC Bank" },
    { value: "capital-one", label: "Capital One" },
    { value: "td-bank", label: "TD Bank" },
    { value: "goldman-sachs", label: "Goldman Sachs" },
    { value: "morgan-stanley", label: "Morgan Stanley" },
    { value: "american-express", label: "American Express Bank" },
    { value: "regions-bank", label: "Regions Bank" },
    { value: "bbt", label: "BB&T (Truist)" },
    { value: "suntrust", label: "SunTrust (Truist)" },
    { value: "keybank", label: "KeyBank" },
    { value: "fifth-third", label: "Fifth Third Bank" },
    { value: "huntington", label: "Huntington Bank" },
    { value: "citizens-bank", label: "Citizens Bank" },
    { value: "comerica", label: "Comerica Bank" },
    { value: "bmo-harris", label: "BMO Harris Bank" },
    { value: "navy-federal", label: "Navy Federal Credit Union" },
    { value: "state-employees", label: "State Employees' Credit Union" },
    { value: "penfed", label: "PenFed Credit Union" },
    { value: "schoolsfirst", label: "SchoolsFirst Federal Credit Union" },
    { value: "america-first", label: "America First Credit Union" },
    { value: "golden-1", label: "Golden 1 Credit Union" },
    { value: "becu", label: "Boeing Employees Credit Union (BECU)" },
    { value: "alliant", label: "Alliant Credit Union" },
    { value: "mountain-america", label: "Mountain America Credit Union" },
    { value: "first-technology", label: "First Technology Federal Credit Union" },
    { value: "suncoast", label: "Suncoast Credit Union" },
    { value: "san-diego-county", label: "San Diego County Credit Union" },
    { value: "security-service", label: "Security Service Federal Credit Union" },
    { value: "alaska-usa", label: "Alaska USA Federal Credit Union" },
    { value: "bowater", label: "Bowater Credit Union" },
    { value: "delta-community", label: "Delta Community Credit Union" },
    { value: "american-airlines", label: "American Airlines Federal Credit Union" },
    { value: "teachers-federal", label: "Teachers Federal Credit Union" },
    { value: "vystar", label: "VyStar Credit Union" },
    { value: "visions", label: "Visions Federal Credit Union" },
    { value: "michigan-state", label: "Michigan State University Federal Credit Union" },
    { value: "truwest", label: "TruWest Credit Union" },
    { value: "nasa-federal", label: "NASA Federal Credit Union" },
    { value: "georgias-own", label: "Georgia's Own Credit Union" },
    { value: "psecu", label: "PSECU (Pennsylvania State Employees Credit Union)" },
    { value: "desert-financial", label: "Desert Financial Credit Union" },
    { value: "tower-federal", label: "Tower Federal Credit Union" },
    { value: "communityamerica", label: "CommunityAmerica Credit Union" },
    { value: "logix", label: "Logix Federal Credit Union" },
    { value: "redwood", label: "Redwood Credit Union" },
    { value: "dcu", label: "Digital Federal Credit Union (DCU)" },
    { value: "bethpage", label: "Bethpage Federal Credit Union" },
    { value: "teachers-credit-union", label: "Teachers Credit Union" },
    { value: "navyarmy", label: "NavyArmy Community Credit Union" },
    { value: "onpoint", label: "OnPoint Community Credit Union" },
    // { value: "other", label: "Other Bank" },
  ]

  // Fetch live prices
  const fetchLivePrices = async () => {
    try {
      setPricesLoading(true)
      
      // Fetch crypto prices from CoinGecko with better error handling
      const cryptoResponse = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana&order=market_cap_desc&per_page=4&page=1&sparkline=false&locale=en",
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      )
      
      if (!cryptoResponse.ok) {
        throw new Error(`HTTP error! status: ${cryptoResponse.status}`)
      }
      
      const cryptoData = await cryptoResponse.json()
      
      // Mock stock data (in real app, you'd use a stock API like Alpha Vantage or Yahoo Finance)
      const stockData: LivePriceData[] = [
        {
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 185.92,
          change: 2.45,
          changePercent: 1.34,
          type: 'stock'
        },
        {
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          price: 142.56,
          change: -1.23,
          changePercent: -0.85,
          type: 'stock'
        },
        {
          symbol: "MSFT",
          name: "Microsoft Corp.",
          price: 378.85,
          change: 5.67,
          changePercent: 1.52,
          type: 'stock'
        },
        {
          symbol: "TSLA",
          name: "Tesla Inc.",
          price: 248.42,
          change: -3.21,
          changePercent: -1.28,
          type: 'stock'
        }
      ]
      
      // Transform crypto data
      const cryptoPrices: LivePriceData[] = cryptoData.map((crypto: any) => ({
        symbol: crypto.symbol.toUpperCase(),
        name: crypto.name,
        price: crypto.current_price,
        change: crypto.price_change_24h,
        changePercent: crypto.price_change_percentage_24h,
        type: 'crypto' as const,
        icon: crypto.image
      }))
      
      // Combine and sort by type
      const allPrices = [...cryptoPrices, ...stockData]
      setLivePrices(allPrices)
      
    } catch (error) {
      console.error("Error fetching live prices:", error)
      // Fallback to static data
      setLivePrices([
        {
          symbol: "BTC",
          name: "Bitcoin",
          price: 48235.12,
          change: 1156.78,
          changePercent: 2.46,
          type: 'crypto'
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          price: 3145.67,
          change: 55.43,
          changePercent: 1.79,
          type: 'crypto'
        },
        {
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 185.92,
          change: 2.45,
          changePercent: 1.34,
          type: 'stock'
        },
        {
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          price: 142.56,
          change: -1.23,
          changePercent: -0.85,
          type: 'stock'
        }
      ])
    } finally {
      setPricesLoading(false)
    }
  }

  // Simple inactivity timeout - 10 minutes
  useInactivityTimeout(10)

  useEffect(() => {
    fetchLivePrices()
    
    // Auto-refresh every 60 seconds instead of 30 to reduce API calls
    const interval = setInterval(fetchLivePrices, 60000)
    return () => clearInterval(interval)
  }, [])

  async function handleWithdrawal(formData: FormData) {
    setLoading(true)
    setError("")
    setMessage("")

    const result = await requestWithdrawal(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setMessage(result.message)
      setWithdrawalAmount("")
    }

    setLoading(false)
  }

  // Calculate some statistics
  const totalTransactions = transactions.length
  const pendingTransactions = transactions.filter((t) => t.status === "pending").length
  const withdrawals = transactions.filter((t) => t.type === "withdrawal").length
  const deposits = transactions.filter((t) => t.type === "deposit").length

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatChange = (change: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(change))
  }

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
            <Link href="/login">
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
                placeholder="Search transactions..."
                className="bg-transparent border-none text-white/80 placeholder-white/40 focus:outline-none w-full text-sm"
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
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {(user.username || user.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user.username || 'User'}</p>
                  <p className="text-white/60 text-xs">{user.email}</p>
                </div>
              </div>
              <form action={logout}>
                <Button 
                  type="submit"
                  size="sm" 
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group"
                >
                  <LogOut className="h-4 w-4 md:mr-2" />
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
        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back, {user.username || 'User'}</h1>
          <p className="text-white/60">Here's what's happening with your account today.</p>
        </div>

        {/* Account Overview Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-400" />
                My Account
              </h2>
              <p className="text-white/60 text-sm mt-1">Account Number: {account.account_number}</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="hidden md:flex items-center space-x-2 text-xs text-white/60">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Session Active</span>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                {balanceVisible ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Balance
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Balance
                  </>
                )}
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 backdrop-blur-sm border border-white/10">
            <div className="flex flex-col md:flex-row md:items-end justify-between">
              <div>
                <p className="text-[#581c87] md:text-white/60 text-sm mb-1">Available Balance</p>
                {balanceVisible ? (
                  <p className="text-4xl font-bold text-[#581c87] md:text-white">${account.balance.toFixed(2)}</p>
                ) : (
                  <p className="text-4xl font-bold text-[#581c87] md:text-white">••••••</p>
                )}
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-[#581c874d] md:bg-green-500/20 text-[#581c87] md:text-green-400 border-[#581c87] md:border-green-500/30">Active</Badge>
                  <Badge className="bg-white/10 text-white/70 border-white/20">Personal</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm">Transactions</p>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalTransactions}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm">Pending</p>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{pendingTransactions}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm">Withdrawals</p>
              <ArrowDownLeft className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white">{withdrawals}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm">Deposits</p>
              <Plus className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{deposits}</p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 overflow-x-auto flex-nowrap w-full">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 whitespace-nowrap flex-shrink-0"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 whitespace-nowrap flex-shrink-0"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="transfer"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 whitespace-nowrap flex-shrink-0"
              >
                Transfer
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 whitespace-nowrap flex-shrink-0"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                      onClick={() => setActiveTab("transactions")}
                    >
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-white/30" />
                      </div>
                      <p className="text-white/70">No transactions yet</p>
                      <p className="text-white/40 text-sm mt-1">Your transaction history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                transaction.type === "withdrawal"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {transaction.type === "withdrawal" ? (
                                <ArrowDownLeft className="h-5 w-5" />
                              ) : (
                                <Plus className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                            <p className="font-medium text-white capitalize">{transaction.description || "No description"}</p>
                              <p className="text-sm text-white/60">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold ${
                                transaction.type === "withdrawal" ? "text-red-400" : "text-green-400"
                              }`}
                            >
                              {transaction.type === "withdrawal" ? "-" : "+"}${transaction.amount.toFixed(2)}
                            </p>
                            <Badge
                              className={
                                transaction.status === "completed"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : transaction.status === "pending"
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group" onClick={() => setActiveTab("transfer")}>
                      <ArrowDownLeft className="h-5 w-5 mb-2" />
                      <span>Withdraw</span>
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                      <Plus className="h-5 w-5 mb-2" />
                      <span>Deposit</span>
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                      <Download className="h-5 w-5 mb-2" />
                      <span>Export</span>
                    </Button>
                  </div>
                </div>

                {/* <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Summary</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Account Type</span>
                        <span className="text-white font-medium">Personal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Account Number</span>
                        <span className="text-white font-medium font-mono">{account.account_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Status</span>
                        <span className="text-green-400">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Currency</span>
                        <span className="text-white font-medium">USD</span>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </TabsContent>

           

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Transaction History</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-white/30" />
                  </div>
                  <p className="text-white/70">No transactions yet</p>
                  <p className="text-white/40 text-sm mt-1">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === "withdrawal"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {transaction.type === "withdrawal" ? (
                            <ArrowDownLeft className="h-5 w-5" />
                          ) : (
                            <Plus className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          {/* <p className="font-medium text-white capitalize">{transaction.type.replace("_", " ")}</p> */}
                          <p className="font-medium text-white capitalize">{transaction.description || "No description"}</p>
                          <p className="text-xs text-white/40">{new Date(transaction.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transaction.type === "withdrawal" ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {transaction.type === "withdrawal" ? "-" : "+"}${transaction.amount.toFixed(2)}
                        </p>
                        <Badge
                          className={
                            transaction.status === "completed"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : transaction.status === "pending"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Transfer Tab */}
            <TabsContent value="transfer" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Request Withdrawal</h3>
                  <form action={handleWithdrawal} className="space-y-6">
                    {error && (
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-200">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {message && (
                      <Alert className="bg-green-500/10 border-green-500/30 text-green-200">
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="bank" className="text-white/90">
                        Select Bank
                      </Label>
                      <Select value={selectedBank} onValueChange={setSelectedBank} required>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white md:text-white">
                          <SelectValue placeholder="Choose your bank" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/10 border-white/20 backdrop-blur-xl">
                          {americanBanks.map((bank) => (
                            <SelectItem key={bank.value} value={bank.value} className="text-white hover:bg-white/10">
                              {bank.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedBank && selectedBank !== "other" && (
                      <div className="space-y-2">
                        <Label htmlFor="account-number" className="text-white/90">
                          Account Number
                        </Label>
                        <Input
                          id="account-number"
                          name="accountNumber"
                          type="text"
                          placeholder="Enter your account number"
                          className="bg-white/5 border-white/20 text-[#581c87] md:text-white"
                          required
                        />
                        <p className="text-xs text-white/50">Please enter the account number for your {americanBanks.find(b => b.value === selectedBank)?.label} account</p>
                      </div>
                    )}

                    {selectedBank === "other" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="other-bank-name" className="text-white/90">
                            Bank Name
                          </Label>
                          <Input
                            id="other-bank-name"
                            name="otherBankName"
                            type="text"
                            placeholder="Enter your bank name"
                            className="bg-white/5 border-white/20 text-[#581c87] md:text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="other-account-number" className="text-white/90">
                            Account Number
                          </Label>
                          <Input
                            id="other-account-number"
                            name="otherAccountNumber"
                            type="text"
                            placeholder="Enter your account number"
                            className="bg-white/5 border-white/20 text-[#581c87] md:text-white"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-white/90">
                        Withdrawal Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 text-lg">
                          $
                        </span>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          max={account.balance}
                          placeholder="0.00"
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          className="bg-white/5 border-white/20 text-[#581c87] md:text-white pl-8"
                          required
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Available</span>
                        <span className="text-white font-medium">${account.balance.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[25, 50, 75].map((percentage) => (
                        <button
                          key={percentage}
                          type="button"
                          onClick={() => setWithdrawalAmount(((account.balance * percentage) / 100).toFixed(2))}
                          className="py-2 px-3 text-sm bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                        >
                          {percentage}%
                        </button>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      disabled={loading || !selectedBank}
                    >
                      {loading ? (
                        "Processing..."
                      ) : (
                        <>
                          Request Withdrawal
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                <div className="bg-[#581c87] md:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-[#581c87] md:border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Withdrawal Information</h3>
                  <div className="space-y-4">
                    {selectedBank && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <p className="text-green-400 text-sm font-medium">
                          Selected Bank: {americanBanks.find(b => b.value === selectedBank)?.label || "Other Bank"}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-white/70">Please note the following information regarding withdrawals:</p>
                    <ul className="space-y-2 text-white/70">
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mr-2 mt-0.5">
                          •
                        </div>
                        <span>Minimum withdrawal amount is $10.00</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mr-2 mt-0.5">
                          •
                        </div>
                        <span>Bank transfers typically process in 1-3 business days</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mr-2 mt-0.5">
                          •
                        </div>
                        <span>Withdrawal fees may apply depending on your account type</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mr-2 mt-0.5">
                          •
                        </div>
                        <span>All withdrawals are subject to security verification</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mr-2 mt-0.5">
                          •
                        </div>
                        <span>Please ensure your account number is correct to avoid delays</span>
                      </li>
                    </ul>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
                      <p className="text-amber-400 text-sm">
                        For security reasons, large withdrawals may require additional verification steps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#581c87] md:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-[#581c87] md:border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-white/90">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-white/5 border-white/20 text-[#581c87] md:text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-number" className="text-white/90">
                        Account Number
                      </Label>
                      <Input
                        id="account-number"
                        value={account.account_number}
                        disabled
                        className="bg-white/5 border-white/20 text-[#581c87] md:text-white mt-1"
                      />
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                      Change Password
                    </Button>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="text-white/90">
                        Email Notifications
                      </Label>
                      <input
                        type="checkbox"
                        id="email-notifications"
                        aria-label="Email Notifications"
                        defaultChecked
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="transaction-alerts" className="text-white/90">
                        Transaction Alerts
                      </Label>
                      <input
                        type="checkbox"
                        id="transaction-alerts"
                        aria-label="Transaction Alerts"
                        defaultChecked
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="security-alerts" className="text-white/90">
                        Security Alerts
                      </Label>
                      <input
                        type="checkbox"
                        id="security-alerts"
                        aria-label="Security Alerts"
                        defaultChecked
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing" className="text-white/90">
                        Marketing Communications
                      </Label>
                      <input
                        type="checkbox"
                        id="marketing"
                        aria-label="Marketing Communications"
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

             {/* Live Market Rates - Full Width Section */}
             {/* <div className="mt-8 hidden md:block">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Live Market Rates</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={fetchLivePrices}
                    disabled={pricesLoading}
                    className="text-white/60 hover:text-white"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${pricesLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                {pricesLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-white/10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-20 bg-white/10 rounded"></div>
                          <div className="h-3 w-16 bg-white/5 rounded"></div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="h-4 w-16 bg-white/10 rounded"></div>
                          <div className="h-3 w-12 bg-white/5 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {livePrices.map((item) => (
                      <div key={item.symbol} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center space-x-3">
                          {item.type === 'crypto' && item.icon ? (
                            <img 
                              src={item.icon} 
                              alt={item.name} 
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.symbol === 'AAPL' ? 'bg-gray-500/20 text-gray-400' :
                              item.symbol === 'GOOGL' ? 'bg-blue-500/20 text-blue-400' :
                              item.symbol === 'MSFT' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {item.symbol.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium">{item.name}</div>
                            <div className="text-white/60 text-sm">{item.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatPrice(item.price)}</div>
                          <div className={`flex items-center justify-end space-x-1 text-sm ${
                            item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {item.changePercent >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>
                              {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                            </span>
                          </div>
                          <div className={`text-xs ${
                            item.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {item.change >= 0 ? '+' : '-'}{formatChange(item.change)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm text-white/40">
                    <span>Auto-refresh every 30 seconds • Data provided by CoinGecko</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                        <span>Crypto</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span>Stocks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
            
          </Tabs>
        </div>
      </div>
    </div>
  )
}
