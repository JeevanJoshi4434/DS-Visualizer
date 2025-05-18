// Tree types and operations for different tree structures

import type { TreeNode } from "./tree-utils"
import { assignNodeIds } from "./tree-utils"

// AVL Tree Node
export interface AVLNode extends TreeNode {
  height: number
}

// Red-Black Tree Node
export interface RBNode extends TreeNode {
  color: "red" | "black"
}

// Create a new AVL tree node
export function createAVLNode(value: number, id: string): AVLNode {
  return {
    id,
    value,
    left: null,
    right: null,
    x: 0,
    y: 0,
    status: "default",
    height: 1,
  }
}

// Create a new Red-Black tree node
export function createRBNode(value: number, id: string): RBNode {
  return {
    id,
    value,
    left: null,
    right: null,
    x: 0,
    y: 0,
    status: "default",
    color: "red",
  }
}

// Get height of AVL node
function getHeight(node: AVLNode | null): number {
  if (node === null) return 0
  return node.height
}

// Get balance factor of AVL node
function getBalanceFactor(node: AVLNode | null): number {
  if (node === null) return 0
  return getHeight(node.left as AVLNode | null) - getHeight(node.right as AVLNode | null)
}

// Right rotate AVL subtree rooted with y
function rightRotate(y: AVLNode): AVLNode {
  const x = y.left as AVLNode
  const T2 = x.right

  // Perform rotation
  x.right = y
  y.left = T2

  // Update heights
  y.height = Math.max(getHeight(y.left as AVLNode | null), getHeight(y.right as AVLNode | null)) + 1
  x.height = Math.max(getHeight(x.left as AVLNode | null), getHeight(x.right as AVLNode | null)) + 1

  // Return new root
  return x
}

// Left rotate AVL subtree rooted with x
function leftRotate(x: AVLNode): AVLNode {
  const y = x.right as AVLNode
  const T2 = y.left

  // Perform rotation
  y.left = x
  x.right = T2

  // Update heights
  x.height = Math.max(getHeight(x.left as AVLNode | null), getHeight(x.right as AVLNode | null)) + 1
  y.height = Math.max(getHeight(y.left as AVLNode | null), getHeight(y.right as AVLNode | null)) + 1

  // Return new root
  return y
}

// Insert a node in AVL tree
export function insertAVL(node: AVLNode | null, value: number, idCounter = { value: 0 }): AVLNode {
  // Perform normal BST insertion
  if (node === null) {
    return createAVLNode(value, `n${idCounter.value++}`)
  }

  if (value < node.value) {
    node.left = insertAVL(node.left as AVLNode | null, value, idCounter)
  } else if (value > node.value) {
    node.right = insertAVL(node.right as AVLNode | null, value, idCounter)
  } else {
    // Duplicate values not allowed
    return node
  }

  // Update height of this ancestor node
  node.height = Math.max(getHeight(node.left as AVLNode | null), getHeight(node.right as AVLNode | null)) + 1

  // Get the balance factor to check if this node became unbalanced
  const balance = getBalanceFactor(node)

  // Left Left Case
  if (balance > 1 && value < (node.left as AVLNode).value) {
    return rightRotate(node)
  }

  // Right Right Case
  if (balance < -1 && value > (node.right as AVLNode).value) {
    return leftRotate(node)
  }

  // Left Right Case
  if (balance > 1 && value > (node.left as AVLNode).value) {
    node.left = leftRotate(node.left as AVLNode)
    return rightRotate(node)
  }

  // Right Left Case
  if (balance < -1 && value < (node.right as AVLNode).value) {
    node.right = rightRotate(node.right as AVLNode)
    return leftRotate(node)
  }

  // Return the unchanged node pointer
  return node
}

// Insert a node in Red-Black tree
export function insertRB(root: RBNode | null, value: number, idCounter = { value: 0 }): RBNode {
  // Simple BST insertion for now (full RB implementation would be more complex)
  if (root === null) {
    return createRBNode(value, `n${idCounter.value++}`)
  }

  if (value < root.value) {
    root.left = insertRB(root.left as RBNode | null, value, idCounter)
  } else if (value > root.value) {
    root.right = insertRB(root.right as RBNode | null, value, idCounter)
  }

  // Fix Red-Black tree properties (simplified)
  // In a real implementation, we would need to handle all cases and fix violations
  if (root.left && (root.left as RBNode).color === "red") {
    if (root.left.left && (root.left.left as RBNode).color === "red") {
      // Left-Left case
      if (root.right && (root.right as RBNode).color === "red") {
        // Color flip
        ;(root.left as RBNode).color = "black"
        ;(root.right as RBNode).color = "black"
        root.color = "red"
      } else {
        // Right rotate
        const newRoot = root.left as RBNode
        root.left = newRoot.right
        newRoot.right = root
        newRoot.color = root.color
        root.color = "red"
        return newRoot
      }
    }
  }

  return root
}

// Create a sample AVL tree
export function createSampleAVL(): AVLNode {
  let root: AVLNode | null = null
  const values = [50, 30, 70, 20, 40, 60, 80, 15, 25, 35, 45]

  for (const value of values) {
    if (root === null) {
      root = createAVLNode(value, "n0")
    } else {
      root = insertAVL(root, value)
    }
  }

  return root!
}

// Create a sample Red-Black tree
export function createSampleRB(): RBNode {
  let root: RBNode | null = null
  const values = [50, 30, 70, 20, 40, 60, 80]

  for (const value of values) {
    if (root === null) {
      root = createRBNode(value, "n0")
      root.color = "black" // Root is always black
    } else {
      root = insertRB(root, value)
      root.color = "black" // Ensure root is black
    }
  }

  return root!
}

// Build an AVL tree from level-order traversal array
export function buildAVLFromLevelOrder(values: (number | null)[]): AVLNode | null {
  if (values.length === 0) return null

  // Filter out null values for AVL tree
  const validValues = values.filter((v) => v !== null) as number[]

  // First create a regular binary tree
  let root: AVLNode | null = null

  // Then insert each value into the AVL tree to maintain balance
  for (const value of validValues) {
    if (root === null) {
      root = createAVLNode(value, "n0")
    } else {
      root = insertAVL(root, value)
    }
  }

  // Reassign IDs to ensure they're sequential
  assignNodeIds(root)

  return root
}

// Build a Red-Black tree from level-order traversal array
export function buildRBFromLevelOrder(values: (number | null)[]): RBNode | null {
  if (values.length === 0) return null

  // Filter out null values for RB tree
  const validValues = values.filter((v) => v !== null) as number[]

  let root: RBNode | null = null

  // Insert each value into the RB tree
  for (const value of validValues) {
    if (root === null) {
      root = createRBNode(value, "n0")
      root.color = "black" // Root is always black
    } else {
      root = insertRB(root, value)
      root.color = "black" // Ensure root is black
    }
  }

  // Reassign IDs to ensure they're sequential
  assignNodeIds(root)

  return root
}
