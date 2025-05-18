// Graph algorithm types
export type GraphAlgorithm =
  | "bfs" // Breadth-First Search
  | "dfs" // Depth-First Search
  | "dijkstra" // Dijkstra's Shortest Path
  | "prim" // Prim's Minimum Spanning Tree
  | "kruskal" // Kruskal's Minimum Spanning Tree
  | "topological" // Topological Sort

// Tree algorithm types
export type TreeAlgorithm =
  | "inorder" // In-order traversal
  | "preorder" // Pre-order traversal
  | "postorder" // Post-order traversal
  | "levelorder" // Level-order traversal

// Node status for visualization
export type NodeStatus =
  | "default" // Default state
  | "active" // Currently being processed
  | "visited" // Already processed
  | "path" // Part of the final path
  | "start" // Start node
  | "end" // End node 
// Edge status for visualization
export type EdgeStatus =
  | "default" // Default state
  | "active" // Currently being processed
  | "visited" // Already processed
  | "path" // Part of the final path
  | "discarded" // Not part of the solution
