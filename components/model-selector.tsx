"use client"

import { ChevronDown, Sparkles, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const models = [
    {
      id: "gemini-2.0-flash-exp",
      name: "Google Gemini 2.0 Flash",
      description: "Latest model, fast & efficient",
      available: true,
      recommended: true,
    },
    {
      id: "gemini-1.5-pro",
      name: "Google Gemini 1.5 Pro",
      description: "Advanced analysis capabilities",
      available: true,
      recommended: false,
    },
    {
      id: "huggingface",
      name: "Hugging Face Models",
      description: "Coming soon",
      available: false,
      recommended: false,
    },
    {
      id: "gpt-4",
      name: "OpenAI GPT-4",
      description: "Coming soon",
      available: false,
      recommended: false,
    },
    {
      id: "claude",
      name: "Anthropic Claude",
      description: "Coming soon",
      available: false,
      recommended: false,
    },
  ]

  const selectedModelData = models.find((m) => m.id === selectedModel)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">AI Model</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-12 px-4 text-left font-normal bg-transparent">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{selectedModelData?.name}</span>
                <span className="text-xs text-muted-foreground">{selectedModelData?.description}</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="start">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Select AI Model</span>
            <Badge variant="secondary" className="text-xs">
              Google Gemini Active
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {models.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => model.available && onModelChange(model.id)}
              disabled={!model.available}
              className={`flex items-center space-x-3 p-3 cursor-pointer ${
                !model.available ? "opacity-50 cursor-not-allowed" : ""
              } ${selectedModel === model.id ? "bg-accent" : ""}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                {model.available ? (
                  <Sparkles className="h-4 w-4 text-white" />
                ) : (
                  <Lock className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{model.name}</span>
                  {model.recommended && (
                    <Badge variant="default" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                  {!model.available && (
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{model.description}</p>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <div className="p-3 text-xs text-muted-foreground">
            Currently using Google Gemini - other models coming soon
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
