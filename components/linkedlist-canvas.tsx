import React, { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
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
  Eraser,
  Plus
} from "lucide-react"
import type { LinkedList, ListNode } from "@/lib/linkedlist-utils"
import type { ListAlgorithmStep } from "@/lib/linkedlist-algorithms"

interface LinkedListCanvasProps {
  list: LinkedList
  setList: React.Dispatch<React.SetStateAction<LinkedList>>
  algorithm: string
  algorithmSteps: ListAlgorithmStep[]
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  onPlay: () => void
  onStepForward: () => void
  onStepBack: () => void
  onStepChange: (step: number) => void
  onReset: () => void
  onAddNode: (value: number) => void
  onRemoveNode: (id: string) => void
  onTotalStepsChange: (steps: number) => void
}

export default function LinkedListCanvas({
  list,
  setList,
  algorithm,
  algorithmSteps,
  currentStep,
  totalSteps,
  isPlaying,
  onPlay,
  onStepForward,
  onStepBack,
  onStepChange,
  onReset,
  onAddNode,
  onRemoveNode,
  onTotalStepsChange
}: LinkedListCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [nodeValue, setNodeValue] = useState<number>(0)
  const [showNodeDialog, setShowNodeDialog] = useState<boolean>(false)
  const [dialogPosition, setDialogPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  
  // Mode states
  const [addNodeMode, setAddNodeMode] = useState<boolean>(true)
  const [addEdgeMode, setAddEdgeMode] = useState<boolean>(false)
  const [removeNodeMode, setRemoveNodeMode] = useState<boolean>(false)
  const [removeEdgeMode, setRemoveEdgeMode] = useState<boolean>(false)
  const [moveNodeMode, setMoveNodeMode] = useState<boolean>(false)
  
  // Edge creation state
  const [edgeStartNode, setEdgeStartNode] = useState<string | null>(null)
  
  // Node dragging state
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{x: number, y: number}>({x: 0, y: 0})

  // Draw the linked list on the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get current algorithm step
    const step = currentStep < algorithmSteps.length ? algorithmSteps[currentStep] : null

    // Draw edges first (so they appear behind nodes)
    for (const [id, node] of list.nodes.entries()) {
      if (node.next) {
        const nextNode = list.nodes.get(node.next)
        if (nextNode) {
          // Determine edge status from algorithm step
          let edgeColor = '#888'
          let edgeWidth = 2
          
          if (step && step.currentPointer === id) {
            edgeColor = '#3b82f6' // blue for current pointer
            edgeWidth = 3
          }
          
          // Draw edge
          ctx.beginPath()
          ctx.moveTo(node.x + 50, node.y + 25) // Center of the node
          ctx.lineTo(nextNode.x, nextNode.y + 25) // Left side of next node
          
          ctx.strokeStyle = edgeColor
          ctx.lineWidth = edgeWidth
          
          // Draw arrow for directed edges
          ctx.stroke()
          
          // Draw arrowhead
          const angle = Math.atan2(nextNode.y + 25 - (node.y + 25), nextNode.x - (node.x + 50))
          ctx.beginPath()
          ctx.moveTo(nextNode.x, nextNode.y + 25)
          ctx.lineTo(
            nextNode.x - 10 * Math.cos(angle - Math.PI / 6),
            nextNode.y + 25 - 10 * Math.sin(angle - Math.PI / 6)
          )
          ctx.lineTo(
            nextNode.x - 10 * Math.cos(angle + Math.PI / 6),
            nextNode.y + 25 - 10 * Math.sin(angle + Math.PI / 6)
          )
          ctx.closePath()
          ctx.fillStyle = edgeColor
          ctx.fill()
        }
      }
    }

    // Draw nodes
    for (const [id, node] of list.nodes.entries()) {
      // Determine node status from algorithm step
      let nodeStatus = 'default'
      if (step && step.nodes.has(id)) {
        nodeStatus = step.nodes.get(id)!
      }
      
      // Set node style based on status
      let fillColor = '#f3f4f6' // default gray
      let strokeColor = '#888'
      let textColor = '#000'
      
      if (selectedNode === id) {
        fillColor = '#e0e7ff' // selected purple
      }
      
      if (nodeStatus === 'active') {
        fillColor = '#3b82f6' // blue
        textColor = '#fff'
      } else if (nodeStatus === 'visited') {
        fillColor = '#10b981' // green
        textColor = '#fff'
      } else if (nodeStatus === 'path') {
        fillColor = '#f59e0b' // amber
        textColor = '#fff'
      } else if (nodeStatus === 'start') {
        fillColor = '#8b5cf6' // purple
        textColor = '#fff'
      } else if (nodeStatus === 'end') {
        fillColor = '#ef4444' // red
        textColor = '#fff'
      }
      
      // Draw node rectangle
      ctx.beginPath()
      ctx.roundRect(node.x, node.y, 100, 50, 8)
      ctx.fillStyle = fillColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 2
      ctx.fill()
      ctx.stroke()
      
      // Draw node value
      ctx.fillStyle = textColor
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.value.toString(), node.x + 50, node.y + 25)
      
      // Draw node ID (small text below)
      ctx.font = '10px Arial'
      ctx.fillText(id, node.x + 50, node.y + 40)
    }
    
    // Draw edge start indicator
    if (edgeStartNode) {
      const startNode = list.nodes.get(edgeStartNode)
      if (startNode) {
        ctx.beginPath()
        ctx.arc(startNode.x + 50, startNode.y + 25, 8, 0, Math.PI * 2)
        ctx.fillStyle = '#3b82f6'
        ctx.fill()
      }
    }
    
    // Draw mode indicators
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    if (addNodeMode) {
      ctx.fillStyle = '#10b981'
      ctx.fillText('Click on canvas to add a node', 10, 10)
    }
    
    if (addEdgeMode) {
      ctx.fillStyle = '#3b82f6'
      ctx.fillText('Select two nodes to connect', 10, 30)
    }
    
    if (removeNodeMode) {
      ctx.fillStyle = '#ef4444'
      ctx.fillText('Click on a node to remove it', 10, 50)
    }
    
    if (removeEdgeMode) {
      ctx.fillStyle = '#ef4444'
      ctx.fillText('Click on a node to remove its outgoing edge', 10, 70)
    }
    
    if (moveNodeMode) {
      ctx.fillStyle = '#8b5cf6'
      ctx.fillText('Drag nodes to move them', 10, 90)
    }
    
    // Draw algorithm description if available
    if (step && step.description) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fillRect(10, canvas.height - 40, canvas.width - 20, 30)
      ctx.fillStyle = '#000'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(step.description, 20, canvas.height - 25)
    }
    
    // Draw traversal values if available
    if (step && step.values && step.values.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fillRect(10, canvas.height - 80, canvas.width - 20, 30)
      ctx.fillStyle = '#000'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`Values: [${step.values.join(", ")}]`, 20, canvas.height - 65)
    }
    
  }, [list, selectedNode, edgeStartNode, addNodeMode, addEdgeMode, removeNodeMode, removeEdgeMode, moveNodeMode, currentStep, algorithmSteps])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle mouse down on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on a node
    let clickedNode: string | null = null
    for (const [id, node] of list.nodes.entries()) {
      if (
        x >= node.x &&
        x <= node.x + 100 &&
        y >= node.y &&
        y <= node.y + 50
      ) {
        clickedNode = id
        break
      }
    }

    if (clickedNode) {
      // Clicked on a node
      if (addEdgeMode) {
        // Handle add edge mode
        if (edgeStartNode === null) {
          // First node selection
          setEdgeStartNode(clickedNode)
        } else if (edgeStartNode !== clickedNode) {
          // Second node selection - create the edge
          const newList = {...list}
          const sourceNode = {...newList.nodes.get(edgeStartNode)!}
          
          // Set the next pointer
          sourceNode.next = clickedNode
          newList.nodes.set(edgeStartNode, sourceNode)
          
          // If doubly linked, update previous pointer
          if (newList.type === "doubly") {
            const targetNode = {...newList.nodes.get(clickedNode)!}
            targetNode.prev = edgeStartNode
            newList.nodes.set(clickedNode, targetNode)
          }
          
          setList(newList)
          setEdgeStartNode(null)
        }
      } else if (removeNodeMode) {
        // Remove the node
        onRemoveNode(clickedNode)
        setSelectedNode(null)
      } else if (removeEdgeMode) {
        // Remove outgoing edge from this node
        const newList = {...list}
        const node = newList.nodes.get(clickedNode)
        
        if (node && node.next) {
          const nextNode = newList.nodes.get(node.next)
          
          // Remove the next pointer
          node.next = null
          newList.nodes.set(clickedNode, node)
          
          // If doubly linked, update previous pointer of the target
          if (newList.type === "doubly" && nextNode) {
            nextNode.prev = null
            newList.nodes.set(nextNode.id, nextNode)
          }
          
          setList(newList)
        }
      } else if (moveNodeMode) {
        // Start moving the node
        setDraggedNode(clickedNode)
        const node = list.nodes.get(clickedNode)
        if (node) {
          setDragOffset({
            x: x - node.x,
            y: y - node.y
          })
        }
      } else {
        // Select node and show edit dialog
        setSelectedNode(clickedNode)
        const node = list.nodes.get(clickedNode)
        if (node) {
          setNodeValue(node.value)
          setEditingNode(clickedNode)
          setShowNodeDialog(true)
          setDialogPosition({ x, y })
        }
      }
    } else if (addNodeMode) {
      // Clicked on empty space - create new node
      setNodeValue(0)
      setShowNodeDialog(true)
      setDialogPosition({ x, y })
      setEditingNode(null)
    }
  }

  // Handle mouse move for dragging nodes
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedNode || !moveNodeMode) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Update node position
    const newList = {...list}
    const node = {...newList.nodes.get(draggedNode)!}
    
    node.x = Math.max(0, Math.min(canvas.width - 100, x - dragOffset.x))
    node.y = Math.max(0, Math.min(canvas.height - 50, y - dragOffset.y))
    
    newList.nodes.set(draggedNode, node)
    setList(newList)
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setDraggedNode(null)
  }

  // Handle adding or updating a node
  const handleSaveNode = () => {
    if (editingNode) {
      // Update existing node
      const newList = {...list}
      const node = {...newList.nodes.get(editingNode)!}
      node.value = nodeValue
      newList.nodes.set(editingNode, node)
      setList(newList)
    } else {
      // Add new node at the dialog position
      const newList = {...list}
      
      // Generate sequential node ID
      const nodeCount = newList.nodes.size
      const id = `node${nodeCount + 1}`
      
      newList.nodes.set(id, {
        id,
        value: nodeValue,
        x: dialogPosition.x - 50, // Center the node on the click position
        y: dialogPosition.y - 25,
        next: null,
        prev: null,
        width: 100,
        height: 50
      })
      
      setList(newList)
    }
    
    setShowNodeDialog(false)
    setEditingNode(null)
  }

  // Toggle mode functions
  const toggleAddNodeMode = () => {
    setAddNodeMode(true)
    setAddEdgeMode(false)
    setRemoveNodeMode(false)
    setRemoveEdgeMode(false)
    setMoveNodeMode(false)
    setEdgeStartNode(null)
  }
  
  const toggleAddEdgeMode = () => {
    setAddNodeMode(false)
    setAddEdgeMode(true)
    setRemoveNodeMode(false)
    setRemoveEdgeMode(false)
    setMoveNodeMode(false)
    setEdgeStartNode(null)
  }
  
  const toggleRemoveNodeMode = () => {
    setAddNodeMode(false)
    setAddEdgeMode(false)
    setRemoveNodeMode(true)
    setRemoveEdgeMode(false)
    setMoveNodeMode(false)
    setEdgeStartNode(null)
  }
  
  const toggleRemoveEdgeMode = () => {
    setAddNodeMode(false)
    setAddEdgeMode(false)
    setRemoveNodeMode(false)
    setRemoveEdgeMode(true)
    setMoveNodeMode(false)
    setEdgeStartNode(null)
  }
  
  const toggleMoveNodeMode = () => {
    setAddNodeMode(false)
    setAddEdgeMode(false)
    setRemoveNodeMode(false)
    setRemoveEdgeMode(false)
    setMoveNodeMode(true)
    setEdgeStartNode(null)
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      
      {/* Mode control buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleAddNodeMode}
          className={addNodeMode ? "bg-green-500 text-white" : ""}
          title="Add Node"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleAddEdgeMode}
          className={addEdgeMode ? "bg-blue-500 text-white" : ""}
          title="Add Edge"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleRemoveNodeMode}
          className={removeNodeMode ? "bg-red-500 text-white" : ""}
          title="Remove Node"
        >
          <Trash className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleRemoveEdgeMode}
          className={removeEdgeMode ? "bg-red-500 text-white" : ""}
          title="Remove Edge"
        >
          <Scissors className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleMoveNodeMode}
          className={moveNodeMode ? "bg-purple-500 text-white" : ""}
          title="Move Nodes"
        >
          <Move className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Playback controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow">
        <Button variant="outline" size="icon" onClick={onStepBack} disabled={currentStep <= 0}>
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="icon" onClick={onPlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <Button variant="outline" size="icon" onClick={onStepForward} disabled={currentStep >= totalSteps - 1}>
          <SkipForward className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="icon" onClick={onReset}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1"></div>
        
        <div className="w-48">
          <Slider
            value={[currentStep]}
            max={Math.max(0, totalSteps - 1)}
            step={1}
            onValueChange={(value) => onStepChange(value[0])}
          />
        </div>
      </div>
      
      {/* Node dialog */}
      {showNodeDialog && (
        <div
          className="absolute bg-white p-4 rounded shadow-md z-10"
          style={{
            left: `${dialogPosition.x}px`,
            top: `${dialogPosition.y + 20}px`,
            transform: "translate(-50%, 0)",
          }}
        >
          <h3 className="text-sm font-medium mb-2">{editingNode ? 'Edit Node' : 'Add Node'}</h3>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={nodeValue}
              onChange={(e) => setNodeValue(parseInt(e.target.value) || 0)}
              className="w-24"
              autoFocus
            />
            <Button size="sm" onClick={handleSaveNode}>Save</Button>
            <Button variant="outline" size="sm" onClick={() => setShowNodeDialog(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}







