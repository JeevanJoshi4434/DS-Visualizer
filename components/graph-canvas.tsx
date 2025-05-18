
import type React from "react"

import { useRef, useEffect, useState } from "react"
import {
  type Graph,
  createGraph,
  addVertex,
  addEdge,
  removeVertex,
  findNearestVertex,
  removeEdge,
} from "@/lib/graph-utils"
import {
  runBFS,
  runDFS,
  runDijkstra,
  runPrim,
  runKruskal,
  runTopologicalSort,
  type AlgorithmStep,
} from "@/lib/graph-algorithms"
import type { GraphAlgorithm, NodeStatus, EdgeStatus } from "@/lib/algorithm-types"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RefreshCw,
  Target,
  CheckCircle,
  XCircle,
  Move,
  Link,
  Trash,
  Scissors,
  Eraser
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

// Update the GraphCanvasProps interface to include graph and setGraph
interface GraphCanvasProps {
  graph: Graph
  setGraph: React.Dispatch<React.SetStateAction<Graph>>
  isWeighted: boolean
  isDirected: boolean
  algorithm: GraphAlgorithm
  currentStep: number
  onTotalStepsChange: (steps: number) => void
  startVertex: string | null
  endVertex: string | null
  onSelectVertex: (id: string) => void
  edgeWeight: number
  customVisitedVertices?: Set<string>
  sourceDestSelectionMode?: boolean
  visitedSelectionMode?: boolean
  removeVisitedMode?: boolean
  vertexMoveMode?: boolean
  addEdgeMode?: boolean
  removeVertexMode?: boolean
  removeEdgeMode?: boolean
  totalSteps?: number
  setAddEdgeMode?: React.Dispatch<React.SetStateAction<boolean>>
  isPlaying?: boolean
  onPlay?: () => void
  onStepForward?: () => void
  onStepBack?: () => void
  onReset?: () => void
  onStepChange?: (step: number) => void
  onToggleSourceDestMode?: () => void
  onToggleVisitedMode?: () => void
  onToggleRemoveVisitedMode?: () => void
  onToggleVertexMoveMode?: () => void
  onToggleAddEdgeMode?: () => void
  onToggleRemoveVertexMode?: () => void
  onToggleRemoveEdgeMode?: () => void
  onClearVisited?: () => void
}

