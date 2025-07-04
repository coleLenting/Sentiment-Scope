"use client"

import { useState, useEffect } from "react"
import { Clock, Trash2, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HistoryEntry {
  id: string
  text: string
  sentiment: "positive" | "negative" | "neutral"
  score: number
  confidence: number
  timestamp: Date
}

interface AnalysisHistoryProps {
  onSelectEntry: (text: string) => void
}

export function AnalysisHistory({ onSelectEntry }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    // Load only real history from localStorage
    const savedHistory = localStorage.getItem("sentimentscope-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
        setHistory(parsed)
      } catch (error) {
        console.error("Failed to parse history:", error)
        setHistory([])
      }
    }
  }, [])

  const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
    }

    const updatedHistory = [newEntry, ...history].slice(0, 10) // Keep only last 10
    setHistory(updatedHistory)

    // Save to localStorage
    localStorage.setItem("sentimentscope-history", JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("sentimentscope-history")
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-purple-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    }
  }

  // Expose addToHistory function globally so it can be called from the main component
  useEffect(() => {
    ;(window as any).addToSentimentHistory = addToHistory
  }, [history])

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span>Recent Analyses</span>
          </CardTitle>
          <CardDescription>Your recent sentiment analyses will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No analyses yet. Try analyzing some text to see your history!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span>Recent Analyses</span>
            </CardTitle>
            <CardDescription>Your last {history.length} sentiment analyses</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => onSelectEntry(entry.text)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getSentimentIcon(entry.sentiment)}
                    <Badge className={getSentimentColor(entry.sentiment)}>{entry.sentiment}</Badge>
                    <span className="text-sm font-medium">{entry.score.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleDateString()}{" "}
                      {entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{entry.text}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Confidence: {(entry.confidence * 100).toFixed(0)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 text-xs"
                  >
                    Analyze Again
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
