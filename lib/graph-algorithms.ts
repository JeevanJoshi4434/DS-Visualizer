import { type Graph, type Edge, resetGraphStatus } from "./graph-utils"
import type { NodeStatus, EdgeStatus } from "./algorithm-types"

// Algorithm step for visualization
export interface AlgorithmStep {
  vertices: Map<string, NodeStatus>
  edges: Map<string, EdgeStatus>
  description: string
  queue?: string[]
  stack?: string[]
}

// BFS algorithm
export function runBFS(graph: Graph, startId: string): AlgorithmStep[] {
  resetGraphStatus(graph)
  const steps: AlgorithmStep[] = []
  const visited = new Set<string>()
  const queue: string[] = []

  // Initialize
  queue.push(startId)
  visited.add(startId)

  steps.push({
    vertices: new Map([[startId, "start"]]),
    edges: new Map(),
    description: `Starting BFS from vertex ${startId}`,
    queue: [...queue], // Add queue state to step
  })

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const currentVertex = graph.vertices.get(currentId)!

    // Mark current vertex as active
    const vertexStatuses = new Map<string, NodeStatus>()
    vertexStatuses.set(currentId, "active")

    // Mark visited vertices
    for (const visitedId of visited) {
      if (visitedId !== currentId) {
        vertexStatuses.set(visitedId, "visited")
      }
    }

    steps.push({
      vertices: vertexStatuses,
      edges: new Map(),
      description: `Processing vertex ${currentId}`,
      queue: [...queue], // Add current queue state
    })

    // Process neighbors
    for (const edge of graph.edges.values()) {
      if (edge.source === currentId) {
        const neighborId = edge.target

        if (!visited.has(neighborId)) {
          // Exploring a new edge
          const edgeStatuses = new Map<string, EdgeStatus>()
          edgeStatuses.set(edge.id, "active")

          // Mark previously visited edges
          for (const e of graph.edges.values()) {
            if (visited.has(e.source) && visited.has(e.target) && e.id !== edge.id) {
              edgeStatuses.set(e.id, "visited")
            }
          }

          steps.push({
            vertices: vertexStatuses,
            edges: edgeStatuses,
            description: `Exploring edge from ${currentId} to ${neighborId}`,
          })

          // Add neighbor to queue and mark as visited
          queue.push(neighborId)
          visited.add(neighborId)

          const updatedVertexStatuses = new Map(vertexStatuses)
          updatedVertexStatuses.set(neighborId, "active")

          steps.push({
            vertices: updatedVertexStatuses,
            edges: edgeStatuses,
            description: `Added vertex ${neighborId} to the queue`,
            queue: [...queue], // Update queue after adding neighbors
          })
        } else {
          // Already visited neighbor
          const edgeStatuses = new Map<string, EdgeStatus>()
          edgeStatuses.set(edge.id, "discarded")

          steps.push({
            vertices: vertexStatuses,
            edges: edgeStatuses,
            description: `Vertex ${neighborId} already visited, skipping`,
          })
        }
      }
    }
  }

  // Final state
  const finalVertexStatuses = new Map<string, NodeStatus>()
  const finalEdgeStatuses = new Map<string, EdgeStatus>()

  for (const visitedId of visited) {
    finalVertexStatuses.set(visitedId, "visited")
  }

  for (const edge of graph.edges.values()) {
    if (visited.has(edge.source) && visited.has(edge.target)) {
      finalEdgeStatuses.set(edge.id, "visited")
    }
  }

  steps.push({
    vertices: finalVertexStatuses,
    edges: finalEdgeStatuses,
    description: "BFS completed",
    queue: [], // Empty queue at the end
  })

  return steps
}

