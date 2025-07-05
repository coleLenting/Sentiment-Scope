"use client"

import { useState } from "react"
import {
  Heart,
  Mail,
  Lock,
  User,
  Zap,
  Brain,
  BarChart3,
  Eye,
  Play,
  Pause,
  TrendingUp,
  Target,
  FileText,
  Loader2,
  RotateCcw,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"
import { FileUploader } from "@/components/file-uploader"
import { BatchAnalysis } from "@/components/batch-analysis"
import { LiveTextAnalyzer } from "@/components/live-text-analyzer"
import { SentimentHistory } from "@/components/sentiment-history"
import { Header } from "@/components/header"
import { ModelSelector } from "@/components/model-selector"
import { ResultsDisplay } from "@/components/results-display"
import { SampleTexts } from "@/components/sample-texts"
import { AnalysisHistory } from "@/components/analysis-history"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/toaster"
import { geminiService } from "@/lib/gemini-service"
import { useToast } from "@/hooks/use-toast"
import { Footer } from "@/components/footer"
import { useSentimentStore } from "@/lib/sentiment-store"

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

const radarData = [
  { subject: "Accuracy", manual: 85, model: 92 },
  { subject: "Speed", manual: 45, model: 98 },
  { subject: "Consistency", manual: 70, model: 95 },
  { subject: "Scalability", manual: 30, model: 90 },
  { subject: "Cost", manual: 60, model: 85 },
]

const chartConfig = {
  manual: {
    label: "Manual Analysis",
    color: "#ff6b9d",
  },
  model: {
    label: "AI Model",
    color: "#4ecdc4",
  },
}

export default function MoodMapDashboard() {
  const [text, setText] = useState("")
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash-exp")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<SentimentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [realTimeMode, setRealTimeMode] = useState(true)
  const [progress, setProgress] = useState(67)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showBatchAnalysis, setShowBatchAnalysis] = useState(false)
  const [showLiveAnalysis, setShowLiveAnalysis] = useState(false)
  const [activeSection, setActiveSection] = useState<"analyze" | "compare" | "visualize" | null>(null)
  const { toast } = useToast()
  const { addEntry, liveFeed } = useSentimentStore()

  const maxCharacters = 5000

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      toast({
        title: "No text to analyze",
        description: "Please enter some text to analyze its sentiment.",
        variant: "destructive",
      })
      return
    }

    if (text.length > maxCharacters) {
      toast({
        title: "Text too long",
        description: `Please limit your text to ${maxCharacters} characters.`,
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    const startTime = Date.now()

    try {
      // Use enhanced Gemini analysis with preprocessing
      const preprocessedText = preprocessText(text)
      const analysis = await geminiService.analyzeSentiment(preprocessedText, selectedModel)
      const processingTime = Date.now() - startTime

      const resultWithTiming: SentimentResult = {
        ...analysis,
        processingTime,
      }

      setResult(resultWithTiming)

      // Add to unified store for real-time updates
      addEntry({
        text: text,
        sentiment: analysis.overall.sentiment,
        score: analysis.overall.score,
        confidence: analysis.overall.confidence,
        source: "normal",
        model: selectedModel,
      })

      toast({
        title: "Analysis complete!",
        description: `Sentiment analyzed in ${processingTime}ms with ${(analysis.overall.confidence * 100).toFixed(1)}% confidence`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Add text preprocessing function for better accuracy
  const preprocessText = (text: string): string => {
    // Normalize whitespace
    let processed = text.replace(/\s+/g, " ").trim()

    // Expand contractions for better understanding
    const contractions: Record<string, string> = {
      "won't": "will not",
      "can't": "cannot",
      "n't": " not",
      "'re": " are",
      "'ve": " have",
      "'ll": " will",
      "'d": " would",
      "'m": " am",
    }

    Object.entries(contractions).forEach(([contraction, expansion]) => {
      processed = processed.replace(new RegExp(contraction, "gi"), expansion)
    })

    return processed
  }

  const clearText = () => {
    setText("")
    setResult(null)
    setError(null)
  }

  const handleSampleSelect = (sampleText: string) => {
    setText(sampleText)
    setResult(null)
    setError(null)
  }

  const handleHistorySelect = (historyText: string) => {
    setText(historyText)
    setResult(null)
    setError(null)
  }

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files)
    setShowBatchAnalysis(true)
  }

  const resetBatchAnalysis = () => {
    setUploadedFiles([])
    setShowBatchAnalysis(false)
  }

  const handleAnalyzeClick = () => {
    setActiveSection(activeSection === "analyze" ? null : "analyze")
    setShowLiveAnalysis(!showLiveAnalysis)
  }

  const handleCompareClick = () => {
    setActiveSection(activeSection === "compare" ? null : "compare")
  }

  const handleVisualizeClick = () => {
    setActiveSection(activeSection === "visualize" ? null : "visualize")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Analyze Sentiment with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the emotional tone of any text using advanced Google Gemini AI technology
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              >
                ✨ Powered by Google Gemini
              </Badge>
              <Badge variant="outline">Real-time Analysis</Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Analysis Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Type className="h-5 w-5 text-blue-500" />
                    <span>Text Analysis</span>
                  </CardTitle>
                  <CardDescription>Enter your text below to analyze its sentiment and emotional tone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Enter your text to analyze sentiment... Try writing about your experiences, opinions, or any content you'd like to understand better."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[150px] resize-none text-base leading-relaxed"
                      maxLength={maxCharacters}
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {text.length} / {maxCharacters} characters
                      </span>
                      <div className="flex items-center space-x-2">
                        {text.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearText} className="h-8 px-3">
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Action</label>
                      <Button
                        onClick={analyzeSentiment}
                        disabled={isAnalyzing || !text.trim()}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 mr-2" />
                            Analyze Sentiment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 text-red-800 dark:text-red-400">
                      <div className="h-2 w-2 bg-red-500 rounded-full" />
                      <span className="font-medium">Analysis Error</span>
                    </div>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Results Display */}
              {result && <ResultsDisplay result={result} inputText={text} />}

              {/* Sample Texts */}
              <SampleTexts onSelectText={handleSampleSelect} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Analysis History */}
              <AnalysisHistory onSelectEntry={handleHistorySelect} />

              {/* API Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Google Gemini</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OpenAI GPT-4</span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Anthropic Claude</span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usage Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p>Longer texts generally provide more accurate sentiment analysis</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p>Try different types of content: reviews, social media posts, emails</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p>Use the sample texts to understand how the analysis works</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p>Export results for further analysis or reporting</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main App Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Analyze Card */}
            <Card
              className={`bg-gradient-to-br from-pink-500 to-purple-600 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                activeSection === "analyze" ? "ring-4 ring-yellow-400" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Zap className="w-8 h-8" />
                  Text Analysis
                </CardTitle>
                <CardDescription className="text-pink-100 font-semibold">
                  Instantly analyze the emotional tone of any text using advanced AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleAnalyzeClick}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg py-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  {activeSection === "analyze" ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                  {activeSection === "analyze" ? "CLOSE" : "ANALYZE"}
                </Button>
              </CardContent>
            </Card>

            {/* Compare Card */}
            <Card
              className={`bg-gradient-to-br from-teal-400 to-blue-600 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                activeSection === "compare" ? "ring-4 ring-yellow-400" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <BarChart3 className="w-8 h-8" />
                  Model Compare
                </CardTitle>
                <CardDescription className="text-teal-100 font-semibold">
                  Compare different sentiment analysis models side by side
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleCompareClick}
                  className="w-full bg-pink-500 hover:bg-pink-400 text-white font-black text-lg py-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <Target className="w-6 h-6 mr-2" />
                  {activeSection === "compare" ? "CLOSE" : "COMPARE"}
                </Button>
              </CardContent>
            </Card>

            {/* Visualize Card */}
            <Card
              className={`bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                activeSection === "visualize" ? "ring-4 ring-yellow-400" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Eye className="w-8 h-8" />
                  Data Viz
                </CardTitle>
                <CardDescription className="text-yellow-100 font-semibold">
                  Create beautiful visualizations of sentiment patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleVisualizeClick}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-lg py-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <TrendingUp className="w-6 h-6 mr-2" />
                  {activeSection === "visualize" ? "CLOSE" : "VISUALIZE"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Dynamic Sections Based on Active Selection */}
          {activeSection === "analyze" && (
            <div className="mb-12">
              <LiveTextAnalyzer isActive={true} />
            </div>
          )}

          {activeSection === "compare" && (
            <div className="mb-12">
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
                    <BarChart3 className="w-8 h-8 text-teal-600" />
                    Manual vs AI Comparison
                  </CardTitle>
                  <CardDescription className="text-gray-700 font-semibold">
                    Compare the efficiency and accuracy of manual analysis versus AI-powered sentiment analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer config={chartConfig} className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                        <PolarGrid stroke="#374151" strokeWidth={2} className="opacity-30" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{
                            fill: "#1f2937",
                            fontWeight: "bold",
                            fontSize: 14,
                          }}
                          className="font-black"
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{
                            fill: "#374151",
                            fontWeight: "bold",
                            fontSize: 12,
                          }}
                          tickCount={6}
                        />
                        <Radar
                          name="Manual Analysis"
                          dataKey="manual"
                          stroke="#ff6b9d"
                          fill="#ff6b9d"
                          fillOpacity={0.3}
                          strokeWidth={4}
                          dot={{ fill: "#ff6b9d", strokeWidth: 2, r: 6 }}
                        />
                        <Radar
                          name="AI Model"
                          dataKey="model"
                          stroke="#4ecdc4"
                          fill="#4ecdc4"
                          fillOpacity={0.3}
                          strokeWidth={4}
                          dot={{ fill: "#4ecdc4", strokeWidth: 2, r: 6 }}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "2px solid black",
                            borderRadius: "8px",
                            fontWeight: "bold",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Legend */}
                  <div className="flex justify-center gap-8 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#ff6b9d] rounded border-2 border-black"></div>
                      <span className="font-bold text-gray-800">Manual Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#4ecdc4] rounded border-2 border-black"></div>
                      <span className="font-bold text-gray-800">AI Model</span>
                    </div>
                  </div>

                  {/* Comparison Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                    {radarData.map((item) => (
                      <div
                        key={item.subject}
                        className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center"
                      >
                        <h4 className="font-black text-gray-800 text-sm mb-2">{item.subject}</h4>
                        <div className="space-y-1">
                          <div className="text-[#ff6b9d] font-bold text-lg">{item.manual}%</div>
                          <div className="text-[#4ecdc4] font-bold text-lg">{item.model}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "visualize" && (
            <div className="mb-12">
              <SentimentHistory />
            </div>
          )}

          {/* Tools and Controls Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Tools Info */}
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
                  <Brain className="w-8 h-8 text-purple-600" />
                  AI Tools Powered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-lg py-2 px-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    ✨ Google Gemini
                  </Badge>
                  <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white font-black text-lg py-2 px-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    🤗 Hugging Face
                  </Badge>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg py-2 px-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    ⚡ Real-time Analysis
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-lg">Real-time Mode</span>
                  <Switch
                    checked={realTimeMode}
                    onCheckedChange={setRealTimeMode}
                    className="data-[state=checked]:bg-teal-400 data-[state=unchecked]:bg-yellow-400"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-white font-bold text-lg">Analysis Progress</span>
                  <Progress
                    value={progress}
                    className="h-4 bg-white border-2 border-black [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-yellow-400"
                  />
                  <span className="text-yellow-300 font-bold">{progress}% Complete</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Live Sentiment Feed */}
          <div className="mb-12">
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
                  <Mail className="w-8 h-8 text-blue-600" />
                  Live Sentiment Feed
                  <Badge className="bg-green-500 text-white animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                    LIVE
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {liveFeed.length > 0 ? (
                  liveFeed.map((entry) => (
                    <div
                      key={entry.id}
                      className={`bg-gradient-to-r ${
                        entry.sentiment === "positive"
                          ? "from-green-400 to-green-500"
                          : entry.sentiment === "negative"
                            ? "from-red-400 to-red-500"
                            : "from-purple-400 to-purple-500"
                      } text-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold animate-in slide-in-from-right-4 duration-500`}
                    >
                      {entry.emoji} "{entry.text}" - {entry.sentiment.toUpperCase()} ({entry.score.toFixed(2)})
                      <span className="text-xs opacity-75 ml-2">{entry.timestamp.toLocaleTimeString()}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">
                      😊 "I love this new feature!" - POSITIVE (0.89)
                    </div>
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold ml-8">
                      😐 "It's okay, I guess." - NEUTRAL (0.12)
                    </div>
                    <div className="bg-gradient-to-r from-red-400 to-red-500 text-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">
                      😞 "This is frustrating." - NEGATIVE (-0.67)
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Batch Analysis Section */}
          <div className="mb-12">
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <FileText className="w-8 h-8" />
                  Batch Sentiment Analysis
                </CardTitle>
                <CardDescription className="text-blue-100 font-semibold">
                  Upload multiple files for batch processing and sentiment analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showBatchAnalysis ? (
                  <FileUploader onFilesSelected={handleFilesSelected} />
                ) : (
                  <BatchAnalysis files={uploadedFiles} onReset={resetBatchAnalysis} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fun Icons Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center gap-8 mb-8">
              <div className="bg-pink-500 p-4 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="bg-yellow-400 p-4 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                <Mail className="w-8 h-8 text-black" />
              </div>
              <div className="bg-teal-400 p-4 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-spin">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div className="bg-purple-500 p-4 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-foreground font-bold text-xl">
              🚀 Powered by cutting-edge AI • Built for the future of sentiment analysis
            </p>
          </div>
        </div>
      </main>

      <Toaster />
      <Footer />
    </div>
  )
}
