"use client"

// Unified Sentiment Analysis Store for Real-time Updates
export interface SentimentEntry {
  id: string
  text: string
  sentiment: "positive" | "negative" | "neutral"
  score: number
  confidence: number
  timestamp: Date
  source: "normal" | "live" | "batch"
  model?: string
}

export interface LiveFeedEntry {
  id: string
  text: string
  sentiment: "positive" | "negative" | "neutral"
  score: number
  emoji: string
  timestamp: Date
}

class SentimentStore {
  private listeners: Set<() => void> = new Set()
  private entries: SentimentEntry[] = []
  private liveFeed: LiveFeedEntry[] = []
  private maxEntries = 100
  private maxLiveFeed = 10

  constructor() {
    this.loadFromStorage()
  }

  // Subscribe to store changes
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Notify all listeners of changes
  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  // Add new sentiment entry
  addEntry(entry: Omit<SentimentEntry, "id" | "timestamp">) {
    const newEntry: SentimentEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    this.entries = [newEntry, ...this.entries].slice(0, this.maxEntries)
    this.saveToStorage()
    this.notify()

    // Also update live feed for real-time display
    this.updateLiveFeed(newEntry)
  }

  // Add batch entries
  addBatchEntries(entries: Omit<SentimentEntry, "id" | "timestamp" | "source">[]) {
    const newEntries: SentimentEntry[] = entries.map((entry) => ({
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      source: "batch" as const,
    }))

    this.entries = [...newEntries, ...this.entries].slice(0, this.maxEntries)
    this.saveToStorage()
    this.notify()

    // Update live feed with latest batch entry
    if (newEntries.length > 0) {
      this.updateLiveFeed(newEntries[0])
    }
  }

  // Update live feed
  private updateLiveFeed(entry: SentimentEntry) {
    const emoji = this.getSentimentEmoji(entry.sentiment)
    const liveFeedEntry: LiveFeedEntry = {
      id: entry.id,
      text: entry.text.slice(0, 50) + (entry.text.length > 50 ? "..." : ""),
      sentiment: entry.sentiment,
      score: entry.score,
      emoji,
      timestamp: entry.timestamp,
    }

    this.liveFeed = [liveFeedEntry, ...this.liveFeed].slice(0, this.maxLiveFeed)
    this.notify()
  }

  // Get sentiment emoji
  private getSentimentEmoji(sentiment: string): string {
    switch (sentiment) {
      case "positive":
        return "😊"
      case "negative":
        return "😞"
      default:
        return "😐"
    }
  }

  // Get all entries
  getEntries(): SentimentEntry[] {
    return [...this.entries]
  }

  // Get live feed
  getLiveFeed(): LiveFeedEntry[] {
    return [...this.liveFeed]
  }

  // Get chart data for timeline
  getChartData() {
    return this.entries
      .slice(0, 50) // Last 50 entries for chart
      .reverse()
      .map((entry, index) => ({
        time: entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        score: entry.score,
        confidence: entry.confidence,
        sentiment: entry.sentiment,
        source: entry.source,
        text: entry.text.slice(0, 30) + (entry.text.length > 30 ? "..." : ""),
      }))
  }

  // Get statistics
  getStats() {
    const total = this.entries.length
    const positive = this.entries.filter((e) => e.sentiment === "positive").length
    const negative = this.entries.filter((e) => e.sentiment === "negative").length
    const neutral = this.entries.filter((e) => e.sentiment === "neutral").length
    const avgScore = this.entries.reduce((sum, e) => sum + e.score, 0) / total || 0
    const avgConfidence = this.entries.reduce((sum, e) => sum + e.confidence, 0) / total || 0

    return {
      total,
      positive,
      negative,
      neutral,
      avgScore,
      avgConfidence,
    }
  }

  // Clear all data
  clear() {
    this.entries = []
    this.liveFeed = []
    this.saveToStorage()
    this.notify()
  }

  // Export data
  exportData() {
    return {
      entries: this.entries,
      liveFeed: this.liveFeed,
      exportedAt: new Date().toISOString(),
    }
  }

  // Save to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem(
        "sentimentscope-unified-store",
        JSON.stringify({
          entries: this.entries,
          liveFeed: this.liveFeed,
        }),
      )
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  // Load from localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("sentimentscope-unified-store")
      if (stored) {
        const data = JSON.parse(stored)
        this.entries = (data.entries || []).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
        this.liveFeed = (data.liveFeed || []).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
      this.entries = []
      this.liveFeed = []
    }
  }
}

// Create singleton instance
export const sentimentStore = new SentimentStore()

// React hook for using the store
import { useState, useEffect } from "react"

export function useSentimentStore() {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const unsubscribe = sentimentStore.subscribe(() => {
      forceUpdate({})
    })
    return unsubscribe
  }, [])

  return {
    entries: sentimentStore.getEntries(),
    liveFeed: sentimentStore.getLiveFeed(),
    chartData: sentimentStore.getChartData(),
    stats: sentimentStore.getStats(),
    addEntry: (entry: Omit<SentimentEntry, "id" | "timestamp">) => sentimentStore.addEntry(entry),
    addBatchEntries: (entries: Omit<SentimentEntry, "id" | "timestamp" | "source">[]) =>
      sentimentStore.addBatchEntries(entries),
    clear: () => sentimentStore.clear(),
    exportData: () => sentimentStore.exportData(),
  }
}
