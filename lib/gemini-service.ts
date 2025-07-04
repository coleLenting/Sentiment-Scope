interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface SentimentAnalysis {
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
    trust?: number
    anticipation?: number
  }
  keyPhrases: string[]
  analysis: string
  contextualFactors?: {
    sarcasm?: number
    formality?: number
    subjectivity?: number
    intensity?: number
  }
  linguisticFeatures?: {
    negations?: number
    intensifiers?: number
    emoticons?: number
    exclamations?: number
  }
}

export class GeminiSentimentService {
  private apiKey: string | null
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models"

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || null
  }

  async analyzeSentiment(text: string, model = "gemini-2.0-flash"): Promise<SentimentAnalysis> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable.")
    }

    if (!text.trim()) {
      throw new Error("Text cannot be empty")
    }

    // Enhanced prompt for maximum accuracy
    const prompt = `
You are an expert sentiment analysis AI with deep understanding of human emotions, context, and linguistic nuances. Analyze the following text with extreme precision.

ANALYSIS REQUIREMENTS:
1. Consider context, sarcasm, irony, and implicit meanings
2. Account for cultural and linguistic variations
3. Evaluate emotional intensity and subtlety
4. Consider negations, qualifiers, and conditional statements
5. Analyze both explicit and implicit sentiment indicators

TEXT TO ANALYZE: "${text}"

Return a JSON object with this EXACT structure:
{
  "overall": {
    "sentiment": "positive" | "negative" | "neutral",
    "score": number between -1.0 and 1.0 (precise to 3 decimals),
    "confidence": number between 0.0 and 1.0 (how certain you are)
  },
  "emotions": {
    "joy": number between 0.0 and 1.0,
    "anger": number between 0.0 and 1.0,
    "sadness": number between 0.0 and 1.0,
    "fear": number between 0.0 and 1.0,
    "surprise": number between 0.0 and 1.0,
    "disgust": number between 0.0 and 1.0,
    "trust": number between 0.0 and 1.0,
    "anticipation": number between 0.0 and 1.0
  },
  "keyPhrases": ["array of 3-8 most influential phrases"],
  "analysis": "Detailed 2-3 sentence explanation of your reasoning",
  "contextualFactors": {
    "sarcasm": number between 0.0 and 1.0,
    "formality": number between 0.0 and 1.0,
    "subjectivity": number between 0.0 and 1.0,
    "intensity": number between 0.0 and 1.0
  },
  "linguisticFeatures": {
    "negations": number (count of negation words),
    "intensifiers": number (count of intensifying words),
    "emoticons": number (count of emotional symbols),
    "exclamations": number (count of exclamation marks)
  }
}

SCORING GUIDELINES:
- Score -1.0: Extremely negative (hatred, despair, fury)
- Score -0.7: Very negative (anger, disappointment, frustration)
- Score -0.3: Somewhat negative (mild criticism, concern)
- Score 0.0: Truly neutral (factual, balanced, no emotional lean)
- Score +0.3: Somewhat positive (mild approval, satisfaction)
- Score +0.7: Very positive (happiness, excitement, praise)
- Score +1.0: Extremely positive (euphoria, love, ecstasy)

CONFIDENCE GUIDELINES:
- 0.9-1.0: Crystal clear sentiment, unambiguous
- 0.7-0.9: Clear sentiment with minor ambiguity
- 0.5-0.7: Moderate confidence, some mixed signals
- 0.3-0.5: Low confidence, highly ambiguous
- 0.0-0.3: Very uncertain, contradictory signals

Return ONLY the JSON object, no additional text.
    `

    // Use more precise generation config for better accuracy
    const generationConfig = {
      temperature: 0.05, // Very low for consistency
      topK: 1,
      topP: 0.8,
      maxOutputTokens: 3072,
      candidateCount: 1,
    }

    try {
      const response = await fetch(`${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: generationConfig,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`,
        )
      }

      const data: GeminiResponse = await response.json()

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response from Gemini API")
      }

      let content = data.candidates[0].content.parts[0].text

      // Clean up the response - remove markdown code blocks if present
      content = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim()

      // Try to find JSON within the response if it's wrapped in other text
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        content = jsonMatch[0]
      }

      let analysis: SentimentAnalysis
      try {
        analysis = JSON.parse(content)
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", content)
        throw new Error(`Invalid JSON response from Gemini: ${parseError.message}`)
      }

      // Validate the response structure
      if (!analysis.overall || typeof analysis.overall.sentiment !== "string") {
        throw new Error("Invalid response structure from Gemini API")
      }

      // Ensure score is within bounds
      analysis.overall.score = Math.max(-1, Math.min(1, analysis.overall.score))
      analysis.overall.confidence = Math.max(0, Math.min(1, analysis.overall.confidence))

      // Ensure keyPhrases is an array
      if (!Array.isArray(analysis.keyPhrases)) {
        analysis.keyPhrases = []
      }

      // Ensure analysis is a string
      if (typeof analysis.analysis !== "string") {
        analysis.analysis = "Sentiment analysis completed successfully."
      }

      return analysis
    } catch (error) {
      console.error("Gemini API error:", error)

      // Provide a fallback response
      if (error.message.includes("API key")) {
        throw error
      }

      // Return a basic analysis as fallback
      const words = text.toLowerCase().split(/\s+/)
      const positiveWords = [
        "good",
        "great",
        "excellent",
        "amazing",
        "wonderful",
        "fantastic",
        "love",
        "like",
        "happy",
        "awesome",
      ]
      const negativeWords = [
        "bad",
        "terrible",
        "awful",
        "hate",
        "horrible",
        "disgusting",
        "worst",
        "sad",
        "angry",
        "frustrated",
      ]

      const positiveCount = words.filter((word) => positiveWords.includes(word)).length
      const negativeCount = words.filter((word) => negativeWords.includes(word)).length

      let sentiment: "positive" | "negative" | "neutral" = "neutral"
      let score = 0

      if (positiveCount > negativeCount) {
        sentiment = "positive"
        score = Math.min(0.8, positiveCount * 0.2)
      } else if (negativeCount > positiveCount) {
        sentiment = "negative"
        score = Math.max(-0.8, -negativeCount * 0.2)
      }

      return {
        overall: {
          sentiment,
          score,
          confidence: 0.6,
        },
        keyPhrases: words.filter((word) => [...positiveWords, ...negativeWords].includes(word)),
        analysis: `Fallback analysis: The text appears to be ${sentiment} based on keyword analysis. This is a simplified analysis due to API limitations.`,
      }
    }
  }
}

export const geminiService = new GeminiSentimentService()
