"use client"

interface SentimentGaugeProps {
  score: number
  size?: "sm" | "md" | "lg"
}

export function SentimentGauge({ score, size = "md" }: SentimentGaugeProps) {
  const dimensions = {
    sm: { size: 120, strokeWidth: 8, fontSize: "text-sm" },
    md: { size: 160, strokeWidth: 12, fontSize: "text-lg" },
    lg: { size: 200, strokeWidth: 16, fontSize: "text-xl" },
  }

  const { size: gaugeSize, strokeWidth, fontSize } = dimensions[size]
  const radius = (gaugeSize - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const center = gaugeSize / 2

  // Convert score (-1 to 1) to percentage (0 to 100)
  const percentage = ((score + 1) / 2) * 100
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Determine color based on score
  const getColor = (score: number) => {
    if (score > 0.1) return "#10b981" // green
    if (score < -0.1) return "#ef4444" // red
    return "#8b5cf6" // purple
  }

  const getSentimentLabel = (score: number) => {
    if (score > 0.1) return "Positive"
    if (score < -0.1) return "Negative"
    return "Neutral"
  }

  const color = getColor(score)
  const label = getSentimentLabel(score)

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <svg width={gaugeSize} height={gaugeSize} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />

          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.3))",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold ${fontSize}`} style={{ color }}>
            {score.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
        </div>
      </div>

      {/* Score scale */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <span>-1.0</span>
        <div className="w-24 h-1 bg-gradient-to-r from-red-500 via-purple-500 to-green-500 rounded-full" />
        <span>+1.0</span>
      </div>
    </div>
  )
}
