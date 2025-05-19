import { type LinkedList, type ListNode } from "./linkedlist-utils"
import type { NodeStatus } from "./algorithm-types"

// Algorithm step for visualization
export interface ListAlgorithmStep {
  nodes: Map<string, NodeStatus>
  description: string
  currentPointer: string | null
  values: number[]
}

// Traverse a linked list
export function runTraversal(list: LinkedList): ListAlgorithmStep[] {
  const steps: ListAlgorithmStep[] = []
  const values: number[] = []
  
  steps.push({
    nodes: new Map(),
    description: "Starting list traversal",
    currentPointer: null,
    values: []
  })
  
  if (!list.head) {
    steps.push({
      nodes: new Map(),
      description: "List is empty",
      currentPointer: null,
      values: []
    })
    return steps
  }
  
  let current: string | null = list.head
  
  while (current) {
    const node = list.nodes.get(current)
    if (!node) break
    
    values.push(node.value)
    
    const nodeStatuses = new Map<string, NodeStatus>()
    nodeStatuses.set(current, "active")
    
    steps.push({
      nodes: nodeStatuses,
      description: `Visiting node ${current} with value ${node.value}`,
      currentPointer: current,
      values: [...values]
    })
    
    // Mark previous nodes as visited
    if (node.next) {
      const updatedStatuses = new Map<string, NodeStatus>()
      updatedStatuses.set(current, "visited")
      
      steps.push({
        nodes: updatedStatuses,
        description: `Moving to next node`,
        currentPointer: current,
        values: [...values]
      })
    }
    
    current = node.next
  }
  
  // Final step
  const finalStatuses = new Map<string, NodeStatus>()
  for (const [id] of list.nodes) {
    finalStatuses.set(id, "visited")
  }
  
  steps.push({
    nodes: finalStatuses,
    description: "Traversal complete",
    currentPointer: null,
    values
  })
  
  return steps
}

// Search for a value in the linked list
export function runSearch(list: LinkedList, searchValue: number): ListAlgorithmStep[] {
  const steps: ListAlgorithmStep[] = []
  
  steps.push({
    nodes: new Map(),
    description: `Starting search for value ${searchValue}`,
    currentPointer: null,
    values: []
  })
  
  if (!list.head) {
    steps.push({
      nodes: new Map(),
      description: "List is empty",
      currentPointer: null,
      values: []
    })
    return steps
  }
  
  let current = list.head || null
  let found = false
  
  while (current) {
    const node = list.nodes.get(current)
    if (!node) break
    
    const nodeStatuses = new Map<string, NodeStatus>()
    nodeStatuses.set(current, "active")
    
    steps.push({
      nodes: nodeStatuses,
      description: `Checking node ${current} with value ${node.value}`,
      currentPointer: current,
      values: []
    })
    
    if (node.value === searchValue) {
      found = true
      
      const foundNodeStatuses = new Map<string, NodeStatus>()
      foundNodeStatuses.set(current, "path")
      
      steps.push({
        nodes: foundNodeStatuses,
        description: `Found value ${searchValue} at node ${current}!`,
        currentPointer: current,
        values: []
      })
      
      break
    }
    
    const updatedStatuses = new Map<string, NodeStatus>()
    updatedStatuses.set(current, "visited")
    
    steps.push({
      nodes: updatedStatuses,
      description: `Value ${searchValue} not found at this node, moving to next`,
      currentPointer: current,
      values: []
    })
    
    current = node.next
  }
  
  if (!found) {
    steps.push({
      nodes: new Map(),
      description: `Value ${searchValue} not found in the list`,
      currentPointer: null,
      values: []
    })
  }
  
  return steps
}

