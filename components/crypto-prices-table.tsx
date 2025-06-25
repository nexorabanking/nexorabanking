"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  volume: number
  sector?: string
}

export function CryptoPricesTable() {
  const [stockData, setStockData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStockData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Using Yahoo Finance API (free, no API key required)
      // This fetches data for major stocks
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK-B', 'UNH', 'JNJ']
      const promises = symbols.map(async (symbol) => {
        try {
          const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`)
          if (!response.ok) throw new Error(`Failed to fetch ${symbol}`)
          
          const data = await response.json()
          const quote = data.chart.result[0].meta
          const indicators = data.chart.result[0].indicators.quote[0]
          
          const currentPrice = quote.regularMarketPrice
          const previousClose = quote.previousClose
          const change = currentPrice - previousClose
          const changePercent = (change / previousClose) * 100
          
          return {
            symbol: symbol,
            name: quote.symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            marketCap: quote.marketCap || 0,
            volume: indicators.volume[0] || 0,
            sector: getSector(symbol)
          }
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err)
          return null
        }
      })
      
      const results = await Promise.all(promises)
      const validResults = results.filter(result => result !== null) as StockData[]
      
      if (validResults.length === 0) {
        throw new Error("No stock data available")
      }
      
      setStockData(validResults)
    } catch (err) {
      setError("Failed to load stock data")
      console.error("Error fetching stock data:", err)
    } finally {
      setLoading(false)
    }
  }

  const getSector = (symbol: string): string => {
    const sectors: { [key: string]: string } = {
      'AAPL': 'Technology',
      'MSFT': 'Technology',
      'GOOGL': 'Technology',
      'AMZN': 'Consumer Cyclical',
      'TSLA': 'Automotive',
      'NVDA': 'Technology',
      'META': 'Technology',
      'BRK-B': 'Financial Services',
      'UNH': 'Healthcare',
      'JNJ': 'Healthcare'
    }
    return sectors[symbol] || 'Unknown'
  }

  useEffect(() => {
    fetchStockData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStockData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
      return `${(volume / 1e9).toFixed(2)}B`
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`
    } else {
      return volume.toLocaleString()
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-center space-x-2 text-white/60">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading stock prices...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchStockData} variant="outline" className="border-white/20 text-white">
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
          <h3 className="text-xl font-semibold text-white">Top Stocks</h3>
          <Button 
            onClick={fetchStockData} 
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
              <th className="text-left p-4 text-white/60 font-medium">Symbol</th>
              <th className="text-left p-4 text-white/60 font-medium">Company</th>
              <th className="text-right p-4 text-white/60 font-medium">Price</th>
              <th className="text-right p-4 text-white/60 font-medium">Change</th>
              <th className="text-right p-4 text-white/60 font-medium">Market Cap</th>
              <th className="text-right p-4 text-white/60 font-medium">Volume</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((stock, index) => (
              <tr key={stock.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white/60">{index + 1}</td>
                <td className="p-4">
                  <div className="text-white font-bold">{stock.symbol}</div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="text-white font-medium">{stock.name}</div>
                    {stock.sector && (
                      <div className="text-white/60 text-sm">{stock.sector}</div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="text-white font-mono">{formatPrice(stock.price)}</div>
                </td>
                <td className="p-4 text-right">
                  <div className={`flex items-center justify-end space-x-1 ${
                    stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.changePercent >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <div className="text-right">
                      <div className="font-medium">
                        {stock.changePercent >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                      <div className="text-sm">
                        {stock.change >= 0 ? '+' : ''}
                        {formatPrice(stock.change)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="text-white/80 font-mono">{formatMarketCap(stock.marketCap)}</div>
                </td>
                <td className="p-4 text-right">
                  <div className="text-white/60 font-mono">{formatVolume(stock.volume)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-white/40">
          <span>Data provided by Yahoo Finance</span>
          <span>Auto-refresh every 30 seconds</span>
        </div>
      </div>
    </div>
  )
} 