"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import {
  type TreeNode,
  createSampleBST,
  calculateTreePositions,
  insertNode,
  deleteNode,
  createTreeNode,
  buildTreeFromLevelOrder,
} from "@/lib/tree-utils"
import {
  runInOrderTraversal,
  runPreOrderTraversal,
  runPostOrderTraversal,
  runLevelOrderTraversal,
  type TreeAlgorithmStep,
} from "@/lib/tree-algorithms"
import type { TreeAlgorithm } from "@/lib/algorithm-types"

// Import the tree types
import {
  createSampleAVL,
  createSampleRB,
  insertAVL,
  insertRB,
  buildAVLFromLevelOrder,
  buildRBFromLevelOrder,
} from "@/lib/tree-types"

// Update the TreeCanvasProps interface to include custom tree support
interface TreeCanvasProps {
  algorithm: TreeAlgorithm
  currentStep: number
  onTotalStepsChange: (steps: number) => void
  treeType?: string
  useCustomTree?: boolean
  customTreeInput?: string
}

// Update the function parameters to include customTreeInput
export default function TreeCanvas({
  algorithm,
  currentStep,
  onTotalStepsChange,
  treeType = "bst",
  useCustomTree = false,
  customTreeInput = "",
}: TreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Update the root state initialization to use the correct tree type
  const [root, setRoot] = useState<TreeNode | null>(() => {
    switch (treeType) {
      case "avl":
        return createSampleAVL()
      case "redblack":
        return createSampleRB()
      case "general":
        // For general binary tree, start with a simple root
        return createTreeNode(50, "n0")
      case "bst":
      default:
        return createSampleBST()
    }
  })
  const [algorithmSteps, setAlgorithmSteps] = useState<TreeAlgorithmStep[]>([])

  // Run algorithm when necessary
  useEffect(() => {
    if (!root) return

    let steps: TreeAlgorithmStep[] = []

    switch (algorithm) {
      case "inorder":
        steps = runInOrderTraversal(root)
        break
      case "preorder":
        steps = runPreOrderTraversal(root)
        break
      case "postorder":
        steps = runPostOrderTraversal(root)
        break
      case "levelorder":
        steps = runLevelOrderTraversal(root)
        break
    }

    setAlgorithmSteps(steps)
    onTotalStepsChange(steps.length)
  }, [root, algorithm, onTotalStepsChange])

  // Draw the tree
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !root) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Calculate positions
    calculateTreePositions(root, canvas.width, canvas.height)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get current algorithm step
    const step = algorithmSteps[currentStep] || { nodes: new Map(), description: "", values: [] }

    // Draw edges (connections between nodes)
    function drawEdges(node: TreeNode) {
      if (node.left) {
        ctx.beginPath()
        ctx.moveTo(node.x, node.y + 20) // Bottom of parent node
        ctx.lineTo(node.left.x, node.left.y - 20) // Top of left child
        ctx.strokeStyle = "#6b7280" // gray
        ctx.lineWidth = 2
        ctx.stroke()

        drawEdges(node.left)
      }

      if (node.right) {
        ctx.beginPath()
        ctx.moveTo(node.x, node.y + 20) // Bottom of parent node
        ctx.lineTo(node.right.x, node.right.y - 20) // Top of right child
        ctx.strokeStyle = "#6b7280" // gray
        ctx.lineWidth = 2
        ctx.stroke()

        drawEdges(node.right)
      }
    }

    drawEdges(root)

    // Update the drawNodes function to handle different tree types
    function drawNodes(node: TreeNode) {
      // Determine node status
      const status = step.nodes.get(node.id) || "default"

      // Set node style based on status and tree type
      let fillColor = "#f3f4f6" // gray-100
      let strokeColor = "#d1d5db" // gray-300
      let textColor = "#1f2937" // gray-800

      // Special rendering for Red-Black trees
      if (treeType === "redblack" && "color" in node) {
        const rbNode = node as any
        if (rbNode.color === "red") {
          fillColor = "#ef4444" // red
          strokeColor = "#b91c1c" // red-700
          textColor = "#ffffff" // white
        } else {
          fillColor = "#1f2937" // gray-800
          strokeColor = "#111827" // gray-900
          textColor = "#ffffff" // white
        }
      }

      // Override colors based on node status
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
      }

      // Draw node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI)
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = strokeColor
      ctx.stroke()

      // Draw node value
      ctx.fillStyle = textColor
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.value.toString(), node.x, node.y)

      // For AVL trees, show height
      if (treeType === "avl" && "height" in node) {
        const avlNode = node as any
        ctx.fillStyle = textColor
        ctx.font = "10px sans-serif"
        ctx.fillText(`h:${avlNode.height}`, node.x, node.y + 25)
      }

      // Recursively draw children
      if (node.left) {
        drawNodes(node.left)
      }

      if (node.right) {
        drawNodes(node.right)
      }
    }

    drawNodes(root)

    // Draw algorithm description
    if (step.description) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.fillRect(10, 10, canvas.width - 20, 30)
      ctx.fillStyle = "#000000"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(step.description, 20, 25)
    }

    // Draw traversal values
    if (step.values.length > 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.fillRect(10, canvas.height - 40, canvas.width - 20, 30)
      ctx.fillStyle = "#000000"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(`Values: [${step.values.join(", ")}]`, 20, canvas.height - 25)
    }
  }, [root, currentStep, algorithmSteps, treeType])

  // Update the insertValue function to handle different tree types
  const insertValue = (value: number) => {
    setRoot((currentRoot) => {
      if (currentRoot === null) {
        switch (treeType) {
          case "avl":
            return createSampleAVL()
          case "redblack":
            return createSampleRB()
          case "general":
          case "bst":
          default:
            return createTreeNode(value, "n0")
        }
      } else {
        // Create a deep copy to ensure state updates properly
        const newRoot = JSON.parse(JSON.stringify(currentRoot))

        switch (treeType) {
          case "avl":
            return insertAVL(newRoot, value)
          case "redblack":
            return insertRB(newRoot, value)
          case "general":
            // For general binary tree, insert at the first available position
            const insertInGeneral = (node: TreeNode, val: number): TreeNode => {
              if (!node.left) {
                node.left = createTreeNode(val, `n${Math.random().toString(36).substr(2, 9)}`)
              } else if (!node.right) {
                node.right = createTreeNode(val, `n${Math.random().toString(36).substr(2, 9)}`)
              } else {
                // Choose a random path
                if (Math.random() > 0.5) {
                  node.left = insertInGeneral(node.left, val)
                } else {
                  node.right = insertInGeneral(node.right, val)
                }
              }
              return node
            }
            return insertInGeneral(newRoot, value)
          case "bst":
          default:
            return insertNode(newRoot, value)
        }
      }
    })
  }

  // Add function to initialize tree from level-order array
  const initFromLevelOrder = (values: number[]) => {
    if (values.length === 0) return

    let newRoot: TreeNode | null = null

    switch (treeType) {
      case "avl":
        newRoot = buildAVLFromLevelOrder(values)
        break
      case "redblack":
        newRoot = buildRBFromLevelOrder(values)
        break
      case "general":
        // For general binary tree, just build a complete binary tree
        newRoot = buildTreeFromLevelOrder(values)
        break
      case "bst":
      default:
        // For BST, we need to insert values in a way that maintains BST property
        newRoot = null
        // Sort values to ensure BST property
        const sortedValues = [...values].sort((a, b) => a - b)
        // Build a balanced BST
        const buildBST = (arr: number[], start: number, end: number): TreeNode | null => {
          if (start > end) return null

          const mid = Math.floor((start + end) / 2)
          const node = createTreeNode(arr[mid], `n${mid}`)

          node.left = buildBST(arr, start, mid - 1)
          node.right = buildBST(arr, mid + 1, end)

          return node
        }

        newRoot = buildBST(sortedValues, 0, sortedValues.length - 1)
        break
    }

    setRoot(newRoot)
  }

  // Handle node deletion
  const deleteValue = (value: number) => {
    if (root === null) return

    const newRoot = deleteNode(root, value)
    setRoot(newRoot)
  }

  // Handle mouse click on nodes
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !root) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find clicked node
    const findNode = (node: TreeNode): TreeNode | null => {
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2))

      if (distance <= 20) {
        return node
      }

      let found: TreeNode | null = null

      if (node.left) {
        found = findNode(node.left)
        if (found) return found
      }

      if (node.right) {
        found = findNode(node.right)
        if (found) return found
      }

      return null
    }

    const clickedNode = findNode(root)

    if (clickedNode) {
      // Delete the clicked node
      deleteValue(clickedNode.value)
    }
  }

  // Add functions to window for parent component to call
  useEffect(() => {
    // Expose the insertValue function to the parent component
    if (typeof window !== "undefined") {
      ;(window as any).insertTreeNode = (value: number) => {
        insertValue(value)
      }

      // Add function to initialize tree from level-order array
      ;(window as any).initCustomTree = (values: number[]) => {
        initFromLevelOrder(values)
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).insertTreeNode
        delete (window as any).initCustomTree
      }
    }
  }, [treeType])

  // Add a function to parse custom tree input with null values
  const parseCustomTreeInput = (input: string): (number | null)[] => {
    if (!input.trim()) return []

    return input.split(",").map((item) => {
      const trimmed = item.trim().toLowerCase()
      if (trimmed === "null" || trimmed === "n" || trimmed === "") {
        return null
      }
      return Number(trimmed)
    })
  }

  // Update the useEffect that initializes the tree
  useEffect(() => {
    if (useCustomTree && customTreeInput) {
      const values = parseCustomTreeInput(customTreeInput)
      let newRoot: TreeNode | null = null

      switch (treeType) {
        case "avl":
          newRoot = buildAVLFromLevelOrder(values)
          break
        case "redblack":
          newRoot = buildRBFromLevelOrder(values)
          break
        case "general":
          newRoot = buildTreeFromLevelOrder(values)
          break
        case "bst":
        default:
          // For BST, we need to insert values in a way that maintains BST property
          newRoot = null
          // Filter out null values
          const validValues = values.filter((v) => v !== null) as number[]
          // Sort values to ensure BST property
          const sortedValues = [...validValues].sort((a, b) => a - b)
          // Build a balanced BST
          const buildBST = (arr: number[], start: number, end: number): TreeNode | null => {
            if (start > end) return null

            const mid = Math.floor((start + end) / 2)
            const node = createTreeNode(arr[mid], `n${mid}`)

            node.left = buildBST(arr, start, mid - 1)
            node.right = buildBST(arr, mid + 1, end)

            return node
          }

          newRoot = buildBST(sortedValues, 0, sortedValues.length - 1)
          break
      }

      setRoot(newRoot)
    } else if (!useCustomTree) {
      switch (treeType) {
        case "avl":
          setRoot(createSampleAVL())
          break
        case "redblack":
          setRoot(createSampleRB())
          break
        case "general":
          // For general binary tree, start with a simple root
          setRoot(createTreeNode(50, "n0"))
          break
        case "bst":
        default:
          setRoot(createSampleBST())
          break
      }
    }
  }, [treeType, useCustomTree, customTreeInput])

  // Add fullscreen functionality
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    const canvasContainer = canvasRef.current?.parentElement

    if (!canvasContainer) return

    if (!document.fullscreenElement) {
      canvasContainer
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error(`Error attempting to enable fullscreen: ${err.message}`))
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error(`Error attempting to exit fullscreen: ${err.message}`))
    }
  }

  // Add this at the end of the component, right before the return statement
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Update the return statement to include the fullscreen button
  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" onClick={handleClick} />
      <button
        className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
          </svg>
        )}
      </button>
    </div>
  )
}