// Reverse a linked list
export function runReverse(list: LinkedList): ListAlgorithmStep[] {
  const steps: ListAlgorithmStep[] = []
  
  steps.push({
    nodes: new Map(),
    description: "Starting list reversal",
    currentPointer: null,
    values: []
  })
  
  if (!list.head) {
    steps.push({
      nodes: new Map(),
      description: "List is empty",
      currentPointer: null,
      values: []
    })
    return steps
  }
  
  let prev: string | null = null
  let current: string | null = list.head
  let next: string | null = null
  
  while (current) {
    const node = list.nodes.get(current)
    if (!node) break
    
    next = node.next
    
    const nodeStatuses = new Map<string, NodeStatus>()
    nodeStatuses.set(current, "active")
    if (prev) nodeStatuses.set(prev, "visited")
    if (next) nodeStatuses.set(next, "default")
    
    steps.push({
      nodes: nodeStatuses,
      description: `Current: ${current}, Previous: ${prev || "null"}, Next: ${next || "null"}`,
      currentPointer: current,
      values: []
    })
    
    // Reverse the pointer
    const reverseStatuses = new Map<string, NodeStatus>()
    reverseStatuses.set(current, "path")
    if (prev) reverseStatuses.set(prev, "path")
    
    steps.push({
      nodes: reverseStatuses,
      description: `Reversing pointer: ${current} now points to ${prev || "null"}`,
      currentPointer: current,
      values: []
    })
    
    prev = current
    current = next
  }
  
  // Final step
  const finalStatuses = new Map<string, NodeStatus>()
  for (const [id] of list.nodes) {
    finalStatuses.set(id, "path")
  }
  
  steps.push({
    nodes: finalStatuses,
    description: "Reversal complete, new head is " + prev,
    currentPointer: prev,
    values: []
  })
  
  return steps
}

// Detect cycle in a linked list using Floyd's Tortoise and Hare algorithm
export function runDetectCycle(list: LinkedList): ListAlgorithmStep[] {
  const steps: ListAlgorithmStep[] = []
  
  steps.push({
    nodes: new Map(),
    description: "Starting cycle detection using Floyd's Tortoise and Hare algorithm",
    currentPointer: null,
    values: []
  })
  
  if (!list.head) {
    steps.push({
      nodes: new Map(),
      description: "List is empty",
      currentPointer: null,
      values: []
    })
    return steps
  }
  
  let slow: string | null = list.head
  let fast: string | null = list.head
  let cycleFound = false
  
  do {
    const slowNode = list.nodes.get(slow!)
    const fastNode = fast ? list.nodes.get(fast) : null
    
    if (!slowNode || !fastNode) break
    
    const nodeStatuses = new Map<string, NodeStatus>()
    nodeStatuses.set(slow!, "active") // Tortoise
    nodeStatuses.set(fast, slow === fast ? "active" : "end") // Hare
    
    steps.push({
      nodes: nodeStatuses,
      description: `Tortoise at ${slow}, Hare at ${fast}`,
      currentPointer: slow,
      values: []
    })
    
    // Move slow pointer one step
    slow = slowNode.next
    
    // Move fast pointer two steps
    if (fastNode.next) {
      const nextNode = list.nodes.get(fastNode.next)
      fast = nextNode?.next || null
    } else {
      fast = null
    }
    
    // Check if fast pointer reached the end
    if (!fast) {
      steps.push({
        nodes: new Map(),
        description: "Hare reached the end, no cycle found",
        currentPointer: null,
        values: []
      })
      break
    }
    
    // Check if slow and fast pointers meet
    if (slow === fast) {
      cycleFound = true
      
      const cycleStatuses = new Map<string, NodeStatus>()
      cycleStatuses.set(slow!, "end")
      
      steps.push({
        nodes: cycleStatuses,
        description: `Cycle detected! Tortoise and Hare meet at ${slow}`,
        currentPointer: slow,
        values: []
      })
      break
    }
    
  } while (slow && fast)
  
  // Final step
  if (!cycleFound) {
    steps.push({
      nodes: new Map(),
      description: "No cycle found in the list",
      currentPointer: null,
      values: []
    })
  }
  
  return steps
}



