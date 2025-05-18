import type { NodeStatus, EdgeStatus } from "./algorithm-types"

// Graph vertex representation
export interface Vertex {
  id: string
  x: number
  y: number
  label: string
  status: NodeStatus
}

// Graph edge representation
export interface Edge {
  id: string
  source: string
  target: string
  weight: number
  status: EdgeStatus
}

// Graph data structure
export interface Graph {
  vertices: Map<string, Vertex>
  edges: Map<string, Edge>
  isDirected: boolean
  isWeighted: boolean
}

// Create a new empty graph
export function createGraph(isDirected: boolean, isWeighted: boolean): Graph {
  return {
    vertices: new Map<string, Vertex>(),
    edges: new Map<string, Edge>(),
    isDirected,
    isWeighted,
  }
}

// Add a vertex to the graph
export function addVertex(graph: Graph, x: number, y: number): string {
  const id = `v${graph.vertices.size}`
  const vertex: Vertex = {
    id,
    x,
    y,
    label: id,
    status: "default",
  }
  graph.vertices.set(id, vertex)
  return id
}

// Add an edge to the graph
export function addEdge(graph: Graph, sourceId: string, targetId: string, weight = 1): string {
  const id = `e${sourceId}-${targetId}`

  // Check if edge already exists
  if (graph.edges.has(id)) {
    return id
  }

  const edge: Edge = {
    id,
    source: sourceId,
    target: targetId,
    weight: graph.isWeighted ? weight : 1,
    status: "default",
  }

  graph.edges.set(id, edge)

  // For undirected graphs, add the reverse edge
  if (!graph.isDirected && sourceId !== targetId) {
    const reverseId = `e${targetId}-${sourceId}`
    const reverseEdge: Edge = {
      id: reverseId,
      source: targetId,
      target: sourceId,
      weight: graph.isWeighted ? weight : 1,
      status: "default",
    }
    graph.edges.set(reverseId, reverseEdge)
  }

  return id
}

// Remove a vertex from the graph
export function removeVertex(graph: Graph, vertexId: string): void {
  // Remove all edges connected to this vertex
  for (const [edgeId, edge] of graph.edges.entries()) {
    if (edge.source === vertexId || edge.target === vertexId) {
      graph.edges.delete(edgeId)
    }
  }

  // Remove the vertex
  graph.vertices.delete(vertexId)
}

// Remove an edge from the graph
export function removeEdge(graph: Graph, edgeId: string): void {
  const edge = graph.edges.get(edgeId)
  if (!edge) return

  graph.edges.delete(edgeId)

  // For undirected graphs, remove the reverse edge
  if (!graph.isDirected) {
    const reverseId = `e${edge.target}-${edge.source}`
    graph.edges.delete(reverseId)
  }
}

// Get all neighbors of a vertex
export function getNeighbors(graph: Graph, vertexId: string): Vertex[] {
  const neighbors: Vertex[] = []

  for (const edge of graph.edges.values()) {
    if (edge.source === vertexId) {
      const neighbor = graph.vertices.get(edge.target)
      if (neighbor) {
        neighbors.push(neighbor)
      }
    }
  }

  return neighbors
}

// Get all edges connected to a vertex
export function getConnectedEdges(graph: Graph, vertexId: string): Edge[] {
  const edges: Edge[] = []

  for (const edge of graph.edges.values()) {
    if (edge.source === vertexId || edge.target === vertexId) {
      edges.push(edge)
    }
  }

  return edges
}

// Reset all vertex and edge statuses
export function resetGraphStatus(graph: Graph): void {
  for (const vertex of graph.vertices.values()) {
    vertex.status = "default"
  }

  for (const edge of graph.edges.values()) {
    edge.status = "default"
  }
}

// Check if two vertices are connected
export function areConnected(graph: Graph, sourceId: string, targetId: string): boolean {
  const edgeId = `e${sourceId}-${targetId}`
  return graph.edges.has(edgeId)
}

// Get the edge between two vertices if it exists
export function getEdge(graph: Graph, sourceId: string, targetId: string): Edge | undefined {
  const edgeId = `e${sourceId}-${targetId}`
  return graph.edges.get(edgeId)
}

// Calculate the distance between two points
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// Check if a point is near a vertex
export function isNearVertex(x: number, y: number, vertex: Vertex, threshold = 20): boolean {
  return distance(x, y, vertex.x, vertex.y) <= threshold
}

// Find the nearest vertex to a point
export function findNearestVertex(graph: Graph, x: number, y: number, threshold = 20): Vertex | null {
  let nearest: Vertex | null = null
  let minDistance = threshold

  for (const vertex of graph.vertices.values()) {
    const dist = distance(x, y, vertex.x, vertex.y)
    if (dist < minDistance) {
      minDistance = dist
      nearest = vertex
    }
  }

  return nearest
}

// Generate a unique ID for a new vertex
export function generateVertexId(graph: Graph): string {
  return `v${graph.vertices.size}`
}

// Generate a unique ID for a new edge
export function generateEdgeId(sourceId: string, targetId: string): string {
  return `e${sourceId}-${targetId}`
}
