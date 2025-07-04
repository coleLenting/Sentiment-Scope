"use client"

import { useState, useEffect } from "react"
import { FileText, Download, BarChart3, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { geminiService } from "@/lib/gemini-service"
import { useSentimentStore } from "@/lib/sentiment-store"

interface BatchAnalysisProps {
  files: File[]
  onReset: () => void
  provider?: "huggingface" | "openai" | "gemini"
}

interface AnalysisResult {
  fileName: string
  text: string
  sentiment: "positive" | "negative" | "neutral"
  score: number
  confidence: number
  status: "pending" | "analyzing" | "completed" | "error"
  error?: string
}

export function BatchAnalysis({ files, onReset, provider = "gemini" }: BatchAnalysisProps) {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<string>("")
  const { addBatchEntries } = useSentimentStore()

  useEffect(() => {
    if (files.length > 0) {
      initializeAnalysis()
    }
  }, [files])

  const initializeAnalysis = async () => {
    setIsAnalyzing(true)
    setProgress(0)

    // Initialize results array
    const initialResults: AnalysisResult[] = []

    for (const file of files) {
      try {
        const content = await readFileContent(file)
        const texts = parseFileContent(content, file.name)

        texts.forEach((text, index) => {
          initialResults.push({
            fileName: `${file.name} (${index + 1})`,
            text,
            sentiment: "neutral",
            score: 0,
            confidence: 0,
            status: "pending",
          })
        })
      } catch (error) {
        initialResults.push({
          fileName: file.name,
          text: "",
          sentiment: "neutral",
          score: 0,
          confidence: 0,
          status: "error",
          error: "Failed to read file",
        })
      }
    }

    setResults(initialResults)

    // Start analysis
    await analyzeTexts(initialResults)
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  const parseFileContent = (content: string, fileName: string): string[] => {
    if (fileName.endsWith(".csv")) {
      // Parse CSV - look for 'text' column
      const lines = content.split("\n").filter((line) => line.trim())
      if (lines.length === 0) return []

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
      const textColumnIndex = headers.findIndex(
        (h) => h.includes("text") || h.includes("content") || h.includes("message"),
      )

      if (textColumnIndex === -1) {
        // If no text column found, treat first column as text
        return lines
          .slice(1)
          .map((line) => {
            const columns = line.split(",")
            return columns[0]?.replace(/"/g, "").trim() || ""
          })
          .filter((text) => text.length > 0)
      }

      return lines
        .slice(1)
        .map((line) => {
          const columns = line.split(",")
          return columns[textColumnIndex]?.replace(/"/g, "").trim() || ""
        })
        .filter((text) => text.length > 0)
    } else {
      // Parse TXT - one line per text
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    }
  }

  const analyzeTexts = async (initialResults: AnalysisResult[]) => {
    const updatedResults = [...initialResults]
    const completedEntries: any[] = []

    for (let i = 0; i < updatedResults.length; i++) {
      const result = updatedResults[i]

      if (result.status === "error" || !result.text) {
        continue
      }

      setCurrentFile(result.fileName)
      updatedResults[i] = { ...result, status: "analyzing" }
      setResults([...updatedResults])

      try {
        // Use the real Gemini service
        const analysis = await geminiService.analyzeSentiment(result.text)

        updatedResults[i] = {
          ...result,
          sentiment: analysis.overall.sentiment,
          score: analysis.overall.score,
          confidence: analysis.overall.confidence,
          status: "completed",
        }

        // Collect completed entries for batch update
        completedEntries.push({
          text: result.text,
          sentiment: analysis.overall.sentiment,
          score: analysis.overall.score,
          confidence: analysis.overall.confidence,
          model: provider,
        })
      } catch (error) {
        updatedResults[i] = {
          ...result,
          status: "error",
          error: error instanceof Error ? error.message : "Analysis failed",
        }
      }

      setResults([...updatedResults])
      setProgress(((i + 1) / updatedResults.length) * 100)

      // Add delay to respect API rate limits
      if (i < updatedResults.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    }

    // Add all completed entries to the unified store
    if (completedEntries.length > 0) {
      addBatchEntries(completedEntries)
    }

    setIsAnalyzing(false)
    setCurrentFile("")
  }

  const exportResults = () => {
    const csvContent = [
      "File,Text,Sentiment,Score,Confidence,Status",
      ...results.map(
        (result) =>
          `"${result.fileName}","${result.text.replace(/"/g, '""')}","${result.sentiment}",${result.score},${result.confidence},"${result.status}"`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `batch-sentiment-analysis-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "analyzing":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-purple-500"
    }
  }

  const completedCount = results.filter((r) => r.status === "completed").length
  const errorCount = results.filter((r) => r.status === "error").length
  const avgScore =
    results.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.score, 0) / completedCount || 0
  const avgConfidence =
    results.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.confidence, 0) / completedCount || 0

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            Batch Analysis Results
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isAnalyzing && results.length > 0 && (
              <Button
                onClick={exportResults}
                size="sm"
                className="bg-green-600 hover:bg-green-500 text-white font-bold border-2 border-black"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
            <Button
              onClick={onReset}
              size="sm"
              variant="outline"
              className="border-2 border-black font-bold bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        {isAnalyzing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold">Analyzing files...</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-3" />
            {currentFile && <p className="text-sm text-blue-600 font-medium">Currently processing: {currentFile}</p>}
          </div>
        )}

        {/* Summary Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center">
              <div className="text-xl font-black text-blue-800">{results.length}</div>
              <div className="text-sm font-bold text-blue-600">Total Items</div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
              <div className="text-xl font-black text-green-800">{completedCount}</div>
              <div className="text-sm font-bold text-green-600">Completed</div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center">
              <div className="text-xl font-black text-red-800">{errorCount}</div>
              <div className="text-sm font-bold text-red-600">Errors</div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 text-center">
              <div className="text-xl font-black text-purple-800">{Math.round(progress)}%</div>
              <div className="text-sm font-bold text-purple-600">Progress</div>
            </div>
          </div>
        )}

        {/* Average Stats */}
        {completedCount > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
            <h5 className="font-bold mb-3 text-blue-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analysis Summary
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Average Sentiment Score:</span>
                <span className="font-bold ml-2">
                  {avgScore > 0 ? "+" : ""}
                  {avgScore.toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Average Confidence:</span>
                <span className="font-bold ml-2">{(avgConfidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Update Indicator */}
        {completedCount > 0 && !isAnalyzing && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-green-800">✅ {completedCount} analyses added to Timeline & History</span>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-black">Individual Results</h4>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(result.status)}
                      <span className="font-bold text-gray-900 truncate">{result.fileName}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate max-w-md">"{result.text}"</p>
                    {result.error && <p className="text-sm text-red-600 mt-1">Error: {result.error}</p>}
                  </div>

                  {result.status === "completed" && (
                    <div className="flex items-center gap-3 ml-4">
                      <Badge className={`${getSentimentColor(result.sentiment)} text-white font-bold`}>
                        {result.sentiment.toUpperCase()}
                      </Badge>

                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {result.score > 0 ? "+" : ""}
                          {result.score.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">{(result.confidence * 100).toFixed(0)}% conf.</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {results.length === 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h5 className="font-bold mb-2 text-blue-800">📁 Batch Analysis</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Upload CSV or TXT files for batch sentiment analysis</li>
              <li>• CSV files should have a 'text' column with content to analyze</li>
              <li>• TXT files should have one text entry per line</li>
              <li>• Results automatically update the Timeline & History</li>
              <li>• All analyses are saved for comprehensive tracking</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
