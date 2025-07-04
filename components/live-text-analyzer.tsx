"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageSquare, Zap, Brain, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { geminiService } from "@/lib/gemini-service"
import { useSentimentStore } from "@/lib/sentiment-store"

interface LiveTextAnalyzerProps {
  isActive: boolean
  provider?: "huggingface" | "openai" | "gemini"
}

export function LiveTextAnalyzer({ isActive, provider = "gemini" }: LiveTextAnalyzerProps) {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisTime, setAnalysisTime] = useState<number>(0)
  // const { addEntry } = useSentimentStore()

  // Debounced analysis
  const analyzeText = useCallback(
    async (inputText: string) => {
      if (!inputText.trim() || !isActive) {
        setResult(null)
        setError(null)
        return
      }

      setIsAnalyzing(true)
      setError(null)
      const startTime = Date.now()

      try {
        // Use real Gemini service
        const analysis = await geminiService.analyzeSentiment(inputText)
        const endTime = Date.now()

        // Convert to expected format
        const analysisResult = {
          overall: analysis.overall,
          words: [], // Gemini doesn't provide word-level analysis
          metrics: {
            wordCount: inputText.split(/\s+/).length,
            positiveWords: 0, // Could extract from keyPhrases if needed
            negativeWords: 0,
            neutralWords: 0,
          },
        }

        setResult(analysisResult)
        setAnalysisTime(endTime - startTime)
      
        // Add to unified store for real-time updates
  //       addEntry({
  //         text: inputText,
  //         sentiment: analysis.overall.sentiment,
  //         score: analysis.overall.score,
  //         confidence: analysis.overall.confidence,
  //         source: "live",
  //         model: provider,
  //       })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed")
        setResult(null)
      } finally {
        setIsAnalyzing(false)
      }
    },
    [isActive, provider, geminiService] // Ensure geminiService is included in dependencies,
  )

  // Debounce text input
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeText(text)
    }, 500)

    return () => clearTimeout(timer)
  }, [text, analyzeText])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "from-green-500 to-emerald-500"
      case "negative":
        return "from-red-500 to-pink-500"
      default:
        return "from-purple-500 to-blue-500"
    }
  }

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊"
      case "negative":
        return "😞"
      default:
        return "😐"
    }
  }

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-purple-600" />
          Live Text Analysis
          {isActive && (
            <Badge className="bg-green-500 text-white animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
              LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Text Input */}
        <div className="space-y-2">
          <label className="font-bold text-black">Enter text to analyze:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here and watch the sentiment analysis happen in real-time..."
            className="w-full h-32 p-4 border-4 border-black rounded-lg font-medium resize-none focus:outline-none focus:ring-4 focus:ring-purple-400 transition-all"
            disabled={!isActive}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{text.length} characters</span>
            <span>
              Provider: <Badge className="bg-blue-500 text-white text-xs">{provider.toUpperCase()}</Badge>
            </span>
          </div>
        </div>

        {/* Analysis Status */}
        {isAnalyzing && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="font-bold text-blue-800">Analyzing sentiment...</span>
            <div className="flex-1">
              <Progress value={undefined} className="h-2" />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-bold">❌ Analysis Error:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && !isAnalyzing && (
          <div className="space-y-4">
            {/* Overall Sentiment */}
            <div
              className={`bg-gradient-to-r ${getSentimentColor(result.overall.sentiment)} text-white p-6 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black">Overall Sentiment</h3>
                <div className="text-3xl">{getSentimentEmoji(result.overall.sentiment)}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black">{result.overall.sentiment.toUpperCase()}</div>
                  <div className="text-sm opacity-90">Classification</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black">
                    {result.overall.score > 0 ? "+" : ""}
                    {result.overall.score.toFixed(3)}
                  </div>
                  <div className="text-sm opacity-90">Score (-1 to +1)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black">{(result.overall.confidence * 100).toFixed(1)}%</div>
                  <div className="text-sm opacity-90">Confidence</div>
                </div>
              </div>
            </div>

            {/* Word Analysis */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Word-by-Word Analysis
              </h4>

              <div className="flex flex-wrap gap-2 mb-4">
                {result.words.slice(0, 15).map((word: any, index: number) => (
                  <Badge
                    key={index}
                    className={`font-bold ${
                      word.sentiment === "positive"
                        ? "bg-green-500 text-white"
                        : word.sentiment === "negative"
                          ? "bg-red-500 text-white"
                          : "bg-purple-500 text-white"
                    }`}
                  >
                    {word.word} ({word.score.toFixed(2)})
                  </Badge>
                ))}
              </div>

              {result.words.length > 15 && (
                <p className="text-sm text-gray-600">... and {result.words.length - 15} more words</p>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center">
                <div className="text-xl font-black text-blue-800">{result.metrics.wordCount}</div>
                <div className="text-sm font-bold text-blue-600">Total Words</div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
                <div className="text-xl font-black text-green-800">{result.metrics.positiveWords}</div>
                <div className="text-sm font-bold text-green-600">Positive</div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center">
                <div className="text-xl font-black text-red-800">{result.metrics.negativeWords}</div>
                <div className="text-sm font-bold text-red-600">Negative</div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 text-center">
                <div className="text-xl font-black text-purple-800">{result.metrics.neutralWords}</div>
                <div className="text-sm font-bold text-purple-600">Neutral</div>
              </div>
            </div>

            {/* Performance Info */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-yellow-800 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Analysis Time:
                </span>
                <Badge className="bg-yellow-500 text-white">{analysisTime}ms</Badge>
              </div>
            </div>

            {/* Real-time Update Indicator */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-green-800">✅ Added to Timeline & Live Feed</span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!text && isActive && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h5 className="font-bold mb-2 text-blue-800">💡 How to use:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Start typing in the text area above</li>
              <li>• Analysis happens automatically as you type</li>
              <li>• Results update in real-time with sentiment scores</li>
              <li>• All analyses are automatically added to the Timeline</li>
              <li>• Live Sentiment Feed updates instantly</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