// DFS algorithm
export function runDFS(graph: Graph, startId: string): AlgorithmStep[] {
  resetGraphStatus(graph)
  const steps: AlgorithmStep[] = []
  const visited = new Set<string>()
  const stack: string[] = [startId]; // Track the stack explicitly

  steps.push({
    vertices: new Map([[startId, "start"]]),
    edges: new Map(),
    description: `Starting DFS from vertex ${startId}`,
    stack: [...stack], // Add stack state
  })

  function dfs(currentId: string) {
    visited.add(currentId)
    stack.pop(); // Remove current node from stack
    
    // Add current stack state to steps
    const vertexStatuses = new Map<string, NodeStatus>()
    vertexStatuses.set(currentId, "active")

    // Mark visited vertices
    for (const visitedId of visited) {
      if (visitedId !== currentId) {
        vertexStatuses.set(visitedId, "visited")
      }
    }

    steps.push({
      vertices: vertexStatuses,
      edges: new Map(),
      description: `Processing vertex ${currentId}`,
      stack: [...stack],
    })

    // Process neighbors
    for (const edge of graph.edges.values()) {
      if (edge.source === currentId) {
        const neighborId = edge.target

        if (!visited.has(neighborId)) {
          // Exploring a new edge
          const edgeStatuses = new Map<string, EdgeStatus>()
          edgeStatuses.set(edge.id, "active")

          // Mark previously visited edges
          for (const e of graph.edges.values()) {
            if (visited.has(e.source) && visited.has(e.target) && e.id !== edge.id) {
              edgeStatuses.set(e.id, "visited")
            }
          }

          steps.push({
            vertices: vertexStatuses,
            edges: edgeStatuses,
            description: `Exploring edge from ${currentId} to ${neighborId}`,
            stack: [...stack],
          })

          // Add neighbor to stack and mark as visited
          stack.push(neighborId)
          visited.add(neighborId)

          const updatedVertexStatuses = new Map(vertexStatuses)
          updatedVertexStatuses.set(neighborId, "active")

          steps.push({
            vertices: updatedVertexStatuses,
            edges: edgeStatuses,
            description: `Added vertex ${neighborId} to the stack`,
            stack: [...stack],
          })

          dfs(neighborId)
        } else {
          // Already visited neighbor
          const edgeStatuses = new Map<string, EdgeStatus>()
          edgeStatuses.set(edge.id, "discarded")

          steps.push({
            vertices: vertexStatuses,
            edges: edgeStatuses,
            description: `Vertex ${neighborId} already visited, skipping`,
          })
        }
      }
    }
  }

  dfs(startId)

  // Final state
  const finalVertexStatuses = new Map<string, NodeStatus>()
  const finalEdgeStatuses = new Map<string, EdgeStatus>()

  for (const visitedId of visited) {
    finalVertexStatuses.set(visitedId, "visited")
  }

  for (const edge of graph.edges.values()) {
    if (visited.has(edge.source) && visited.has(edge.target)) {
      finalEdgeStatuses.set(edge.id, "visited")
    }
  }

  steps.push({
    vertices: finalVertexStatuses,
    edges: finalEdgeStatuses,
    description: "DFS completed",
    stack: [], // Empty stack at the end
  })

  return steps
}

