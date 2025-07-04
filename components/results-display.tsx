"use client"

import { useState } from "react"
import { Copy, Download, TrendingUp, TrendingDown, Minus, Brain, Target, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SentimentGauge } from "./sentiment-gauge"
import { useToast } from "@/hooks/use-toast"

interface SentimentResult {
  overall: {
    sentiment: "positive" | "negative" | "neutral"
    score: number
    confidence: number
  }
  emotions?: {
    joy?: number
    anger?: number
    sadness?: number
    fear?: number
    surprise?: number
    disgust?: number
  }
  keyPhrases: string[]
  analysis: string
  processingTime: number
}

interface ResultsDisplayProps {
  result: SentimentResult
  inputText: string
}

export function ResultsDisplay({ result, inputText }: ResultsDisplayProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Minus className="h-5 w-5 text-purple-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "from-green-500 to-emerald-600"
      case "negative":
        return "from-red-500 to-rose-600"
      default:
        return "from-purple-500 to-violet-600"
    }
  }

  const copyResults = async () => {
    const resultsText = `
SentimentScope Analysis Results
==============================

Input Text: "${inputText}"

Overall Sentiment: ${result.overall.sentiment.toUpperCase()}
Score: ${result.overall.score.toFixed(3)}
Confidence: ${(result.overall.confidence * 100).toFixed(1)}%

Key Phrases: ${result.keyPhrases.join(", ")}

Analysis: ${result.analysis}

Processing Time: ${result.processingTime}ms
Generated: ${new Date().toLocaleString()}
    `.trim()

    try {
      await navigator.clipboard.writeText(resultsText)
      setCopied(true)
      toast({
        title: "Results copied!",
        description: "Analysis results have been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy results to clipboard.",
        variant: "destructive",
      })
    }
  }

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      inputText,
      results: result,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sentiment-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Results exported!",
      description: "Analysis results have been downloaded as JSON.",
    })
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Main Results Card */}
      <Card className="overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${getSentimentColor(result.overall.sentiment)} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getSentimentIcon(result.overall.sentiment)}
              <div>
                <CardTitle className="text-2xl font-bold">
                  {result.overall.sentiment.charAt(0).toUpperCase() + result.overall.sentiment.slice(1)} Sentiment
                </CardTitle>
                <CardDescription className="text-white/80">
                  Analysis completed in {result.processingTime}ms
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={copyResults}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={exportResults}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Sentiment Gauge */}
            <div className="flex justify-center">
              <SentimentGauge score={result.overall.score} size="lg" />
            </div>

            {/* Metrics */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Confidence Level</span>
                  <span className="text-sm text-muted-foreground">{(result.overall.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={result.overall.confidence * 100} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{result.overall.score.toFixed(3)}</div>
                  <div className="text-sm text-muted-foreground">Sentiment Score</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {(result.overall.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add accuracy confidence indicator */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h5 className="font-bold mb-2">Analysis Accuracy</h5>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Confidence Level:</span>
            <Badge
              className={`${
                result.overall.confidence > 0.8
                  ? "bg-green-500"
                  : result.overall.confidence > 0.6
                    ? "bg-yellow-500"
                    : "bg-red-500"
              } text-white`}
            >
              {result.overall.confidence > 0.8 ? "High" : result.overall.confidence > 0.6 ? "Medium" : "Low"} Accuracy
            </Badge>
          </div>
          <Progress value={result.overall.confidence * 100} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {result.overall.confidence > 0.8
              ? "Very reliable analysis with high confidence"
              : result.overall.confidence > 0.6
                ? "Good analysis with moderate confidence"
                : "Analysis may be less reliable due to ambiguous content"}
          </p>
        </div>
      </div>

      {/* Key Phrases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span>Key Phrases</span>
          </CardTitle>
          <CardDescription>Words and phrases that influenced the sentiment analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {result.keyPhrases.map((phrase, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-colors"
              >
                {phrase}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emotional Breakdown */}
      {result.emotions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span>Emotional Breakdown</span>
            </CardTitle>
            <CardDescription>Detailed emotional analysis of the text</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(result.emotions).map(([emotion, value]) => (
                <div key={emotion} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{emotion}</span>
                    <span className="text-sm text-muted-foreground">{((value || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(value || 0) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>AI Analysis</span>
          </CardTitle>
          <CardDescription>Detailed explanation of the sentiment analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-foreground leading-relaxed">{result.analysis}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
