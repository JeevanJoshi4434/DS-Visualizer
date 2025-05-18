"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw } from "lucide-react"
import * as babel from "@babel/standalone"

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  onParse: (totalSteps: number) => void
}

export default function CodeEditor({ code, onChange, onParse }: CodeEditorProps) {
  const [localCode, setLocalCode] = useState(code)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setLocalCode(code)
  }, [code])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalCode(e.target.value)
  }

  const handleApply = () => {
    onChange(localCode)
    parseCode(localCode)
  }

  const parseCode = (codeString: string) => {
    setIsProcessing(true)

    try {
      // Parse the code to get AST
      const ast = babel.transform(codeString, {
        ast: true,
        presets: ["es2015"],
      }).ast

      // Count nodes to determine total steps
      let nodeCount = 0
      const countNodes = (node: any) => {
        nodeCount++

        for (const key in node) {
          if (key === "type" || key === "loc" || key === "start" || key === "end") continue

          const value = node[key]

          if (value && typeof value === "object") {
            if (Array.isArray(value)) {
              for (const item of value) {
                if (item && typeof item === "object" && "type" in item) {
                  countNodes(item)
                }
              }
            } else if ("type" in value) {
              countNodes(value)
            }
          }
        }
      }

      countNodes(ast.program)
      onParse(nodeCount)
    } catch (err) {
      console.error("Parse error:", err)
      onParse(0)
    } finally {
      setIsProcessing(false)
    }
  }

  // Initial parse
  useEffect(() => {
    parseCode(code)
  }, [])

  return (
    <div className="space-y-4">
      <Textarea
        value={localCode}
        onChange={handleChange}
        className="font-mono h-[300px] resize-none"
        placeholder="Enter JavaScript code here..."
      />
      <div className="flex justify-end">
        <Button onClick={handleApply} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            "Apply & Parse"
          )}
        </Button>
      </div>
    </div>
  )
}