// Dijkstra's algorithm
export function runDijkstra(graph: Graph, startId: string, endId?: string): AlgorithmStep[] {
  resetGraphStatus(graph)
  const steps: AlgorithmStep[] = []

  // Initialize distances
  const distances = new Map<string, number>()
  const previous = new Map<string, string | null>()
  const unvisited = new Set<string>()

  for (const vertex of graph.vertices.values()) {
    distances.set(vertex.id, vertex.id === startId ? 0 : Number.POSITIVE_INFINITY)
    previous.set(vertex.id, null)
    unvisited.add(vertex.id)
  }

  steps.push({
    vertices: new Map([[startId, "start"]]),
    edges: new Map(),
    description: `Starting Dijkstra's algorithm from vertex ${startId}`,
  })

  while (unvisited.size > 0) {
    // Find vertex with minimum distance
    let currentId: string | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const id of unvisited) {
      const distance = distances.get(id)!
      if (distance < minDistance) {
        minDistance = distance
        currentId = id
      }
    }

    // If we can't find a vertex or we've reached the end, break
    if (currentId === null || minDistance === Number.POSITIVE_INFINITY || currentId === endId) {
      break
    }

    // Remove from unvisited
    unvisited.delete(currentId)

    // Mark current vertex as active
    const vertexStatuses = new Map<string, NodeStatus>()
    vertexStatuses.set(currentId, "active")

    // Mark visited vertices
    for (const id of graph.vertices.keys()) {
      if (!unvisited.has(id) && id !== currentId) {
        vertexStatuses.set(id, "visited")
      }
    }

    if (endId) {
      vertexStatuses.set(endId, "end")
    }

    steps.push({
      vertices: vertexStatuses,
      edges: new Map(),
      description: `Processing vertex ${currentId} with distance ${distances.get(currentId)}`,
    })

    // Update distances to neighbors
    for (const edge of graph.edges.values()) {
      if (edge.source === currentId && unvisited.has(edge.target)) {
        const neighborId = edge.target
        const newDistance = distances.get(currentId)! + edge.weight

        // Mark edge as active
        const edgeStatuses = new Map<string, EdgeStatus>()
        edgeStatuses.set(edge.id, "active")

        steps.push({
          vertices: vertexStatuses,
          edges: edgeStatuses,
          description: `Checking edge from ${currentId} to ${neighborId} with weight ${edge.weight}`,
        })

        if (newDistance < distances.get(neighborId)!) {
          distances.set(neighborId, newDistance)
          previous.set(neighborId, currentId)

          steps.push({
            vertices: new Map([...vertexStatuses, [neighborId, "active"]]),
            edges: edgeStatuses,
            description: `Updated distance to ${neighborId}: ${newDistance}`,
          })
        } else {
          edgeStatuses.set(edge.id, "discarded")

          steps.push({
            vertices: vertexStatuses,
            edges: edgeStatuses,
            description: `No improvement to ${neighborId}, current: ${distances.get(neighborId)}, new: ${newDistance}`,
          })
        }
      }
    }
  }

  // Reconstruct path if end vertex is specified
  if (endId && previous.get(endId) !== null) {
    const path: string[] = []
    let current: string | null = endId

    while (current !== null) {
      path.unshift(current)
      current = previous.get(current)!
    }

    // Visualize the path
    const pathVertexStatuses = new Map<string, NodeStatus>()
    const pathEdgeStatuses = new Map<string, EdgeStatus>()

    for (let i = 0; i < path.length; i++) {
      pathVertexStatuses.set(path[i], i === 0 ? "start" : i === path.length - 1 ? "end" : "path")

      if (i < path.length - 1) {
        const edgeId = `e${path[i]}-${path[i + 1]}`
        pathEdgeStatuses.set(edgeId, "path")
      }
    }

    steps.push({
      vertices: pathVertexStatuses,
      edges: pathEdgeStatuses,
      description: `Shortest path found: ${path.join(" → ")} with total distance ${distances.get(endId)}`,
    })
  } else {
    // Final state without specific end
    const finalVertexStatuses = new Map<string, NodeStatus>()

    for (const id of graph.vertices.keys()) {
      if (!unvisited.has(id)) {
        finalVertexStatuses.set(id, "visited")
      }
    }

    finalVertexStatuses.set(startId, "start")

    steps.push({
      vertices: finalVertexStatuses,
      edges: new Map(),
      description: "Dijkstra's algorithm completed",
    })
  }

  return steps
}

