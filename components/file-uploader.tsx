"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, X, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
}

export function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type === "text/plain" ||
        file.type === "text/csv" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".csv"),
    )

    if (files.length > 0) {
      setSelectedFiles(files)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) =>
        file.type === "text/plain" ||
        file.type === "text/csv" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".csv"),
    )

    if (files.length > 0) {
      setSelectedFiles(files)
    }
  }, [])

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
          <Upload className="w-8 h-8 text-blue-600" />
          File Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drag and Drop Area */}
        <div
          className={`relative border-4 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".txt,.csv"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div>
              <p className="text-lg font-bold text-gray-900">Drop your files here or click to browse</p>
              <p className="text-sm text-gray-600 mt-2">Supports .txt and .csv files up to 10MB each</p>
            </div>

            <div className="flex justify-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">TXT</Badge>
              <Badge className="bg-green-100 text-green-800">CSV</Badge>
            </div>
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-lg">Selected Files ({selectedFiles.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFile(index)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleAnalyze}
            disabled={selectedFiles.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg py-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-6 h-6 mr-2" />
            Analyze Files ({selectedFiles.length})
          </Button>

          {selectedFiles.length > 0 && (
            <Button
              onClick={() => setSelectedFiles([])}
              variant="outline"
              className="border-4 border-black font-black hover:bg-gray-100"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* File Format Info */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <h5 className="font-bold mb-2 text-yellow-800">📄 Supported Formats:</h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              <strong>TXT files:</strong> Plain text files with one sentence per line
            </li>
            <li>
              <strong>CSV files:</strong> Must have a 'text' column containing the text to analyze
            </li>
            <li>
              <strong>Size limit:</strong> Maximum 10MB per file
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
