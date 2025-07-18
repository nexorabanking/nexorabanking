"use client"

import { Shield, Lock, Users, Globe, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black/20 border-t border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Nexora Banking</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Secure, modern digital banking platform built for the future of digital finance.
            </p>
          </div>

          {/* Support */}
          <div className="space-y-4">
            {/* <h3 className="text-white font-semibold text-lg">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  Security Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul> */}
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Support</h3>
            <div className="space-y-3 text-sm">
              {/* <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                <span className="text-white/60">
                4512 Edgewood Avenue, Fresno, CA 93710
                </span>
              </div> */}
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                <span className="text-white/60">+1 (559) 1CO-YOTE</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                <span className="text-white/60">support@nexorabanking.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-white/40">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
            </div>
            
            <div className="text-sm text-white/40">
              © {currentYear} Nexora Banking. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 