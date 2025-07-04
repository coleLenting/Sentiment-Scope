"use client"

import { Sparkles, MessageSquare, Star, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SampleTextsProps {
  onSelectText: (text: string) => void
}

export function SampleTexts({ onSelectText }: SampleTextsProps) {
  const samples = [
    {
      category: "Positive",
      icon: Star,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      texts: [
        "I absolutely love this new product! It exceeded all my expectations and the customer service was outstanding.",
        "What an amazing experience! The team was incredibly helpful and the results were fantastic.",
        "This is exactly what I was looking for. Brilliant work and excellent attention to detail!",
      ],
    },
    {
      category: "Negative",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      texts: [
        "I'm really disappointed with this service. The quality was poor and it didn't meet my expectations at all.",
        "Terrible experience. The product broke after just one day and customer support was unhelpful.",
        "This is frustrating and completely unacceptable. I want my money back immediately.",
      ],
    },
    {
      category: "Neutral",
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      texts: [
        "The product arrived on time and matches the description. It's okay for the price point.",
        "I received the item yesterday. It's functional and does what it's supposed to do.",
        "The service was standard. Nothing particularly good or bad to report about the experience.",
      ],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <span>Sample Texts</span>
        </CardTitle>
        <CardDescription>Try these sample texts to see how sentiment analysis works</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {samples.map((category) => (
          <div key={category.category} className="space-y-3">
            <div className="flex items-center space-x-2">
              <category.icon className={`h-4 w-4 ${category.color}`} />
              <h4 className="font-medium text-sm">{category.category} Examples</h4>
            </div>
            <div className="grid gap-2">
              {category.texts.map((text, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-auto p-3 text-left justify-start text-wrap ${category.bgColor} ${category.borderColor} hover:opacity-80 transition-opacity`}
                  onClick={() => onSelectText(text)}
                >
                  <div className="text-sm leading-relaxed">{text}</div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
