"use client"

import { useState } from "react"
import { Key, ExternalLink, Copy, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function SetupInstructions() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const apiProviders = [
    {
      name: "Hugging Face",
      key: "NEXT_PUBLIC_HUGGINGFACE_API_KEY",
      url: "https://huggingface.co/settings/tokens",
      status: process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY ? "✅ Configured" : "❌ Missing",
      free: true,
      description: "Free tier available with rate limits",
    },
    {
      name: "OpenAI",
      key: "NEXT_PUBLIC_OPENAI_API_KEY",
      url: "https://platform.openai.com/api-keys",
      status: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? "✅ Configured" : "❌ Missing",
      free: false,
      description: "Pay-per-use, very accurate",
    },
    {
      name: "Google Gemini",
      key: "NEXT_PUBLIC_GEMINI_API_KEY",
      url: "https://makersuite.google.com/app/apikey",
      status: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "✅ Configured" : "❌ Missing",
      free: true,
      description: "Free tier available",
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
          <Key className="w-8 h-8" />
          Real AI Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border-2 border-black">
          <p className="font-bold mb-3">To use real AI-powered sentiment analysis, you need API keys:</p>

          <div className="space-y-3">
            {apiProviders.map((provider) => (
              <div
                key={provider.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border-2 border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{provider.name}</span>
                    {provider.free && <Badge className="bg-green-500 text-white text-xs">FREE</Badge>}
                    <span className="text-sm">{provider.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(provider.key, provider.name)}
                    className="bg-gray-200 hover:bg-gray-300 text-black border border-black"
                  >
                    {copiedKey === provider.name ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" asChild className="bg-blue-500 hover:bg-blue-600 text-white border border-black">
                    <a href={provider.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3">
          <p className="text-yellow-800 font-bold text-sm">
            💡 <strong>Recommended:</strong> Start with Hugging Face (free) or Google Gemini (free) for testing, then
            upgrade to OpenAI for production use.
          </p>
        </div>

        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3">
          <p className="text-red-800 font-bold text-sm">
            ⚠️ <strong>Without API keys:</strong> The app will show errors. Set up at least one provider to get real AI
            analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
