import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Download, List, Eye, Users, TrendingUp, TrendingDown } from "lucide-react"
import { CryptoPricesTable } from "@/components/crypto-prices-table"
import Link from "next/link"
import { DynamicAuthButton } from "@/components/dynamic-auth-button"
import { getUser } from "@/lib/auth"
import { User } from "lucide-react" // Import the User component

export default async function HomePage() {
  // Get current user if logged in
  const user = await getUser()

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

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* <a href="#" className="text-white hover:text-purple-400 transition-colors">
                Home
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                Market
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                FAQs
              </a> */}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
            <DynamicAuthButton user={user} />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-6 py-16">
         

        {/* Beta Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
            Welcome to Nexora Banking!
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-3xl md:text-7xl font-bold text-white mb-6 leading-tight">
            A Touch of Class in
            <br />
            Your Every Financial Decision.
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Financial decisions don't have to be stressful or complicated. Here, we believe in taking a sophisticated
            approach to your money management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {!user ? (
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-8 py-4 text-lg group"
              >
                Get started for free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
             ) : (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-8 py-4 text-lg group"
              >
                <a href={user.role === "admin" ? "/admin" : "/dashboard"}>
                  Access Your Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            )}

            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                <img 
                  src="/client-1.jpeg?w=40&h=40&fit=crop&crop=face&auto=format" 
                  alt="User 1" 
                  className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
                />
                <img 
                  src="/client-2.jpeg?w=40&h=40&fit=crop&crop=face&auto=format" 
                  alt="User 2" 
                  className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
                />
                <img 
                  src="/client-3.jpeg?w=40&h=40&fit=crop&crop=face&auto=format" 
                  alt="User 3" 
                  className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Trusted by over +20K</p>
                <p className="text-white/60 text-sm">people in the Europe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Crypto Prices Table */}
        <div className="mb-16">
          {/* <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Live Crypto Prices</h2>
            <p className="text-white/60">Real-time cryptocurrency market data</p>
          </div> */}
          <CryptoPricesTable />
        </div>

        {/* Auth Section */}
        {/* <div className="max-w-md mx-auto"> */}
        {/* <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"> */}
        {/* <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"> */}
            {/* <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-white/60">Access your sophisticated banking experience</p>
                </div>
                <LoginForm />
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Join Olsa Banking</h2>
                  <p className="text-white/60">Experience the future of financial management</p>
                </div>
                <SignupForm />
              </TabsContent>
            </Tabs>
          </div>
        </div> */}

        {/* Demo Credentials */}
        {/* <div className="mt-12 max-w-md mx-auto">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-400/20 rounded-2xl p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">Demo Access</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Customer</span>
                  <span className="text-white font-mono">customer@example.com</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Admin</span>
                  <span className="text-white font-mono">admin@olsabank.com</span>
                </div>
                <div className="text-xs text-white/50 mt-3">Password: Use the respective role name + "123"</div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}