// Prim's algorithm for Minimum Spanning Tree
export function runPrim(graph: Graph, startId: string): AlgorithmStep[] {
  resetGraphStatus(graph)
  const steps: AlgorithmStep[] = []

  // Initialize
  const visited = new Set<string>()
  const mstEdges = new Set<string>()

  visited.add(startId)

  steps.push({
    vertices: new Map([[startId, "start"]]),
    edges: new Map(),
    description: `Starting Prim's algorithm from vertex ${startId}`,
  })

  while (visited.size < graph.vertices.size) {
    let minEdge: Edge | null = null
    let minWeight = Number.POSITIVE_INFINITY

    // Find the minimum weight edge that connects a visited vertex to an unvisited vertex
    for (const edge of graph.edges.values()) {
      const sourceVisited = visited.has(edge.source)
      const targetVisited = visited.has(edge.target)

      // Edge connects visited to unvisited
      if ((sourceVisited && !targetVisited) || (!sourceVisited && targetVisited)) {
        if (edge.weight < minWeight) {
          minWeight = edge.weight
          minEdge = edge
        }
      }
    }

    if (!minEdge) {
      // Graph is not connected
      steps.push({
        vertices: new Map([...visited].map((id) => [id, "visited"])),
        edges: new Map([...mstEdges].map((id) => [id, "path"])),
        description: "Graph is not connected, MST cannot be completed",
      })
      break
    }

    // Add the edge to MST
    mstEdges.add(minEdge.id)

    // Determine which vertex is newly visited
    const newVertexId = visited.has(minEdge.source) ? minEdge.target : minEdge.source
    visited.add(newVertexId)

    // Update visualization
    const vertexStatuses = new Map<string, NodeStatus>()
    const edgeStatuses = new Map<string, EdgeStatus>()

    // Mark all visited vertices
    for (const id of visited) {
      vertexStatuses.set(id, id === newVertexId ? "active" : "visited")
    }

    // Mark all MST edges
    for (const id of mstEdges) {
      edgeStatuses.set(id, id === minEdge.id ? "active" : "path")
    }

    steps.push({
      vertices: vertexStatuses,
      edges: edgeStatuses,
      description: `Added edge ${minEdge.id} with weight ${minEdge.weight} to MST`,
    })
  }

  // Final state
  const finalVertexStatuses = new Map<string, NodeStatus>()
  const finalEdgeStatuses = new Map<string, EdgeStatus>()

  for (const id of visited) {
    finalVertexStatuses.set(id, "visited")
  }

  for (const id of mstEdges) {
    finalEdgeStatuses.set(id, "path")
  }

  steps.push({
    vertices: finalVertexStatuses,
    edges: finalEdgeStatuses,
    description: "Minimum Spanning Tree completed",
  })

  return steps
}

// Kruskal's algorithm for Minimum Spanning Tree
export function runKruskal(graph: Graph): AlgorithmStep[] {
  resetGraphStatus(graph)
  const steps: AlgorithmStep[] = []

  // Initialize disjoint set
  const parent = new Map<string, string>()
  const rank = new Map<string, number>()

  // Make set for each vertex
  for (const vertex of graph.vertices.values()) {
    parent.set(vertex.id, vertex.id)
    rank.set(vertex.id, 0)
  }

  // Find function with path compression
  function find(x: string): string {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!))
    }
    return parent.get(x)!
  }

  // Union function with rank
  function union(x: string, y: string): void {
    const rootX = find(x)
    const rootY = find(y)

    if (rootX === rootY) return

    if (rank.get(rootX)! < rank.get(rootY)!) {
      parent.set(rootX, rootY)
    } else if (rank.get(rootX)! > rank.get(rootY)!) {
      parent.set(rootY, rootX)
    } else {
      parent.set(rootY, rootX)
      rank.set(rootX, rank.get(rootX)! + 1)
    }
  }

  // Sort edges by weight
  const edges = Array.from(graph.edges.values())
  edges.sort((a, b) => a.weight - b.weight)

  steps.push({
    vertices: new Map(),
    edges: new Map(),
    description: "Starting Kruskal's algorithm",
  })

  const mstEdges = new Set<string>()

  for (const edge of edges) {
    // Skip duplicate edges in undirected graphs
    if (!graph.isDirected && edge.source > edge.target) {
      continue
    }

    const edgeStatuses = new Map<string, EdgeStatus>()
    edgeStatuses.set(edge.id, "active")

    steps.push({
      vertices: new Map(),
      edges: edgeStatuses,
      description: `Considering edge ${edge.id} with weight ${edge.weight}`,
    })

    if (find(edge.source) !== find(edge.target)) {
      // Add edge to MST
      mstEdges.add(edge.id)
      union(edge.source, edge.target)

      // Update visualization
      const vertexStatuses = new Map<string, NodeStatus>()
      const updatedEdgeStatuses = new Map<string, EdgeStatus>()

      // Mark all vertices in the same component
      for (const vertex of graph.vertices.values()) {
        if (find(vertex.id) === find(edge.source)) {
          vertexStatuses.set(vertex.id, "visited")
        }
      }

      // Mark all MST edges
      for (const id of mstEdges) {
        updatedEdgeStatuses.set(id, id === edge.id ? "active" : "path")
      }

      steps.push({
        vertices: vertexStatuses,
        edges: updatedEdgeStatuses,
        description: `Added edge ${edge.id} to MST`,
      })
    } else {
      // Edge would create a cycle
      edgeStatuses.set(edge.id, "discarded")

      steps.push({
        vertices: new Map(),
        edges: edgeStatuses,
        description: `Edge ${edge.id} would create a cycle, skipping`,
      })
    }
  }

  // Final state
  const finalVertexStatuses = new Map<string, NodeStatus>()
  const finalEdgeStatuses = new Map<string, EdgeStatus>()

  for (const vertex of graph.vertices.values()) {
    finalVertexStatuses.set(vertex.id, "visited")
  }

  for (const id of mstEdges) {
    finalEdgeStatuses.set(id, "path")
  }

  steps.push({
    vertices: finalVertexStatuses,
    edges: finalEdgeStatuses,
    description: "Minimum Spanning Tree completed",
  })

  return steps
}

