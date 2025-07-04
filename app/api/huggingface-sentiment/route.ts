import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Try multiple models in order of preference
    const models = [
      "cardiffnlp/twitter-roberta-base-sentiment-latest",
      "nlptown/bert-base-multilingual-uncased-sentiment",
      "distilbert-base-uncased-finetuned-sst-2-english",
    ]

    let sentimentResult = null
    let modelUsed = ""

    // Try each model until one works
    for (const model of models) {
      try {
        console.log(`[Server] Trying Hugging Face model: ${model}`)

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: text,
            options: {
              wait_for_model: true,
              use_cache: false,
            },
          }),
        })

        if (response.ok) {
          const result = await response.json()

          // Check if model is loading
          if (result.error && result.error.includes("loading")) {
            console.log(`[Server] Model ${model} is loading, waiting...`)
            await new Promise((resolve) => setTimeout(resolve, 2000))
            continue
          }

          if (Array.isArray(result) && result.length > 0) {
            sentimentResult = result
            modelUsed = model
            console.log(`[Server] Successfully used model: ${model}`)
            break
          }
        } else {
          const errorText = await response.text()
          console.log(`[Server] Model ${model} failed with status: ${response.status}, error: ${errorText}`)
          continue
        }
      } catch (modelError) {
        console.log(`[Server] Model ${model} failed:`, modelError)
        continue
      }
    }

    if (!sentimentResult) {
      return NextResponse.json(
        {
          error: "All Hugging Face models failed. Please try again later.",
        },
        { status: 503 },
      )
    }

    // Process sentiment results based on model type
    let sentiment: "positive" | "negative" | "neutral"
    let score: number
    let confidence: number

    if (modelUsed.includes("twitter-roberta")) {
      // Handle RoBERTa model output
      const predictions = sentimentResult[0] || []
      const topPrediction = predictions.reduce((prev: any, current: any) =>
        prev.score > current.score ? prev : current,
      )

      switch (topPrediction.label) {
        case "LABEL_2": // Positive
          sentiment = "positive"
          score = topPrediction.score
          break
        case "LABEL_0": // Negative
          sentiment = "negative"
          score = -topPrediction.score
          break
        default: // Neutral
          sentiment = "neutral"
          score = 0
      }
      confidence = topPrediction.score
    } else {
      // Handle other model outputs (BERT, DistilBERT)
      const predictions = sentimentResult[0] || []
      const topPrediction = predictions.reduce((prev: any, current: any) =>
        prev.score > current.score ? prev : current,
      )

      if (topPrediction.label.toLowerCase().includes("positive")) {
        sentiment = "positive"
        score = topPrediction.score
      } else if (topPrediction.label.toLowerCase().includes("negative")) {
        sentiment = "negative"
        score = -topPrediction.score
      } else {
        sentiment = "neutral"
        score = 0
      }
      confidence = topPrediction.score
    }

    return NextResponse.json({
      sentiment: {
        sentiment,
        score,
        confidence,
      },
      model: modelUsed,
      success: true,
    })
  } catch (error) {
    console.error("[Server] Hugging Face API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error while processing sentiment analysis",
      },
      { status: 500 },
    )
  }
}
