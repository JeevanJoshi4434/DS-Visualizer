"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LinkedListCanvas from "./linkedlist-canvas"
import { 
  createLinkedList, 
  type LinkedList,
  type ListNode
} from "@/lib/linkedlist-utils"
import {
  runTraversal,
  runReverse,
  runDetectCycle,
  type ListAlgorithmStep
} from "@/lib/linkedlist-algorithms"

export default function LinkedListVisualizer() {
  // List state
  const [list, setList] = useState<LinkedList>(() => createLinkedList("singly"))
  const [listType, setListType] = useState<"singly" | "doubly">("singly")
  
  // Algorithm state
  const [algorithm, setAlgorithm] = useState<string>("traverse")
  const [algorithmSteps, setAlgorithmSteps] = useState<ListAlgorithmStep[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [totalSteps, setTotalSteps] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Run algorithm when selected
  useEffect(() => {
    runSelectedAlgorithm()
  }, [algorithm, list])
  
  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
    
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, totalSteps])
  
  // Run the selected algorithm
  const runSelectedAlgorithm = () => {
    let steps: ListAlgorithmStep[] = []
    
    switch (algorithm) {
      case "traverse":
        steps = runTraversal(list)
        break
      case "reverse":
        steps = runReverse(list)
        break
      case "detectCycle":
        steps = runDetectCycle(list)
        break
      default:
        steps = []
    }
    
    setAlgorithmSteps(steps)
    setTotalSteps(steps.length)
    setCurrentStep(0)
  }
  
  // Handle list type change
  const handleListTypeChange = (type: string) => {
    setListType(type as "singly" | "doubly")
    setList(createLinkedList(type as "singly" | "doubly"))
    setCurrentStep(0)
  }
  
  // Handle algorithm change
  const handleAlgorithmChange = (algo: string) => {
    setAlgorithm(algo)
    setCurrentStep(0)
  }
  
  // Playback controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }
  
  const handleStepForward = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }
  
  const resetList = () => {
    setList(createLinkedList(listType))
    setCurrentStep(0)
  }
  
  // Node operations
  const handleAddNode = (value: number) => {
    // This is handled directly in the canvas component
  }
  
  const handleRemoveNode = (id: string) => {
    const newList = {...list}
    
    // Remove the node
    newList.nodes.delete(id)
    
    // Update any references to this node
    for (const node of newList.nodes.values()) {
      if (node.next === id) {
        node.next = null
      }
      if (node.prev === id) {
        node.prev = null
      }
    }
    
    // Update head if needed
    if (newList.head === id) {
      // Find a new head (any node without a prev pointer)
      let newHead = null
      for (const [nodeId, node] of newList.nodes.entries()) {
        if (!node.prev) {
          newHead = nodeId
          break
        }
      }
      newList.head = newHead
    }
    
    setList(newList)
  }
  
  const handleTotalStepsChange = (steps: number) => {
    setTotalSteps(steps)
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Linked List Visualization</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {Math.max(1, totalSteps)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative bg-muted rounded-md overflow-hidden h-[500px]">
            <LinkedListCanvas
              list={list}
              setList={setList}
              algorithm={algorithm}
              algorithmSteps={algorithmSteps}
              currentStep={currentStep}
              totalSteps={totalSteps}
              isPlaying={isPlaying}
              onPlay={handlePlayPause}
              onStepForward={handleStepForward}
              onStepBack={handleStepBack}
              onStepChange={handleStepChange}
              onReset={resetList}
              onAddNode={handleAddNode}
              onRemoveNode={handleRemoveNode}
              onTotalStepsChange={handleTotalStepsChange}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">List Type</h3>
              <Select value={listType} onValueChange={handleListTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select list type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singly">Singly Linked List</SelectItem>
                  <SelectItem value="doubly">Doubly Linked List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Algorithm</h3>
              <Select value={algorithm} onValueChange={handleAlgorithmChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traverse">Traversal</SelectItem>
                  <SelectItem value="reverse">Reverse List</SelectItem>
                  <SelectItem value="detectCycle">Detect Cycle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4">
              <Button onClick={runSelectedAlgorithm} className="w-full">
                Run Algorithm
              </Button>
            </div>
            
            <div className="pt-2">
              <Button onClick={resetList} variant="outline" className="w-full">
                Reset List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