// Topological Sort
export function runTopologicalSort(graph: Graph): AlgorithmStep[] {
  resetGraphStatus(graph)
  const steps: AlgorithmStep[] = []

  // Check if graph is directed
  if (!graph.isDirected) {
    steps.push({
      vertices: new Map(),
      edges: new Map(),
      description: "Topological sort requires a directed graph",
    })
    return steps
  }

  // Initialize
  const visited = new Set<string>()
  const temp = new Set<string>()
  const order: string[] = []
  let hasCycle = false

  steps.push({
    vertices: new Map(),
    edges: new Map(),
    description: "Starting topological sort",
  })

  function visit(vertexId: string) {
    if (temp.has(vertexId)) {
      // Cycle detected
      hasCycle = true
      return
    }

    if (visited.has(vertexId)) {
      return
    }

    temp.add(vertexId)

    // Mark current vertex as being processed
    const vertexStatuses = new Map<string, NodeStatus>()
    vertexStatuses.set(vertexId, "active")

    // Mark visited and temporary vertices
    for (const id of visited) {
      vertexStatuses.set(id, "visited")
    }

    for (const id of temp) {
      if (id !== vertexId) {
        vertexStatuses.set(id, "path")
      }
    }

    steps.push({
      vertices: vertexStatuses,
      edges: new Map(),
      description: `Processing vertex ${vertexId}`,
    })

    // Visit all neighbors
    for (const edge of graph.edges.values()) {
      if (edge.source === vertexId) {
        const neighborId = edge.target

        // Mark edge as active
        const edgeStatuses = new Map<string, EdgeStatus>()
        edgeStatuses.set(edge.id, "active")

        steps.push({
          vertices: vertexStatuses,
          edges: edgeStatuses,
          description: `Checking edge from ${vertexId} to ${neighborId}`,
        })

        visit(neighborId)

        if (hasCycle) {
          return
        }
      }
    }

    // Mark as visited and add to order
    temp.delete(vertexId)
    visited.add(vertexId)
    order.unshift(vertexId)

    // Update visualization
    const updatedVertexStatuses = new Map<string, NodeStatus>()

    for (const id of visited) {
      updatedVertexStatuses.set(id, "visited")
    }

    for (const id of temp) {
      updatedVertexStatuses.set(id, "path")
    }

    steps.push({
      vertices: updatedVertexStatuses,
      edges: new Map(),
      description: `Finished processing vertex ${vertexId}, added to order`,
    })
  }

  // Visit all vertices
  for (const vertex of graph.vertices.values()) {
    if (!visited.has(vertex.id) && !hasCycle) {
      visit(vertex.id)
    }
  }

  if (hasCycle) {
    steps.push({
      vertices: new Map(),
      edges: new Map(),
      description: "Cycle detected, topological sort not possible",
    })
  } else {
    // Final state
    const finalVertexStatuses = new Map<string, NodeStatus>()

    // Show the order
    for (let i = 0; i < order.length; i++) {
      finalVertexStatuses.set(order[i], "visited")
    }

    steps.push({
      vertices: finalVertexStatuses,
      edges: new Map(),
      description: `Topological sort completed: ${order.join(" → ")}`,
    })
  }

  return steps
}


