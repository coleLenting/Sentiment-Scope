"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useSentimentStore } from "@/lib/sentiment-store"

export function SentimentHistory() {
  const { chartData, stats, entries, exportData, clear } = useSentimentStore()
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h")

  const exportDataToCsv = () => {
    const data = exportData()
    const csvContent = [
      "Timestamp,Text,Sentiment,Score,Confidence,Source,Model",
      ...data.entries.map(
        (entry) =>
          `"${entry.timestamp}","${entry.text.replace(/"/g, '""')}","${entry.sentiment}",${entry.score},${entry.confidence},"${entry.source}","${entry.model || "N/A"}"`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sentiment-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const chartConfig = {
    score: {
      label: "Sentiment Score",
      color: "#8b5cf6",
    },
    confidence: {
      label: "Confidence",
      color: "#06b6d4",
    },
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "normal":
        return "bg-blue-500"
      case "live":
        return "bg-green-500"
      case "batch":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "normal":
        return "Normal Analysis"
      case "live":
        return "Live Analysis"
      case "batch":
        return "Batch Analysis"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            Unified Sentiment Timeline & Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportDataToCsv}
              size="sm"
              className="bg-green-600 hover:bg-green-500 text-white font-bold border-2 border-black"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={clear}
              size="sm"
              variant="outline"
              className="border-2 border-black font-bold bg-transparent hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(["1h", "24h", "7d", "30d"] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              className={`font-bold border-2 border-black ${
                timeRange === range
                  ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Real-time Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black">{stats.total}</div>
            <div className="text-sm font-bold opacity-90">Total Analyses</div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black">{stats.positive}</div>
            <div className="text-sm font-bold opacity-90">Positive</div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black">{stats.negative}</div>
            <div className="text-sm font-bold opacity-90">Negative</div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black">{stats.neutral}</div>
            <div className="text-sm font-bold opacity-90">Neutral</div>
          </div>
        </div>

        {/* Dynamic Sentiment Timeline Chart */}
        <div className="space-y-4">
          <h4 className="text-lg font-black flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Real-time Sentiment Timeline
          </h4>

          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 12, fontWeight: "bold" }} stroke="#374151" />
                  <YAxis domain={[-1, 1]} tick={{ fontSize: 12, fontWeight: "bold" }} stroke="#374151" />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border-2 border-black rounded-lg shadow-lg">
                            <p className="font-bold">{label}</p>
                            <p className="text-sm">Score: {data.score.toFixed(3)}</p>
                            <p className="text-sm">Confidence: {(data.confidence * 100).toFixed(1)}%</p>
                            <p className="text-sm">Source: {getSourceLabel(data.source)}</p>
                            <p className="text-sm italic">"{data.text}"</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-score)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-score)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium">No sentiment data yet</p>
                <p className="text-sm text-gray-500">Start analyzing text to see the timeline</p>
              </div>
            </div>
          )}
        </div>

        {/* Comprehensive Recent Analyses */}
        <div className="space-y-4">
          <h4 className="text-lg font-black flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            All Recent Analyses
          </h4>

          {entries.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {entries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${getSourceColor(entry.source)} text-white text-xs`}>
                        {getSourceLabel(entry.source)}
                      </Badge>
                      {entry.model && (
                        <Badge variant="outline" className="text-xs">
                          {entry.model}
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 truncate max-w-xs">"{entry.text}"</p>
                    <p className="text-sm text-gray-600">{entry.timestamp.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={`font-bold ${
                        entry.sentiment === "positive"
                          ? "bg-green-500 text-white"
                          : entry.sentiment === "negative"
                            ? "bg-red-500 text-white"
                            : "bg-purple-500 text-white"
                      }`}
                    >
                      {entry.sentiment.toUpperCase()}
                    </Badge>

                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {entry.score > 0 ? "+" : ""}
                        {entry.score.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">{(entry.confidence * 100).toFixed(0)}% conf.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No analyses yet. Start analyzing text to see your history!</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
          <h5 className="font-bold mb-3 text-blue-800">📊 Live Summary Statistics</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Average Sentiment Score:</span>
              <span className="font-bold ml-2">
                {stats.avgScore > 0 ? "+" : ""}
                {stats.avgScore.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Average Confidence:</span>
              <span className="font-bold ml-2">{(stats.avgConfidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