// Update the function parameters to include graph and setGraph
export default function GraphCanvas({
  graph,
  setGraph,
  isWeighted,
  isDirected,
  algorithm,
  currentStep,
  onTotalStepsChange,
  startVertex,
  endVertex,
  onSelectVertex,
  edgeWeight,
  customVisitedVertices = new Set(),
  sourceDestSelectionMode = false,
  visitedSelectionMode = false,
  removeVisitedMode = false,
  vertexMoveMode = false,
  addEdgeMode = false,
  removeVertexMode = false,
  removeEdgeMode = false,
  isPlaying = false,
  totalSteps=0,
  onPlay = () => {},
  onStepForward = () => {},
  onStepBack = () => {},
  onReset = () => {},
  onStepChange = () => {},
  onToggleSourceDestMode = () => {},
  onToggleVisitedMode = () => {},
  onToggleRemoveVisitedMode = () => {},
  onToggleVertexMoveMode = () => {},
  onToggleAddEdgeMode = () => {},
  onToggleRemoveVertexMode = () => {},
  onToggleRemoveEdgeMode = () => {},
  onClearVisited = () => {},
}: GraphCanvasProps) {
  // Remove the local state for addEdgeMode since it's now a prop
  const [edgeStartVertex, setEdgeStartVertex] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [algorithmSteps, setAlgorithmSteps] = useState<AlgorithmStep[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ id: string; x: number; y: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [isMovingEdge, setIsMovingEdge] = useState(false)
  const [edgeMovePoint, setEdgeMovePoint] = useState<{ x: number; y: number } | null>(null)
  
  // Add missing state variables
  const [movingVertex, setMovingVertex] = useState<string | null>(null)
  const [vertexMoveStart, setVertexMoveStart] = useState<{ x: number; y: number } | null>(null)
  const [editingEdge, setEditingEdge] = useState<string | null>(null)
  const [newEdgeWeight, setNewEdgeWeight] = useState<number>(1)
  const [showWeightDialog, setShowWeightDialog] = useState<boolean>(false)
  const [weightDialogPosition, setWeightDialogPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

 
  // Initialize the graph with some example vertices and edges
  useEffect(() => {
    if (graph.vertices.size === 0) {
      const newGraph = createGraph(isDirected, isWeighted)
      setGraph(newGraph)
    }
  }, [])

  // Update graph properties when they change
  useEffect(() => {
    setGraph((prev) => ({
      ...prev,
      isDirected,
      isWeighted,
    }))
  }, [isDirected, isWeighted])

  // Run algorithm when necessary
  useEffect(() => {
    if (!startVertex) return

    let steps: AlgorithmStep[] = []

    switch (algorithm) {
      case "bfs":
        steps = runBFS(graph, startVertex)
        break
      case "dfs":
        steps = runDFS(graph, startVertex)
        break
      case "dijkstra":
        steps = runDijkstra(graph, startVertex, endVertex || undefined)
        break
      case "prim":
        steps = runPrim(graph, startVertex)
        break
      case "kruskal":
        steps = runKruskal(graph)
        break
      case "topological":
        steps = runTopologicalSort(graph)
        break
    }

    setAlgorithmSteps(steps)
    onTotalStepsChange(steps.length)
  }, [graph, algorithm, startVertex, endVertex, onTotalStepsChange])

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size with higher resolution for better quality
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    
    // Scale all drawing operations
    ctx.scale(dpr, dpr)
    
    // Set canvas CSS size
    canvas.style.width = `${canvas.clientWidth}px`
    canvas.style.height = `${canvas.clientHeight}px`

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get current algorithm step
    const step = algorithmSteps[currentStep] || { vertices: new Map(), edges: new Map(), description: "" }

    // Draw edges with improved colors and line width
    for (const edge of graph.edges.values()) {
      const sourceVertex = graph.vertices.get(edge.source)
      const targetVertex = graph.vertices.get(edge.target)

      if (!sourceVertex || !targetVertex) continue

      // Determine edge status
      let status: EdgeStatus = "default"
      if (step.edges.has(edge.id)) {
        status = step.edges.get(edge.id)!
      }

      // Set edge style based on status with more vibrant colors
      switch (status) {
        case "active":
          ctx.strokeStyle = "#f97316" // orange
          ctx.lineWidth = 3
          break
        case "visited":
          ctx.strokeStyle = "#84cc16" // lime
          ctx.lineWidth = 2
          break
        case "path":
          ctx.strokeStyle = "#06b6d4" // cyan
          ctx.lineWidth = 3
          break
        case "discarded":
          ctx.strokeStyle = "#ef4444" // red
          ctx.lineWidth = 1
          break
        default:
          ctx.strokeStyle = "#4b5563" // darker gray for better visibility
          ctx.lineWidth = 1.5 // slightly thicker
      }

      // Highlight selected edge
      if (edge.id === selectedEdge) {
        ctx.strokeStyle = "#8b5cf6" // purple
        ctx.lineWidth = 4
      }

      // Check if there's a reverse edge
      const reverseEdgeId = `e${targetVertex.id}-${sourceVertex.id}`
      const hasBidirectionalEdge = graph.edges.has(reverseEdgeId)

      // Calculate the angle between vertices
      const dx = targetVertex.x - sourceVertex.x
      const dy = targetVertex.y - sourceVertex.y
      const angle = Math.atan2(dy, dx)
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Calculate vertex radius for arrow positioning
      const vertexRadius = 20

      // For bidirectional edges, add a curve
      if (isDirected && hasBidirectionalEdge) {
        // Determine which way to curve based on the edge ID
        // This ensures the two edges curve in opposite directions
        const curveDirection = edge.id === `e${sourceVertex.id}-${targetVertex.id}` ? 1 : -1;

        // Calculate control point perpendicular to the line
        const midX = (sourceVertex.x + targetVertex.x) / 2
        const midY = (sourceVertex.y + targetVertex.y) / 2
        const curveMagnitude = Math.min(30, distance * 0.3) // Scale curve based on distance

        const perpX = midX + curveDirection * Math.sin(angle) * curveMagnitude
        const perpY = midY - curveDirection * Math.cos(angle) * curveMagnitude

        // Draw the curved edge
        ctx.beginPath()
        ctx.moveTo(sourceVertex.x, sourceVertex.y)
        ctx.quadraticCurveTo(perpX, perpY, targetVertex.x, targetVertex.y)
        ctx.stroke()

        // Draw arrow for directed graph
        if (isDirected) {
          // Calculate the angle at the end of the curve
          const t = 0.9 // Position arrow slightly before the end point
          const arrowX = (1 - t) * (1 - t) * sourceVertex.x + 2 * (1 - t) * t * perpX + t * t * targetVertex.x
          const arrowY = (1 - t) * (1 - t) * sourceVertex.y + 2 * (1 - t) * t * perpY + t * t * targetVertex.y

          const endAngle = Math.atan2(targetVertex.y - arrowY, targetVertex.x - arrowX)
          const arrowSize = 10

          ctx.beginPath()
          ctx.moveTo(
            targetVertex.x - vertexRadius * Math.cos(endAngle) - arrowSize * Math.cos(endAngle - Math.PI / 6),
            targetVertex.y - vertexRadius * Math.sin(endAngle) - arrowSize * Math.sin(endAngle - Math.PI / 6),
          )
          ctx.lineTo(
            targetVertex.x - vertexRadius * Math.cos(endAngle),
            targetVertex.y - vertexRadius * Math.sin(endAngle),
          )
          ctx.lineTo(
            targetVertex.x - vertexRadius * Math.cos(endAngle) - arrowSize * Math.cos(endAngle + Math.PI / 6),
            targetVertex.y - vertexRadius * Math.sin(endAngle) - arrowSize * Math.sin(endAngle + Math.PI / 6),
          )
          ctx.fillStyle = ctx.strokeStyle
          ctx.fill()
        }

        // Draw weight for weighted graphs
        if (isWeighted) {
          // Position weight along the curve
          const weightX = (sourceVertex.x + 2 * perpX + targetVertex.x) / 4
          const weightY = (sourceVertex.y + 2 * perpY + targetVertex.y) / 4

          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(weightX, weightY, 12, 0, 2 * Math.PI)
          ctx.fill()

          ctx.fillStyle = "#000000"
          ctx.font = "12px sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(edge.weight.toString(), weightX, weightY)
        }
      } else {
        // Draw a straight line for normal edges
        ctx.beginPath()
        ctx.moveTo(sourceVertex.x, sourceVertex.y)
        ctx.lineTo(targetVertex.x, targetVertex.y)
        ctx.stroke()

        // Draw arrow for directed graphs
        if (isDirected) {
          const arrowSize = 10

          // Position the arrow just before the target vertex
          const arrowX = targetVertex.x - vertexRadius * Math.cos(angle)
          const arrowY = targetVertex.y - vertexRadius * Math.sin(angle)

          ctx.beginPath()
          ctx.moveTo(
            arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
            arrowY - arrowSize * Math.sin(angle - Math.PI / 6),
          )
          ctx.lineTo(arrowX, arrowY)
          ctx.lineTo(
            arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
            arrowY - arrowSize * Math.sin(angle + Math.PI / 6),
          )
          ctx.fillStyle = ctx.strokeStyle
          ctx.fill()
        }

        // Draw weight for weighted graphs
        if (isWeighted) {
          const midX = (sourceVertex.x + targetVertex.x) / 2
          const midY = (sourceVertex.y + targetVertex.y) / 2

          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(midX, midY, 12, 0, 2 * Math.PI)
          ctx.fill()

          ctx.fillStyle = "#000000"
          ctx.font = "12px sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(edge.weight.toString(), midX, midY)
        }
      }
    }

    // Draw vertices with improved colors
    for (const vertex of graph.vertices.values()) {
      // Determine vertex status
      let status: NodeStatus = "default"

      // Check if this vertex is in the custom visited set
      if (customVisitedVertices.has(vertex.id)) {
        status = "visited"
      }

      // Source and destination have priority over custom visited
      if (vertex.id === startVertex) {
        status = "start"
      } else if (vertex.id === endVertex) {
        status = "end"
      } else if (step.vertices.has(vertex.id)) {
        status = step.vertices.get(vertex.id)!
      }

      // Set vertex style based on status with more vibrant colors
      let fillColor = "#f9fafb" // gray-50 (lighter)
      let strokeColor = "#9ca3af" // gray-400 (darker)
      let textColor = "#111827" // gray-900 (darker)

      switch (status) {
        case "active":
          fillColor = "#3b82f6" // blue
          strokeColor = "#1d4ed8" // blue-700
          textColor = "#ffffff" // white
          break
        case "visited":
          fillColor = "#84cc16" // lime
          strokeColor = "#4d7c0f" // lime-700
          textColor = "#ffffff" // white
          break
        case "path":
          fillColor = "#06b6d4" // cyan
          strokeColor = "#0e7490" // cyan-700
          textColor = "#ffffff" // white
          break
        case "start":
          fillColor = "#f97316" // orange
          strokeColor = "#c2410c" // orange-700
          textColor = "#ffffff" // white
          break
        case "end":
          fillColor = "#ef4444" // red
          strokeColor = "#b91c1c" // red-700
          textColor = "#ffffff" // white
          break
      }

      // Draw vertex with shadow for better depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 5
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      // Draw vertex circle
      ctx.beginPath()
      ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI)
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = strokeColor
      ctx.stroke()
      
      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw vertex label
      ctx.fillStyle = textColor
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(vertex.label, vertex.x, vertex.y)
    }

    // Add visual indicator for edge creation mode
    if (addEdgeMode && edgeStartVertex) {
      const startVertex = graph.vertices.get(edgeStartVertex)
      if (startVertex) {
        // Draw a pulsing highlight around the selected vertex
        ctx.beginPath()
        ctx.arc(startVertex.x, startVertex.y, 20, 0, Math.PI * 2)
        ctx.strokeStyle = "#3b82f6" // blue
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw text indicating to select second vertex
        ctx.font = "12px Arial"
        ctx.fillStyle = "#3b82f6"
        ctx.fillText("Select target vertex", startVertex.x + 25, startVertex.y)
      }
    }

    // Draw drag line if dragging
    if (isDragging && dragStart && dragEnd) {
      const startVertex = graph.vertices.get(dragStart.id)
      if (startVertex) {
        ctx.beginPath()
        ctx.moveTo(startVertex.x, startVertex.y)
        ctx.lineTo(dragEnd.x, dragEnd.y)
        ctx.strokeStyle = "#6b7280" // gray
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Draw algorithm description with better styling
    if (step.description) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
      ctx.shadowBlur = 5
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.fillRect(10, 10, canvas.width / dpr - 20, 40)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      
      ctx.fillStyle = "#111827"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(step.description, 20, 25)
    }

    // Always draw queue/stack visualization when algorithm is BFS or DFS
    if (algorithm === "bfs" || algorithm === "dfs") {
      // Get data structure from current step or use empty array if not available
      const dataStructure = algorithm === "bfs" 
        ? (step.queue || []) 
        : (step.stack || []);
      const title = algorithm === "bfs" ? "Queue" : "Stack";
      
      // Draw container with better styling
      const boxHeight = 80;
      const boxY = canvas.height / dpr - boxHeight - 10;
      
      // Add shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
      ctx.shadowBlur = 5
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fillRect(10, boxY, canvas.width / dpr - 20, boxHeight);
      
      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.strokeRect(10, boxY, canvas.width / dpr - 20, boxHeight);
      
      // Draw title
      ctx.fillStyle = "#111827";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`${title}: `, 20, boxY + 15);
      
      // Draw elements
      if (dataStructure.length > 0) {
        const elements = dataStructure.map(id => {
          const vertex = graph.vertices.get(id);
          return vertex ? vertex.label : id;
        });
        
        ctx.font = "14px sans-serif";
        ctx.fillText(elements.join(" → "), 90, boxY + 15);
        
        // Draw visual representation
        const cellWidth = 35;
        const startX = 20;
        const cellY = boxY + 40;
        
        elements.forEach((label, index) => {
          // Add shadow for cells
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
          ctx.shadowBlur = 3
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1
          
          // Color cells based on algorithm
          const cellColor = algorithm === "bfs" ? "#eff6ff" : "#f0f9ff"; // blue-50 or cyan-50
          ctx.fillStyle = cellColor;
          ctx.fillRect(startX + index * cellWidth, cellY, cellWidth - 4, cellWidth - 10);
          
          // Reset shadow
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          
          // Border color based on algorithm
          const borderColor = algorithm === "bfs" ? "#3b82f6" : "#0ea5e9"; // blue-500 or cyan-500
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(startX + index * cellWidth, cellY, cellWidth - 4, cellWidth - 10);
          
          ctx.fillStyle = "#1f2937";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, startX + index * cellWidth + (cellWidth - 4) / 2, cellY + (cellWidth - 10) / 2);
        });
        
        // Draw pointer for queue/stack operations
        if (algorithm === "bfs") {
          // Queue: front and rear pointers
          ctx.fillStyle = "#3b82f6";
          ctx.font = "bold 12px sans-serif";
          ctx.fillText("front", startX, cellY - 15);
          ctx.fillText("rear", startX + (elements.length - 1) * cellWidth, cellY - 15);
        } else {
          // Stack: top pointer
          ctx.fillStyle = "#0ea5e9";
          ctx.font = "bold 12px sans-serif";
          ctx.fillText("top", startX + (elements.length - 1) * cellWidth, cellY - 15);
        }
      } else {
        ctx.font = "italic 14px sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.fillText("Empty", 90, boxY + 15);
      }
    }

    // Add visual indicators for removal modes
    if (removeVertexMode) {
      ctx.font = "14px Arial"
      ctx.fillStyle = "#ef4444" // red
      ctx.fillText("Click on a vertex to remove it", 10, 20)
    }

    if (removeEdgeMode) {
      ctx.font = "14px Arial"
      ctx.fillStyle = "#ef4444" // red
      ctx.fillText("Click on an edge to remove it", 10, 40)
    }
  }, [
    graph,
    currentStep,
    algorithmSteps,
    isDragging,
    dragStart,
    dragEnd,
    isDirected,
    isWeighted,
    startVertex,
    endVertex,
    customVisitedVertices,
    selectedEdge,
    isMovingEdge,
    edgeMovePoint,
    algorithm,
    addEdgeMode,
    edgeStartVertex,
    removeVertexMode,
    removeEdgeMode,
  ])

  // Add this useEffect to reset edge start vertex when mode changes
  useEffect(() => {
    if (!addEdgeMode) {
      setEdgeStartVertex(null)
    }
  }, [addEdgeMode])

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Prevent context menu on right click
    if (e.button === 2) {
      e.preventDefault()
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find the nearest vertex
    const vertex = findNearestVertex(graph, x, y)

    if (vertex) {
      if (removeVertexMode || e.button === 2) {
        // Remove vertex mode or right click - remove vertex
        const newGraph = { ...graph }
        removeVertex(newGraph, vertex.id)
        setGraph(newGraph)
        return
      } else {
        // Left click - select vertex or start dragging
        if (sourceDestSelectionMode || visitedSelectionMode || removeVisitedMode) {
          onSelectVertex(vertex.id)
        } else if (vertexMoveMode) {
          // Start moving the vertex
          setMovingVertex(vertex.id)
          setVertexMoveStart({ x, y })
        } else if (addEdgeMode) {
          // Handle add edge mode
          if (edgeStartVertex === null) {
            // First vertex selection
            setEdgeStartVertex(vertex.id);
            console.log("Selected first vertex for edge:", vertex.id);
          } else {
            // Second vertex selection - create the edge
            if (edgeStartVertex !== vertex.id) {
              console.log("Creating edge from", edgeStartVertex, "to", vertex.id);
              const edgeId = createEdgeBetweenVertices(edgeStartVertex, vertex.id);
              console.log("Edge created:", edgeId);
            } else {
              console.log("Cannot create self-loop");
            }
            // Reset for next edge creation
            setEdgeStartVertex(null);
          }
        } else {
          // Start dragging to create edge
          setIsDragging(true)
          setDragStart({ id: vertex.id, x: vertex.x, y: vertex.y })
          setDragEnd({ x, y })
        }
      }
    } else {
      // Check if clicked on an edge
      const edge = findEdgeNearPoint(graph, x, y, 10)

      if (edge) {
        if (removeEdgeMode || e.button === 2) {
          // Remove edge mode or right click - remove edge
          const newGraph = { ...graph }
          removeEdge(newGraph, edge.id)
          setGraph(newGraph)
          e.preventDefault() // Prevent context menu
          return
        }

        // Check if clicked on edge weight (for weighted graphs)
        if (isWeighted) {
          const edgeObj = graph.edges.get(edge.id)
          if (edgeObj) {
            const sourceVertex = graph.vertices.get(edgeObj.source)
            const targetVertex = graph.vertices.get(edgeObj.target)

            if (sourceVertex && targetVertex) {
              const midX = (sourceVertex.x + targetVertex.x) / 2
              const midY = (sourceVertex.y + targetVertex.y) / 2

              // Check if click is near the weight label
              if (Math.sqrt(Math.pow(x - midX, 2) + Math.pow(y - midY, 2)) <= 15) {
                // Open weight edit dialog
                setEditingEdge(edge.id)
                setNewEdgeWeight(edgeObj.weight)
                setShowWeightDialog(true)
                setWeightDialogPosition({ x: midX, y: midY })
                return
              }
            }
          }
        }

        // Start long press timer for edge selection
        if (longPressTimer) clearTimeout(longPressTimer)

        const timer = setTimeout(() => {
          setSelectedEdge(edge.id)
          setIsMovingEdge(true)
          setEdgeMovePoint({ x, y })
        }, 2000) // 2 seconds long press

        setLongPressTimer(timer)
      } else if (!vertexMoveMode && !removeVertexMode && !removeEdgeMode) {
        // Clicked on empty space - create new vertex
        const newGraph = { ...graph }
        const newVertexId = addVertex(newGraph, x, y)
        setGraph(newGraph)
      }
    }
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (movingVertex && vertexMoveStart) {
      // Move the vertex
      const vertex = graph.vertices.get(movingVertex)
      if (vertex) {
        const newGraph = { ...graph }
        const newVertex = { ...vertex, x, y }
        newGraph.vertices.set(movingVertex, newVertex)
        setGraph(newGraph)
      }
    } else if (isDragging && dragStart) {
      setDragEnd({ x, y })
    } else if (isMovingEdge && selectedEdge && edgeMovePoint) {
      // Move the selected edge
      const edge = graph.edges.get(selectedEdge)
      if (edge) {
        const sourceVertex = graph.vertices.get(edge.source)
        const targetVertex = graph.vertices.get(edge.target)

        if (sourceVertex && targetVertex) {
          // Calculate new positions based on the drag
          const dx = x - edgeMovePoint.x
          const dy = y - edgeMovePoint.y

          const newGraph = { ...graph }
          const newSourceVertex = { ...sourceVertex, x: sourceVertex.x + dx, y: sourceVertex.y + dy }
          const newTargetVertex = { ...targetVertex, x: targetVertex.x + dx, y: targetVertex.y + dy }

          newGraph.vertices.set(edge.source, newSourceVertex)
          newGraph.vertices.set(edge.target, newTargetVertex)

          setGraph(newGraph)
          setEdgeMovePoint({ x, y })
        }
      }
    } else {
      // Cancel long press if mouse moves too much
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        setLongPressTimer(null)
      }
    }
  }

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }

    if (isMovingEdge) {
      setIsMovingEdge(false)
      setSelectedEdge(null)
      setEdgeMovePoint(null)
      return
    }
    
    // Reset vertex movement state
    if (movingVertex) {
      setMovingVertex(null)
      setVertexMoveStart(null)
      return
    }

    if (!isDragging || !dragStart) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if released on a vertex
    const endVertex = findNearestVertex(graph, x, y)

    if (endVertex && endVertex.id !== dragStart.id) {
      createEdgeBetweenVertices(dragStart.id, endVertex.id);
    }

    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  // Add a function to update edge weight
  const updateEdgeWeight = () => {
    if (editingEdge && newEdgeWeight > 0) {
      const newGraph = { ...graph }
      const edge = newGraph.edges.get(editingEdge)

      if (edge) {
        const updatedEdge = { ...edge, weight: newEdgeWeight }
        newGraph.edges.set(editingEdge, updatedEdge)

        // Update reverse edge for undirected graphs
        if (!isDirected) {
          const reverseId = `e${edge.target}-${edge.source}`
          const reverseEdge = newGraph.edges.get(reverseId)
          if (reverseEdge) {
            const updatedReverseEdge = { ...reverseEdge, weight: newEdgeWeight }
            newGraph.edges.set(reverseId, updatedReverseEdge)
          }
        }

        setGraph(newGraph)
      }

      setShowWeightDialog(false)
      setEditingEdge(null)
    }
  }

  // Improved edge creation function with proper Map handling
  const createEdgeBetweenVertices = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return null;
    
    // Check if vertices exist
    if (!graph.vertices.has(sourceId) || !graph.vertices.has(targetId)) {
      console.error("Cannot create edge: vertex not found", { sourceId, targetId });
      return null;
    }
    
    // Create a proper copy of the graph
    const newGraph = {
      vertices: new Map(graph.vertices),
      edges: new Map(graph.edges),
      isDirected: graph.isDirected,
      isWeighted: graph.isWeighted
    };
    
    // Add the edge with the current edge weight
    const weight = isWeighted ? edgeWeight : 1;
    const edgeId = `e${sourceId}-${targetId}`;
    
    // Create the edge object
    const edge = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      weight: weight,
      status: "default" as EdgeStatus
    };
    
    // Add the edge to the graph
    newGraph.edges.set(edgeId, edge);
    
    // For undirected graphs, add the reverse edge
    if (!isDirected && sourceId !== targetId) {
      const reverseId = `e${targetId}-${sourceId}`;
      const reverseEdge = {
        id: reverseId,
        source: targetId,
        target: sourceId,
        weight: weight,
        status: "default" as EdgeStatus
      };
      newGraph.edges.set(reverseId, reverseEdge);
    }
    
    // Update the graph state
    setGraph(newGraph);
    return edgeId;
  };

  // Find an edge near a point
  function findEdgeNearPoint(graph: Graph, x: number, y: number, threshold: number): { id: string } | null {
    for (const [edgeId, edge] of graph.edges.entries()) {
      const sourceVertex = graph.vertices.get(edge.source)
      const targetVertex = graph.vertices.get(edge.target)

      if (!sourceVertex || !targetVertex) continue

      // Calculate distance from point to line segment
      const distance = distanceToLineSegment(sourceVertex.x, sourceVertex.y, targetVertex.x, targetVertex.y, x, y)

      if (distance <= threshold) {
        return { id: edgeId }
      }
    }

    return null
  }

  // Calculate distance from point to line segment
  function distanceToLineSegment(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = px - xx
    const dy = py - yy

    return Math.sqrt(dx * dx + dy * dy)
  }

  // Prevent context menu
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
  }

  // Add a weight edit dialog to the component return
  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      />

      {renderControlBar( 
        isPlaying,
        currentStep,
        totalSteps,
        sourceDestSelectionMode,
        visitedSelectionMode,
        removeVisitedMode,
        vertexMoveMode,
        addEdgeMode,
        removeVertexMode,
        removeEdgeMode,
        onPlay,
        onStepForward,
        onStepBack,
        onReset,
        onStepChange,
        onToggleSourceDestMode,
        onToggleVisitedMode,
        onToggleRemoveVisitedMode,
        onToggleVertexMoveMode,
        onToggleAddEdgeMode,
        onToggleRemoveVertexMode,
        onToggleRemoveEdgeMode,
        onClearVisited
      )}
      {showWeightDialog && (
        <div
          className="absolute bg-white p-2 rounded shadow-md z-10"
          style={{
            left: `${weightDialogPosition.x}px`,
            top: `${weightDialogPosition.y + 20}px`,
            transform: "translate(-50%, 0)",
          }}
        >
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              value={newEdgeWeight}
              onChange={(e) => setNewEdgeWeight(Number(e.target.value))}
              className="w-16 p-1 border rounded"
              autoFocus
            />
            <button onClick={updateEdgeWeight} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
              Save
            </button>
            <button onClick={() => setShowWeightDialog(false)} className="bg-gray-300 px-2 py-1 rounded text-xs">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Fix the renderControlBar function to use props directly
const renderControlBar = (
  isPlaying = false,
  currentStep = 0,
  totalSteps = 0,
  sourceDestSelectionMode = false,
  visitedSelectionMode = false,
  removeVisitedMode = false,
  vertexMoveMode = false,
  addEdgeMode = false,
  removeVertexMode = false,
  removeEdgeMode = false,
  onPlay = () => {},
  onStepForward = () => {},
  onStepBack = () => {},
  onReset = () => {},
  onStepChange = (step:number) => {},
  onToggleSourceDestMode = () => {},
  onToggleVisitedMode = () => {},
  onToggleRemoveVisitedMode = () => {},
  onToggleVertexMoveMode = () => {},
  onToggleAddEdgeMode = () => {},
  onToggleRemoveVertexMode = () => {},
  onToggleRemoveEdgeMode = () => {},
  onClearVisited = () => {}
) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md">
      {/* Playback controls */}
      <Button variant="outline" size="icon" onClick={onStepBack} disabled={currentStep <= 0}>
        <SkipBack className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onPlay}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onStepForward}
        disabled={currentStep >= totalSteps - 1}
      >
        <SkipForward className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onReset}>
        <RefreshCw className="h-4 w-4" />
      </Button>
      
      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1"></div>
      
      {/* Vertex selection modes */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleSourceDestMode}
        className={sourceDestSelectionMode ? "bg-orange-500 text-white" : ""}
        title="Mark Source/Destination"
      >
        <Target className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleVisitedMode}
        className={visitedSelectionMode ? "bg-green-500 text-white" : ""}
        title="Mark Visited"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleRemoveVisitedMode}
        className={removeVisitedMode ? "bg-red-500 text-white" : ""}
        title="Unmark Visited"
      >
        <XCircle className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleVertexMoveMode}
        className={vertexMoveMode ? "bg-purple-500 text-white" : ""}
        title="Move Vertices"
      >
        <Move className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleAddEdgeMode}
        className={addEdgeMode ? "bg-blue-500 text-white" : ""}
        title="Add Edge"
      >
        <Link className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleRemoveVertexMode}
        className={removeVertexMode ? "bg-red-500 text-white" : ""}
        title="Remove Vertex"
      >
        <Trash className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleRemoveEdgeMode}
        className={removeEdgeMode ? "bg-red-500 text-white" : ""}
        title="Remove Edge"
      >
        <Scissors className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onClearVisited}
        title="Clear Visited"
      >
        <Eraser className="h-4 w-4" />
      </Button>
      
      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1"></div>
      
      {/* Slider for step control */}
      <div className="w-32 px-2">
        <Slider
          value={[currentStep]}
          max={Math.max(0, totalSteps - 1)}
          step={1}
          onValueChange={(value) => onStepChange(value[0])}
        />
      </div>
    </div>
  );
};
 






