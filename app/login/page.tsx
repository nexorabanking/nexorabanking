import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Download, List, Eye, Users, TrendingUp, TrendingDown } from "lucide-react"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden" style={{ backgroundColor: '#0a0a0f', color: 'white' }}>
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
                <h1 className="text-black md:text-white font-semibold text-lg">Nexora</h1>
                <p className="text-black/60 md:text-white/60 text-sm -mt-1">Banking</p>
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
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

        <div className="max-w-md mx-auto px-2 py-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
        {/* <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"> */}
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-black md:data-[state=active]:bg-white/10 data-[state=active]:text-white md:data-[state=active]:text-white text-black md:text-white/70"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-[#9333ea] md:data-[state=active]:bg-white/10 data-[state=active]:text-white md:data-[state=active]:text-white text-black md:text-white/70"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black md:text-white mb-2">Welcome Back</h2>
                  <p className="text-black/60 md:text-white/60">Access your sophisticated banking experience</p>
                </div>
                <LoginForm />
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black md:text-white mb-2">Join Nexora Banking</h2>
                  <p className="text-black/60 md:text-white/60">Experience the future of financial management</p>
                </div>
                <SignupForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        </div>
    )
}