"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Play, Pause, SkipForward, SkipBack, RefreshCw, Trash2 } from "lucide-react"
import GraphCanvas from "@/components/graph-canvas"
import TreeCanvas from "@/components/tree-canvas"
import type { GraphAlgorithm, TreeAlgorithm } from "@/lib/algorithm-types"
import TreeTypeSelector from "@/components/tree-type-selector"
import FullscreenButton from "@/components/fullscreen-button"
import { Textarea } from "@/components/ui/textarea"
import { createGraph } from "@/lib/graph-utils"

export default function GraphPage() {
  // Graph state
  const [isWeighted, setIsWeighted] = useState(false)
  const [isDirected, setIsDirected] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<GraphAlgorithm>("bfs")
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [startVertex, setStartVertex] = useState<string | null>(null)
  const [endVertex, setEndVertex] = useState<string | null>(null)
  const [edgeWeight, setEdgeWeight] = useState(1)
  const [graph, setGraph] = useState(createGraph(isDirected, isWeighted))

  // Selection mode states
  const [sourceDestSelectionMode, setSourceDestSelectionMode] = useState(false)
  const [visitedSelectionMode, setVisitedSelectionMode] = useState(false)
  const [removeVisitedMode, setRemoveVisitedMode] = useState(false)
  const [customVisitedVertices, setCustomVisitedVertices] = useState<Set<string>>(new Set())
  // Add a new state for vertex movement mode
  const [vertexMoveMode, setVertexMoveMode] = useState(false)
  const [addEdgeMode, setAddEdgeMode] = useState(false)

  // Add state variables for removal modes
  const [removeVertexMode, setRemoveVertexMode] = useState(false)
  const [removeEdgeMode, setRemoveEdgeMode] = useState(false)

  // Tree state
  const [selectedTreeAlgorithm, setSelectedTreeAlgorithm] = useState<TreeAlgorithm>("inorder")
  const [treeValue, setTreeValue] = useState<number>(0)
  const [treeType, setTreeType] = useState("bst")
  const [useCustomTree, setUseCustomTree] = useState(false)
  const [customTreeInput, setCustomTreeInput] = useState("50,30,70,20,40,60,80")

  // Add fullscreen state for both graph and tree
  const [isGraphFullscreen, setIsGraphFullscreen] = useState(false)
  const [isTreeFullscreen, setIsTreeFullscreen] = useState(false)

  // Reset algorithm state
  const resetAlgorithm = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  // Handle algorithm playback
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && currentStep < totalSteps - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000 / speed)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentStep, totalSteps, speed])

  // Handle play/pause
  const handlePlay = () => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  // Step controls
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

  // Add fullscreen toggle functions
  const toggleGraphFullscreen = () => {
    const container = document.getElementById("graph-container")
    if (!container) return

    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => setIsGraphFullscreen(true))
        .catch((err) => console.error(`Error attempting to enable fullscreen: ${err.message}`))
    } else {
      document
        .exitFullscreen()
        .then(() => setIsGraphFullscreen(false))
        .catch((err) => console.error(`Error attempting to exit fullscreen: ${err.message}`))
    }
  }

  const toggleTreeFullscreen = () => {
    const container = document.getElementById("tree-container")
    if (!container) return

    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => setIsTreeFullscreen(true))
        .catch((err) => console.error(`Error attempting to exit fullscreen: ${err.message}`))
    } else {
      document
        .exitFullscreen()
        .then(() => setIsTreeFullscreen(false))
        .catch((err) => console.error(`Error attempting to exit fullscreen: ${err.message}`))
    }
  }

  // Add fullscreen change event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsGraphFullscreen(!!document.fullscreenElement && document.fullscreenElement.id === "graph-container")
      setIsTreeFullscreen(!!document.fullscreenElement && document.fullscreenElement.id === "tree-container")
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Add a function to handle tree node insertion
  const handleAddTreeNode = () => {
    if (typeof window !== "undefined" && (window as any).insertTreeNode) {
      ;(window as any).insertTreeNode(treeValue)
      setTreeValue(0)
    }
  }

  // Handle custom tree initialization
  const handleInitCustomTree = () => {
    if (typeof window !== "undefined" && (window as any).initCustomTree) {
      try {
        const values = customTreeInput.split(",").map((v) => Number.parseInt(v.trim()))
        ;(window as any).initCustomTree(values)
      } catch (error) {
        console.error("Invalid tree input format", error)
        alert("Please enter comma-separated numbers (e.g., 50,30,70,20,40)")
      }
    }
  }

  // Handle vertex selection for graph
  const handleVertexSelect = (id: string) => {
    if (sourceDestSelectionMode) {
      // If source not set, set it, otherwise set destination
      if (!startVertex) {
        setStartVertex(id)
      } else if (!endVertex && id !== startVertex) {
        setEndVertex(id)
      } else {
        // If both are set, reset and set this as source
        setStartVertex(id)
        setEndVertex(null)
      }
    } else if (visitedSelectionMode) {
      setCustomVisitedVertices((prev) => {
        const newSet = new Set(prev)
        newSet.add(id)
        return newSet
      })
    } else if (removeVisitedMode) {
      setCustomVisitedVertices((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  // Toggle selection modes
  const toggleVisitedMode = () => {
    setVisitedSelectionMode(!visitedSelectionMode)
    if (!visitedSelectionMode) {
      setSourceDestSelectionMode(false)
      setRemoveVisitedMode(false)
    }
  }

  const toggleRemoveVisitedMode = () => {
    setRemoveVisitedMode(!removeVisitedMode)
    if (!removeVisitedMode) {
      setSourceDestSelectionMode(false)
      setVisitedSelectionMode(false)
    }
  }

  // Clear custom visited vertices
  const clearCustomVisited = () => {
    setCustomVisitedVertices(new Set())
  }

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Graph & Tree Algorithm Visualizer</CardTitle>
          <CardDescription>Create graphs and trees, then visualize algorithms step by step</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="graph">
        <TabsList className="mb-4">
          <TabsTrigger value="graph">Graph Algorithms</TabsTrigger>
          <TabsTrigger value="tree">Tree Algorithms</TabsTrigger>
        </TabsList>

        {/* Graph Visualization Tab */}
        <TabsContent value="graph">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Graph Controls</CardTitle>
                <CardDescription>Configure your graph and algorithm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weighted">Weighted Graph</Label>
                  <Switch id="weighted" checked={isWeighted} onCheckedChange={setIsWeighted} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="directed">Directed Graph</Label>
                  <Switch id="directed" checked={isDirected} onCheckedChange={setIsDirected} />
                </div>

                {isWeighted && (
                  <div className="space-y-2">
                    <Label htmlFor="edge-weight">Edge Weight</Label>
                    <Input
                      id="edge-weight"
                      type="number"
                      value={edgeWeight}
                      onChange={(e) => setEdgeWeight(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="algorithm">Algorithm</Label>
                  <Select
                    value={selectedAlgorithm}
                    onValueChange={(value) => {
                      setSelectedAlgorithm(value as GraphAlgorithm)
                      resetAlgorithm()
                    }}
                  >
                    <SelectTrigger id="algorithm">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bfs">Breadth-First Search</SelectItem>
                      <SelectItem value="dfs">Depth-First Search</SelectItem>
                      <SelectItem value="dijkstra" disabled={!isWeighted}>
                        Dijkstra's Algorithm
                      </SelectItem>
                      <SelectItem value="prim" disabled={!isWeighted}>
                        Minimum Spanning Tree (Prim's)
                      </SelectItem>
                      <SelectItem value="kruskal" disabled={!isWeighted}>
                        Minimum Spanning Tree (Kruskal's)
                      </SelectItem>
                      <SelectItem value="topological" disabled={!isDirected}>
                        Topological Sort
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vertex Selection Modes */}
                <div className="space-y-2">
                  <Label>Vertex Selection</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={sourceDestSelectionMode ? "default" : "outline"}
                      onClick={() => {
                        setSourceDestSelectionMode(!sourceDestSelectionMode)
                        if (!sourceDestSelectionMode) {
                          setVisitedSelectionMode(false)
                          setRemoveVisitedMode(false)
                          setVertexMoveMode(false)
                          setAddEdgeMode(false)
                        }
                      }}
                      className={sourceDestSelectionMode ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      Mark Source/Dest
                    </Button>
                    <Button
                      variant={visitedSelectionMode ? "default" : "outline"}
                      onClick={() => {
                        setVisitedSelectionMode(!visitedSelectionMode)
                        if (!visitedSelectionMode) {
                          setSourceDestSelectionMode(false)
                          setRemoveVisitedMode(false)
                          setVertexMoveMode(false)
                          setAddEdgeMode(false)
                        }
                      }}
                      className={visitedSelectionMode ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      Mark Visited
                    </Button>
                    <Button
                      variant={removeVisitedMode ? "default" : "outline"}
                      onClick={() => {
                        setRemoveVisitedMode(!removeVisitedMode)
                        if (!removeVisitedMode) {
                          setSourceDestSelectionMode(false)
                          setVisitedSelectionMode(false)
                          setVertexMoveMode(false)
                          setAddEdgeMode(false)
                        }
                      }}
                      className={removeVisitedMode ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      Unmark Visited
                    </Button>
                    <Button
                      variant={vertexMoveMode ? "default" : "outline"}
                      onClick={() => {
                        setVertexMoveMode(!vertexMoveMode)
                        if (!vertexMoveMode) {
                          setSourceDestSelectionMode(false)
                          setVisitedSelectionMode(false)
                          setRemoveVisitedMode(false)
                          setAddEdgeMode(false)
                        }
                      }}
                      className={vertexMoveMode ? "bg-purple-500 hover:bg-purple-600" : ""}
                    >
                      Move Vertices
                    </Button>
                    <Button
                      variant={addEdgeMode ? "default" : "outline"}
                      onClick={() => {
                        setAddEdgeMode(!addEdgeMode)
                        if (!addEdgeMode) {
                          setSourceDestSelectionMode(false)
                          setVisitedSelectionMode(false)
                          setRemoveVisitedMode(false)
                          setVertexMoveMode(false)
                        }
                      }}
                      className={addEdgeMode ? "bg-blue-500 hover:bg-blue-600" : ""}
                    >
                      Add Edge
                    </Button>
                    <Button
                      variant={removeVertexMode ? "default" : "outline"}
                      onClick={() => {
                        setRemoveVertexMode(!removeVertexMode)
                        if (!removeVertexMode) {
                          setSourceDestSelectionMode(false)
                          setVisitedSelectionMode(false)
                          setRemoveVisitedMode(false)
                          setVertexMoveMode(false)
                          setAddEdgeMode(false)
                          setRemoveEdgeMode(false)
                        }
                      }}
                      className={removeVertexMode ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      Remove Vertex
                    </Button>
                    <Button
                      variant={removeEdgeMode ? "default" : "outline"}
                      onClick={() => {
                        setRemoveEdgeMode(!removeEdgeMode)
                        if (!removeEdgeMode) {
                          setSourceDestSelectionMode(false)
                          setVisitedSelectionMode(false)
                          setRemoveVisitedMode(false)
                          setVertexMoveMode(false)
                          setAddEdgeMode(false)
                          setRemoveVertexMode(false)
                        }
                      }}
                      className={removeEdgeMode ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      Remove Edge
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setCustomVisitedVertices(new Set())} className="w-full">
                    Clear Visited
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Click on empty space to create a vertex</li>
                      <li>Drag from one vertex to another to create an edge</li>
                      <li>Use the buttons above to select source/destination or mark vertices as visited</li>
                      <li>Right-click on vertex/edge to delete it</li>
                      <li>For visualization it is <span className="font-bold">Mandatory to Mark Source (and Destination if applicable)</span> using Mark Source/Dest button. </li>
                    </ul>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setGraph(createGraph(isDirected, isWeighted))
                        setStartVertex(null)
                        setEndVertex(null)
                        setCustomVisitedVertices(new Set())
                        resetAlgorithm()
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Graph
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetAlgorithm}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Algorithm
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Graph Visualization</CardTitle>
                <CardDescription>
                  Step {currentStep + 1} of {Math.max(1, totalSteps)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div id="graph-container" className="relative bg-muted rounded-md overflow-hidden h-[500px]">
                  <GraphCanvas
                    graph={graph}
                    setGraph={setGraph}
                    isWeighted={isWeighted}
                    isDirected={isDirected}
                    algorithm={selectedAlgorithm}
                    currentStep={currentStep}
                    onTotalStepsChange={setTotalSteps}
                    startVertex={startVertex}
                    endVertex={endVertex}
                    onSelectVertex={handleVertexSelect}
                    edgeWeight={edgeWeight}
                    customVisitedVertices={customVisitedVertices}
                    sourceDestSelectionMode={sourceDestSelectionMode}
                    visitedSelectionMode={visitedSelectionMode}
                    removeVisitedMode={removeVisitedMode}
                    vertexMoveMode={vertexMoveMode}
                    addEdgeMode={addEdgeMode}
                    removeVertexMode={removeVertexMode}
                    removeEdgeMode={removeEdgeMode}
                    isPlaying={isPlaying}
                    onPlay={handlePlay}
                    onStepForward={handleStepForward}
                    onStepBack={handleStepBack}
                    onReset={resetAlgorithm}
                    totalSteps={totalSteps}
                    onStepChange={setCurrentStep}
                    onToggleSourceDestMode={() => {
                      setSourceDestSelectionMode(!sourceDestSelectionMode)
                      if (!sourceDestSelectionMode) {
                        setVisitedSelectionMode(false)
                        setRemoveVisitedMode(false)
                        setVertexMoveMode(false)
                        setAddEdgeMode(false)
                        setRemoveVertexMode(false)
                        setRemoveEdgeMode(false)
                      }
                    }}
                    onToggleVisitedMode={() => {
                      setVisitedSelectionMode(!visitedSelectionMode)
                      if (!visitedSelectionMode) {
                        setSourceDestSelectionMode(false)
                        setRemoveVisitedMode(false)
                        setVertexMoveMode(false)
                        setAddEdgeMode(false)
                        setRemoveVertexMode(false)
                        setRemoveEdgeMode(false)
                      }
                    }}
                    onToggleRemoveVisitedMode={() => {
                      setRemoveVisitedMode(!removeVisitedMode)
                      if (!removeVisitedMode) {
                        setSourceDestSelectionMode(false)
                        setVisitedSelectionMode(false)
                        setVertexMoveMode(false)
                        setAddEdgeMode(false)
                        setRemoveVertexMode(false)
                        setRemoveEdgeMode(false)
                      }
                    }}
                    onToggleVertexMoveMode={() => {
                      setVertexMoveMode(!vertexMoveMode)
                      if (!vertexMoveMode) {
                        setSourceDestSelectionMode(false)
                        setVisitedSelectionMode(false)
                        setRemoveVisitedMode(false)
                        setAddEdgeMode(false)
                        setRemoveVertexMode(false)
                        setRemoveEdgeMode(false)
                      }
                    }}
                    onToggleAddEdgeMode={() => {
                      setAddEdgeMode(!addEdgeMode)
                      if (!addEdgeMode) {
                        setSourceDestSelectionMode(false)
                        setVisitedSelectionMode(false)
                        setRemoveVisitedMode(false)
                        setVertexMoveMode(false)
                        setRemoveVertexMode(false)
                        setRemoveEdgeMode(false)
                      }
                    }}
                    onToggleRemoveVertexMode={() => {
                      setRemoveVertexMode(!removeVertexMode)
                      if (!removeVertexMode) {
                        setSourceDestSelectionMode(false)
                        setVisitedSelectionMode(false)
                        setRemoveVisitedMode(false)
                        setVertexMoveMode(false)
                        setAddEdgeMode(false)
                        setRemoveEdgeMode(false)
                      }
                    }}
                    onToggleRemoveEdgeMode={() => {
                      setRemoveEdgeMode(!removeEdgeMode)
                      if (!removeEdgeMode) {
                        setSourceDestSelectionMode(false)
                        setVisitedSelectionMode(false)
                        setRemoveVisitedMode(false)
                        setVertexMoveMode(false)
                        setAddEdgeMode(false)
                        setRemoveVertexMode(false)
                      }
                    }}
                    onClearVisited={() => setCustomVisitedVertices(new Set())}
                  />

                  <FullscreenButton targetId="graph-container" className="absolute top-2 right-2 z-10" />

                  {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md">
                    <Button variant="outline" size="icon" onClick={handleStepBack} disabled={currentStep <= 0}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handlePlay}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStepForward}
                      disabled={currentStep >= totalSteps - 1}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={resetAlgorithm}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <div className="w-32 px-2">
                      <Slider
                        value={[currentStep]}
                        max={Math.max(totalSteps - 1, 1)}
                        step={1}
                        onValueChange={(value) => setCurrentStep(value[0])}
                      />
                    </div>
                    <div className="w-24 px-2">
                      <Slider
                        value={[speed]}
                        min={0.5}
                        max={3}
                        step={0.5}
                        onValueChange={(value) => setSpeed(value[0])}
                      />
                    </div>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Algorithm Details</CardTitle>
              <CardDescription>Learn about the selected algorithm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {selectedAlgorithm === "bfs" && (
                  <>
                    <h3>Breadth-First Search (BFS)</h3>
                    <p>
                      BFS explores a graph level by level, visiting all neighbors of a vertex before moving to the next
                      level. It's ideal for finding the shortest path in unweighted graphs.
                    </p>
                    <h4>Time Complexity: O(V + E)</h4>
                    <p>Where V is the number of vertices and E is the number of edges.</p>
                  </>
                )}

                {selectedAlgorithm === "dfs" && (
                  <>
                    <h3>Depth-First Search (DFS)</h3>
                    <p>
                      DFS explores a graph by going as deep as possible along each branch before backtracking. It's
                      useful for topological sorting, finding connected components, and cycle detection.
                    </p>
                    <h4>Time Complexity: O(V + E)</h4>
                    <p>Where V is the number of vertices and E is the number of edges.</p>
                  </>
                )}

                {selectedAlgorithm === "dijkstra" && (
                  <>
                    <h3>Dijkstra's Algorithm</h3>
                    <p>
                      Dijkstra's algorithm finds the shortest path from a start vertex to all other vertices in a
                      weighted graph. It uses a priority queue to always explore the vertex with the smallest known
                      distance.
                    </p>
                    <h4>Time Complexity: O((V + E) log V)</h4>
                    <p>Where V is the number of vertices and E is the number of edges.</p>
                  </>
                )}

                {selectedAlgorithm === "prim" && (
                  <>
                    <h3>Minimum Spanning Tree (Prim's Algorithm)</h3>
                    <p>
                      Prim's algorithm finds a minimum spanning tree for a weighted undirected graph. It grows the tree
                      one vertex at a time, always adding the lowest-weight edge that connects a vertex in the tree to a
                      vertex outside the tree.
                    </p>
                    <h4>Time Complexity: O(E log V)</h4>
                    <p>Where V is the number of vertices and E is the number of edges.</p>
                  </>
                )}

                {selectedAlgorithm === "kruskal" && (
                  <>
                    <h3>Minimum Spanning Tree (Kruskal's Algorithm)</h3>
                    <p>
                      Kruskal's algorithm finds a minimum spanning tree for a weighted undirected graph. It sorts all
                      edges by weight and adds them to the tree if they don't create a cycle.
                    </p>
                    <h4>Time Complexity: O(E log E)</h4>
                    <p>Where E is the number of edges.</p>
                  </>
                )}

                {selectedAlgorithm === "topological" && (
                  <>
                    <h3>Topological Sort</h3>
                    <p>
                      Topological sorting arranges the vertices of a directed acyclic graph (DAG) in a linear order such
                      that for every directed edge (u, v), vertex u comes before vertex v. It's useful for scheduling
                      tasks with dependencies.
                    </p>
                    <h4>Time Complexity: O(V + E)</h4>
                    <p>Where V is the number of vertices and E is the number of edges.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tree Visualization Tab */}
        <TabsContent value="tree">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Tree Controls</CardTitle>
                <CardDescription>Configure your binary search tree</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tree-algorithm">Traversal Algorithm</Label>
                  <Select
                    value={selectedTreeAlgorithm}
                    onValueChange={(value) => {
                      setSelectedTreeAlgorithm(value as TreeAlgorithm)
                      resetAlgorithm()
                    }}
                  >
                    <SelectTrigger id="tree-algorithm">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inorder">In-Order Traversal</SelectItem>
                      <SelectItem value="preorder">Pre-Order Traversal</SelectItem>
                      <SelectItem value="postorder">Post-Order Traversal</SelectItem>
                      <SelectItem value="levelorder">Level-Order Traversal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tree Type</Label>
                  <TreeTypeSelector value={treeType} onChange={(value) => setTreeType(value)} />
                </div>

                {/* Custom Tree Input */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-tree">Custom Tree</Label>
                  <Switch id="custom-tree" checked={useCustomTree} onCheckedChange={setUseCustomTree} />
                </div>

                {useCustomTree && (
                  <div className="space-y-2">
                    <Label htmlFor="tree-input">Level-Order Values (comma-separated)</Label>
                    <Textarea
                      id="tree-input"
                      value={customTreeInput}
                      onChange={(e) => setCustomTreeInput(e.target.value)}
                      placeholder="e.g., 50,30,70,20,40,60,80"
                      className="h-20"
                    />
                    <Button onClick={handleInitCustomTree} className="w-full mb-4">
                      Initialize Tree
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="tree-value">Add Node</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="tree-value"
                      type="number"
                      value={treeValue}
                      onChange={(e) => setTreeValue(Number(e.target.value))}
                    />
                    <Button onClick={handleAddTreeNode}>Add</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Enter a value and click Add to insert into the tree</li>
                      <li>Or toggle Custom Tree to initialize from a level-order array</li>
                      <li>Click on a node to remove it from the tree</li>
                      <li>Use the traversal algorithms to visualize different ways to visit all nodes</li>
                    </ul>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Tree
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetAlgorithm}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Traversal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Tree Visualization</CardTitle>
                <CardDescription>
                  Step {currentStep + 1} of {Math.max(1, totalSteps)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div id="tree-container" className="relative bg-muted rounded-md overflow-hidden h-[500px]">
                  <TreeCanvas
                    algorithm={selectedTreeAlgorithm}
                    currentStep={currentStep}
                    onTotalStepsChange={setTotalSteps}
                    treeType={treeType}
                    useCustomTree={useCustomTree}
                    customTreeInput={customTreeInput}
                  />

                  <FullscreenButton targetId="tree-container" className="absolute top-2 right-2 z-10" />

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md">
                    <Button variant="outline" size="icon" onClick={handleStepBack} disabled={currentStep <= 0}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handlePlay}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStepForward}
                      disabled={currentStep >= totalSteps - 1}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={resetAlgorithm}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <div className="w-32 px-2">
                      <Slider
                        value={[currentStep]}
                        max={Math.max(totalSteps - 1, 1)}
                        step={1}
                        onValueChange={(value) => setCurrentStep(value[0])}
                      />
                    </div>
                    <div className="w-24 px-2">
                      <Slider
                        value={[speed]}
                        min={0.5}
                        max={3}
                        step={0.5}
                        onValueChange={(value) => setSpeed(value[0])}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tree Traversal Details</CardTitle>
              <CardDescription>Learn about the selected traversal algorithm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {selectedTreeAlgorithm === "inorder" && (
                  <>
                    <h3>In-Order Traversal</h3>
                    <p>
                      In-order traversal visits the left subtree, then the root, then the right subtree. For a binary
                      search tree, this visits nodes in ascending order.
                    </p>
                    <pre>inorder(node): if node is not null: inorder(node.left) visit(node) inorder(node.right)</pre>
                  </>
                )}

                {selectedTreeAlgorithm === "preorder" && (
                  <>
                    <h3>Pre-Order Traversal</h3>
                    <p>
                      Pre-order traversal visits the root, then the left subtree, then the right subtree. It's useful
                      for creating a copy of the tree or prefix expression trees.
                    </p>
                    <pre>preorder(node): if node is not null: visit(node) preorder(node.left) preorder(node.right)</pre>
                  </>
                )}

                {selectedTreeAlgorithm === "postorder" && (
                  <>
                    <h3>Post-Order Traversal</h3>
                    <p>
                      Post-order traversal visits the left subtree, then the right subtree, then the root. It's useful
                      for deleting a tree or evaluating postfix expressions.
                    </p>
                    <pre>
                      postorder(node): if node is not null: postorder(node.left) postorder(node.right) visit(node)
                    </pre>
                  </>
                )}

                {selectedTreeAlgorithm === "levelorder" && (
                  <>
                    <h3>Level-Order Traversal</h3>
                    <p>
                      Level-order traversal visits nodes level by level, from top to bottom, left to right. It uses a
                      queue to keep track of nodes to visit.
                    </p>
                    <pre>
                      levelorder(root): if root is null: return queue = new Queue() queue.enqueue(root) while queue is
                      not empty: node = queue.dequeue() visit(node) if node.left is not null: queue.enqueue(node.left)
                      if node.right is not null: queue.enqueue(node.right)
                    </pre>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <style jsx global>{`
        #graph-container:fullscreen,
        #tree-container:fullscreen {
          background-color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        
        #graph-container:fullscreen canvas,
        #tree-container:fullscreen canvas {
          flex: 1;
          height: calc(100vh - 100px) !important;
        }
      `}</style>
    </main>
  )
}






