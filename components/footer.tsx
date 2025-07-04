"use client"

import { Heart, Zap, Brain, Sparkles, Github, Twitter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-12 h-12 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-8 h-8 bg-pink-500 rotate-45 opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-teal-400 rounded-lg opacity-25 animate-spin"></div>
        <div className="absolute bottom-10 right-1/3 w-10 h-10 bg-purple-400 rounded-full opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 to-teal-400">
                  SentimentScope
                </h3>
                <p className="text-white font-bold">AI-Powered Sentiment Analysis</p>
              </div>
            </div>
            <p className="text-white/80 font-medium text-lg leading-relaxed mb-6">
              Discover the emotional tone of any text using cutting-edge Google Gemini AI technology. Fast, accurate,
              and built for the future of sentiment analysis.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-sm py-2 px-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                ✨ Google Gemini 2.0
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-black text-sm py-2 px-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                🚀 Real-time Analysis
              </Badge>
              <Badge className="bg-gradient-to-r from-pink-400 to-red-500 text-white font-black text-sm py-2 px-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                💯 Free to Use
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xl font-black mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "#" },
                { name: "About", href: "#about" },
                { name: "Features", href: "#features" },
                { name: "API Docs", href: "#api" },
                { name: "Support", href: "#support" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-yellow-400 font-bold transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white text-xl font-black mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Connect
            </h4>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-bold"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-bold"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-bold"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Fun Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-3xl font-black text-white mb-2">10K+</div>
            <div className="text-white font-bold">Analyses</div>
          </div>
          <div className="bg-gradient-to-r from-teal-400 to-blue-600 p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-3xl font-black text-white mb-2">99.9%</div>
            <div className="text-white font-bold">Accuracy</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-3xl font-black text-white mb-2">&lt;1s</div>
            <div className="text-white font-bold">Response</div>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-3xl font-black text-white mb-2">24/7</div>
            <div className="text-white font-bold">Available</div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t-4 border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-white/80 font-bold text-center md:text-left">
              <p>© 2024 SentimentScope. Built with ❤️ and AI.</p>
              <p className="text-sm mt-1">Powered by Google Gemini • Made for developers</p>
            </div>

            {/* Fun Icons */}
            <div className="flex items-center gap-4">
              <div className="bg-pink-500 p-3 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="bg-yellow-400 p-3 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div className="bg-teal-400 p-3 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-spin">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="bg-purple-500 p-3 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                <Brain className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
