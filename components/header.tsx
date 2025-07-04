"use client"

import { useState } from "react"
import { Moon, Sun, Menu, Brain, Settings, Info, Home } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "#", icon: Home },
    { name: "About", href: "#about", icon: Info },
    { name: "Features", href: "#features", icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 border-b-4 border-black shadow-[0_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black text-white drop-shadow-lg">SentimentScope</h1>
              <p className="text-sm font-bold text-white/80">AI-Powered Sentiment Analysis</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-xl font-black text-white drop-shadow-lg">SentimentScope</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-sm font-black text-white/90 hover:text-yellow-300 transition-colors duration-200 hover:scale-105 transform"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            ))}
          </nav>

          {/* Theme Toggle and Mobile Menu */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-10 w-10 bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 rounded-lg"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10 bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 rounded-lg"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] bg-gradient-to-br from-purple-600 to-blue-600 border-l-4 border-black"
              >
                <div className="flex flex-col space-y-6 mt-6">
                  <div className="flex items-center space-x-3 pb-6 border-b-2 border-white/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-white text-lg">SentimentScope</h2>
                      <p className="text-xs font-bold text-white/80">AI-Powered Analysis</p>
                    </div>
                  </div>
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 text-sm font-black text-white hover:text-yellow-300 transition-colors py-3 px-4 rounded-lg hover:bg-white/10"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
