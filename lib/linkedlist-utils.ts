// Linked list types and utilities

export interface ListNode {
  id: string
  value: number
  next: string | null
  prev: string | null
  x: number
  y: number
  width: number
  height: number
}

export interface LinkedList {
  type: "singly" | "doubly"
  head: string | null
  nodes: Map<string, ListNode>
}

// Create an empty linked list
export function createLinkedList(type: "singly" | "doubly"): LinkedList {
  return {
    type,
    head: null,
    nodes: new Map()
  }
}

// Create a sample linked list for testing
export function createSampleLinkedList(type: "singly" | "doubly"): LinkedList {
  const list: LinkedList = {
    type,
    head: "node1",
    nodes: new Map()
  }
  
  // Create nodes
  const node1: ListNode = {
    id: "node1",
    value: 10,
    next: "node2",
    prev: null,
    x: 100,
    y: 200,
    width: 100,
    height: 50
  }
  
  const node2: ListNode = {
    id: "node2",
    value: 20,
    next: "node3",
    prev: type === "doubly" ? "node1" : null,
    x: 250,
    y: 200,
    width: 100,
    height: 50
  }
  
  const node3: ListNode = {
    id: "node3",
    value: 30,
    next: "node4",
    prev: type === "doubly" ? "node2" : null,
    x: 400,
    y: 200,
    width: 100,
    height: 50
  }
  
  const node4: ListNode = {
    id: "node4",
    value: 40,
    next: null,
    prev: type === "doubly" ? "node3" : null,
    x: 550,
    y: 200,
    width: 100,
    height: 50
  }
  
  // Add nodes to the list
  list.nodes.set("node1", node1)
  list.nodes.set("node2", node2)
  list.nodes.set("node3", node3)
  list.nodes.set("node4", node4)
  
  return list
}

// Check if the list has a cycle
export function hasCycle(list: LinkedList): boolean {
  if (!list.head) return false
  
  const visited = new Set<string>()
  let current = list.head
  
  while (current) {
    if (visited.has(current)) {
      return true
    }
    
    visited.add(current)
    const node = list.nodes.get(current)
    if (!node || !node.next) break
    
    current = node.next
  }
  
  return false
}

