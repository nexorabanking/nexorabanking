"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}

export function CryptoPricesTable() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCryptoData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Using CoinGecko API (free, no API key required)
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&locale=en"
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch crypto data")
      }
      
      const data = await response.json()
      setCryptoData(data)
    } catch (err) {
      setError("Failed to load crypto prices")
      console.error("Error fetching crypto data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCryptoData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price)
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    } else {
      return `$${marketCap.toLocaleString()}`
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`
    } else {
      return `$${volume.toLocaleString()}`
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-center space-x-2 text-white/60">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading crypto prices...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchCryptoData} variant="outline" className="border-white/20 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Top Cryptocurrencies</h3>
          <Button 
            onClick={fetchCryptoData} 
            size="sm" 
            variant="ghost" 
            className="text-white/60 hover:text-white"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-white/60 font-medium">#</th>
              <th className="text-left p-4 text-white/60 font-medium">Name</th>
              <th className="text-right p-4 text-white/60 font-medium">Price</th>
              <th className="text-right p-4 text-white/60 font-medium">24h Change</th>
              <th className="text-right p-4 text-white/60 font-medium">Market Cap</th>
              <th className="text-right p-4 text-white/60 font-medium">Volume</th>
            </tr>
          </thead>
          <tbody>
            {cryptoData.map((crypto, index) => (
              <tr key={crypto.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white/60">{index + 1}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={crypto.image} 
                      alt={crypto.name} 
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-white font-medium">{crypto.name}</div>
                      <div className="text-white/60 text-sm">{crypto.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="text-white font-mono">{formatPrice(crypto.current_price)}</div>
                </td>
                <td className="p-4 text-right">
                  <div className={`flex items-center justify-end space-x-1 ${
                    crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="text-white/80 font-mono">{formatMarketCap(crypto.market_cap)}</div>
                </td>
                <td className="p-4 text-right">
                  <div className="text-white/60 font-mono">{formatVolume(crypto.total_volume)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-white/40">
          <span>Data provided by CoinGecko</span>
          <span>Auto-refresh every 30 seconds</span>
        </div>
      </div>
    </div>
  )
} 