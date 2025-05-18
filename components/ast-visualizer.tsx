"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import * as babel from "@babel/standalone"

interface ASTVisualizerProps {
  code: string
  currentStep: number
  zoom: number
  onTotalStepsChange: (steps: number) => void
}

interface Node {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  children: Node[]
  parent?: Node
  properties?: Record<string, any>
  highlighted?: boolean
}

export default function ASTVisualizer({ code, currentStep, zoom, onTotalStepsChange }: ASTVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ast, setAst] = useState<any>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [visitSequence, setVisitSequence] = useState<Node[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Parse the code and generate AST
  useEffect(() => {
    try {
      const parsedAst = babel.transform(code, {
        ast: true,
        presets: ["es2015"],
      }).ast

      setAst(parsedAst)
      setError(null)

      // Update AST output for debugging
      const astOutput = document.getElementById("ast-output")
      if (astOutput) {
        astOutput.textContent = JSON.stringify(parsedAst, null, 2)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setAst(null)
    }
  }, [code])

  // Build the node tree
  useEffect(() => {
    if (!ast) return

    const nodeMap = new Map<string, Node>()
    const visitSeq: Node[] = []
    let idCounter = 0

    // Create a unique ID for each node
    const createId = () => {
      idCounter++
      return `node-${idCounter}`
    }

    // Recursively build the tree
    const buildTree = (astNode: any, parent?: Node, depth = 0): Node => {
      const id = createId()
      const type = astNode.type || "Unknown"

      // Create node with initial position (will be calculated later)
      const node: Node = {
        id,
        type,
        x: 0,
        y: 0,
        width: 120,
        height: 40,
        children: [],
        parent,
        properties: {},
      }

      // Add to visit sequence
      visitSeq.push(node)

      // Extract properties
      for (const key in astNode) {
        if (key === "type" || key === "loc" || key === "start" || key === "end") continue

        const value = astNode[key]

        if (value && typeof value === "object") {
          if (Array.isArray(value)) {
            // Handle arrays of nodes
            for (const item of value) {
              if (item && typeof item === "object" && "type" in item) {
                const childNode = buildTree(item, node, depth + 1)
                node.children.push(childNode)
              }
            }
          } else if ("type" in value) {
            // Handle single node
            const childNode = buildTree(value, node, depth + 1)
            node.children.push(childNode)
          } else {
            // Handle other objects as properties
            node.properties[key] = JSON.stringify(value).substring(0, 20)
          }
        } else if (value !== undefined && value !== null) {
          // Handle primitive values
          node.properties[key] = String(value)
        }
      }

      nodeMap.set(id, node)
      return node
    }

    // Start building from the program node
    const rootNode = buildTree(ast.program)

    // Calculate positions
    const calculatePositions = (node: Node, x = 0, y = 0, level = 0) => {
      const levelHeight = 100
      const horizontalSpacing = 150

      node.y = y + level * levelHeight

      if (node.children.length === 0) {
        node.x = x
        return node.width
      }

      let totalWidth = 0
      let childX = x

      for (const child of node.children) {
        const childWidth = calculatePositions(child, childX, y, level + 1)
        childX += childWidth + horizontalSpacing
        totalWidth += childWidth
      }

      // Add spacing between children
      totalWidth += horizontalSpacing * (node.children.length - 1)

      // Center the node above its children
      if (node.children.length > 0) {
        const firstChild = node.children[0]
        const lastChild = node.children[node.children.length - 1]
        node.x = (firstChild.x + lastChild.x + lastChild.width) / 2 - node.width / 2
      } else {
        node.x = x
      }

      return Math.max(node.width, totalWidth)
    }

    calculatePositions(rootNode)

    setNodes([rootNode])
    setVisitSequence(visitSeq)
    onTotalStepsChange(visitSeq.length)
  }, [ast, onTotalStepsChange])

  // Draw the AST on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || nodes.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match container
    const resizeCanvas = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    resizeCanvas()

    // Add resize observer to handle container size changes (especially for fullscreen)
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
      // Redraw after resize
      requestAnimationFrame(() => {
        drawAST()
      })
    })

    resizeObserver.observe(container)

    // Function to draw the AST
    const drawAST = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply zoom and pan
      ctx.save()
      ctx.translate(pan.x + canvas.width / 2, pan.y + 50)
      ctx.scale(zoom, zoom)

      // Calculate the bounds of the tree
      let minX = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY
      const traverseForBounds = (node: Node) => {
        minX = Math.min(minX, node.x)
        maxX = Math.max(maxX, node.x + node.width)
        minY = Math.min(minY, node.y)
        maxY = Math.max(maxY, node.y + node.height)

        for (const child of node.children) {
          traverseForBounds(child)
        }
      }

      traverseForBounds(nodes[0])

      // Center the tree
      const treeWidth = maxX - minX
      const offsetX = -treeWidth / 2 - minX

      // Draw connections
      const drawConnections = (node: Node) => {
        for (const child of node.children) {
          ctx.beginPath()
          ctx.moveTo(node.x + offsetX + node.width / 2, node.y + node.height)
          ctx.lineTo(child.x + offsetX + child.width / 2, child.y)
          ctx.strokeStyle = "#888"
          ctx.lineWidth = 1
          ctx.stroke()

          drawConnections(child)
        }
      }

      drawConnections(nodes[0])

      // Draw nodes
      const drawNode = (node: Node) => {
        const isHighlighted = currentStep < visitSequence.length && visitSequence[currentStep].id === node.id

        // Draw node rectangle
        ctx.beginPath()
        ctx.roundRect(node.x + offsetX, node.y, node.width, node.height, 8)

        if (isHighlighted) {
          ctx.fillStyle = "#3b82f6"
          ctx.strokeStyle = "#1d4ed8"
        } else {
          ctx.fillStyle = "#f3f4f6"
          ctx.strokeStyle = "#d1d5db"
        }

        ctx.lineWidth = 2
        ctx.fill()
        ctx.stroke()

        // Draw node text
        ctx.fillStyle = isHighlighted ? "#ffffff" : "#1f2937"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.type, node.x + offsetX + node.width / 2, node.y + node.height / 2)

        // Draw properties if highlighted
        if (isHighlighted && Object.keys(node.properties || {}).length > 0) {
          ctx.fillStyle = "#ffffff"
          ctx.strokeStyle = "#1d4ed8"

          const propBox = {
            x: node.x + offsetX,
            y: node.y + node.height + 10,
            width: node.width,
            height: Object.keys(node.properties || {}).length * 20 + 10,
          }

          ctx.beginPath()
          ctx.roundRect(propBox.x, propBox.y, propBox.width, propBox.height, 8)
          ctx.fill()
          ctx.stroke()

          ctx.fillStyle = "#1f2937"
          ctx.textAlign = "left"
          ctx.font = "10px sans-serif"

          let propY = propBox.y + 15
          for (const [key, value] of Object.entries(node.properties || {})) {
            ctx.fillText(`${key}: ${value}`, propBox.x + 10, propY)
            propY += 20
          }
        }

        // Draw children
        for (const child of node.children) {
          drawNode(child)
        }
      }

      drawNode(nodes[0])

      ctx.restore()

      // Draw error if any
      if (error) {
        ctx.fillStyle = "#ef4444"
        ctx.font = "14px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Error: " + error, canvas.width / 2, 30)
      }
    }

    // Initial draw
    drawAST()

    return () => {
      resizeObserver.disconnect()
    }
  }, [nodes, currentStep, visitSequence, error, zoom, pan])

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      {error && <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-800 p-2 text-sm">{error}</div>}
    </div>
  )
}
