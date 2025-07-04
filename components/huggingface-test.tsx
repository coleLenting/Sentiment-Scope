"use client"

import { useState } from "react"
import { TestTube, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { sentimentService } from "@/lib/sentiment-service"

interface TestResult {
  model: string
  status: "testing" | "success" | "failed" | "loading"
  response?: any
  error?: string
  timing?: number
}

export function HuggingFaceTest() {
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [finalResult, setFinalResult] = useState<any>(null)
  const [testText, setTestText] = useState("I love this new feature! It's absolutely amazing and works perfectly.")

  const runTest = async () => {
    setTesting(true)
    setTestResults([])
    setFinalResult(null)

    // Initialize test results for all models
    const models = [
      "cardiffnlp/twitter-roberta-base-sentiment-latest",
      "nlptown/bert-base-multilingual-uncased-sentiment",
      "distilbert-base-uncased-finetuned-sst-2-english",
    ]

    const initialResults: TestResult[] = models.map((model) => ({
      model,
      status: "testing",
    }))
    setTestResults(initialResults)

    try {
      console.log("🧪 Starting Hugging Face API test...")
      const startTime = Date.now()

      const result = await sentimentService.analyzeText(testText, "huggingface")
      const endTime = Date.now()

      console.log("✅ Test completed successfully:", result)
      setFinalResult({
        ...result,
        timing: endTime - startTime,
        success: true,
      })
    } catch (error) {
      console.error("❌ Test failed:", error)
      setFinalResult({
        error: error.message,
        success: false,
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "testing":
        return <Clock className="w-4 h-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "loading":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "testing":
        return "bg-blue-100 text-blue-800"
      case "success":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "loading":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
          <TestTube className="w-8 h-8 text-purple-600" />
          Hugging Face API Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Input */}
        <div className="space-y-2">
          <label className="font-bold text-black">Test Text:</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full h-20 p-3 border-2 border-black rounded-lg font-medium resize-none focus:outline-none focus:ring-4 focus:ring-purple-400"
            placeholder="Enter text to test sentiment analysis..."
          />
        </div>

        {/* Test Button */}
        <Button
          onClick={runTest}
          disabled={testing || !testText.trim()}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-lg py-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
        >
          {testing ? (
            <>
              <Clock className="w-6 h-6 mr-2 animate-spin" />
              Testing API...
            </>
          ) : (
            <>
              <TestTube className="w-6 h-6 mr-2" />
              Test Hugging Face API
            </>
          )}
        </Button>

        {/* API Status Check */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          <h4 className="font-bold mb-2">API Configuration:</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>API Key Status:</span>
              <Badge className={process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY ? "bg-green-500" : "bg-red-500"}>
                {process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY ? "✅ Configured" : "❌ Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Environment:</span>
              <Badge className="bg-blue-500">{typeof window !== "undefined" ? "Client" : "Server"}</Badge>
            </div>
          </div>
        </div>

        {/* Model Testing Progress */}
        {testing && (
          <div className="space-y-3">
            <h4 className="font-bold">Testing Models:</h4>
            {testResults.map((result, index) => (
              <div key={result.model} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium text-sm">{result.model}</span>
                </div>
                <Badge className={getStatusColor(result.status)}>{result.status.toUpperCase()}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Test Results */}
        {finalResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg">Test Results:</h4>
              <Badge className={finalResult.success ? "bg-green-500" : "bg-red-500"}>
                {finalResult.success ? "✅ SUCCESS" : "❌ FAILED"}
              </Badge>
            </div>

            {finalResult.success ? (
              <div className="space-y-4">
                {/* Overall Sentiment */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h5 className="font-bold mb-2">Overall Sentiment:</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-black">
                        {finalResult.overall.sentiment === "positive" && "😊"}
                        {finalResult.overall.sentiment === "negative" && "😞"}
                        {finalResult.overall.sentiment === "neutral" && "😐"}
                      </div>
                      <div className="font-bold">{finalResult.overall.sentiment.toUpperCase()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black">{finalResult.overall.score.toFixed(3)}</div>
                      <div className="text-sm font-bold text-gray-600">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black">{(finalResult.overall.confidence * 100).toFixed(1)}%</div>
                      <div className="text-sm font-bold text-gray-600">Confidence</div>
                    </div>
                  </div>
                </div>

                {/* Word Analysis */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h5 className="font-bold mb-2">Word Analysis:</h5>
                  <div className="flex flex-wrap gap-2">
                    {finalResult.words.slice(0, 10).map((word, index) => (
                      <Badge
                        key={index}
                        className={`${
                          word.sentiment === "positive"
                            ? "bg-green-500"
                            : word.sentiment === "negative"
                              ? "bg-red-500"
                              : "bg-purple-500"
                        } text-white font-bold`}
                      >
                        {word.word} ({word.score.toFixed(2)})
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <h5 className="font-bold mb-2">Metrics:</h5>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xl font-black">{finalResult.metrics.wordCount}</div>
                      <div className="text-sm font-bold text-gray-600">Words</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-green-600">{finalResult.metrics.positiveWords}</div>
                      <div className="text-sm font-bold text-gray-600">Positive</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-red-600">{finalResult.metrics.negativeWords}</div>
                      <div className="text-sm font-bold text-gray-600">Negative</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-purple-600">{finalResult.metrics.neutralWords}</div>
                      <div className="text-sm font-bold text-gray-600">Neutral</div>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <h5 className="font-bold mb-2">Performance:</h5>
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <Badge className="bg-yellow-500">{finalResult.timing}ms</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h5 className="font-bold mb-2 text-red-800">Error Details:</h5>
                <p className="text-red-700 font-medium">{finalResult.error}</p>
                <div className="mt-3 text-sm text-red-600">
                  <p>
                    <strong>Possible solutions:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check if your Hugging Face API key is valid</li>
                    <li>Verify your internet connection</li>
                    <li>Try again in a few minutes (models might be loading)</li>
                    <li>Switch to Gemini or OpenAI provider as alternative</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Console Log Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h5 className="font-bold mb-2">🔍 Debug Information:</h5>
          <p className="text-sm text-blue-700">
            Open your browser's Developer Tools (F12) and check the Console tab for detailed API logs and error
            messages.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
