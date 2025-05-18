import type { NodeStatus } from "./algorithm-types"

// Tree node representation
export interface TreeNode {
  id: string
  value: number
  left: TreeNode | null
  right: TreeNode | null
  x: number
  y: number
  status: NodeStatus
}

// Create a new tree node
export function createTreeNode(value: number, id: string): TreeNode {
  return {
    id,
    value,
    left: null,
    right: null,
    x: 0,
    y: 0,
    status: "default",
  }
}

// Insert a value into a binary search tree
export function insertNode(root: TreeNode | null, value: number): TreeNode {
  if (root === null) {
    return createTreeNode(value, `n0`)
  }

  if (value < root.value) {
    root.left = insertNode(root.left, value)
  } else if (value > root.value) {
    root.right = insertNode(root.right, value)
  }

  return root
}

// Delete a node from a binary search tree
export function deleteNode(root: TreeNode | null, value: number): TreeNode | null {
  if (root === null) {
    return null
  }

  if (value < root.value) {
    root.left = deleteNode(root.left, value)
  } else if (value > root.value) {
    root.right = deleteNode(root.right, value)
  } else {
    // Node with only one child or no child
    if (root.left === null) {
      return root.right
    } else if (root.right === null) {
      return root.left
    }

    // Node with two children
    // Get the inorder successor (smallest in the right subtree)
    root.value = minValue(root.right)

    // Delete the inorder successor
    root.right = deleteNode(root.right, root.value)
  }

  return root
}

// Find the minimum value in a BST
function minValue(root: TreeNode): number {
  let minv = root.value
  while (root.left !== null) {
    minv = root.left.value
    root = root.left
  }
  return minv
}

// Calculate positions for tree visualization
export function calculateTreePositions(root: TreeNode | null, width: number, height: number): void {
  if (root === null) return

  const nodeWidth = 40
  const nodeHeight = 40
  const levelHeight = 80

  // Calculate the maximum depth of the tree
  function getMaxDepth(node: TreeNode | null, depth = 0): number {
    if (node === null) return depth
    return Math.max(getMaxDepth(node.left, depth + 1), getMaxDepth(node.right, depth + 1))
  }

  const maxDepth = getMaxDepth(root)

  // Calculate positions
  function calculatePosition(
    node: TreeNode,
    x: number,
    y: number,
    level: number,
    leftBound: number,
    rightBound: number,
  ): void {
    node.x = x
    node.y = y

    if (node.left !== null) {
      const nextX = (x + leftBound) / 2
      calculatePosition(node.left, nextX, y + levelHeight, level + 1, leftBound, x)
    }

    if (node.right !== null) {
      const nextX = (x + rightBound) / 2
      calculatePosition(node.right, nextX, y + levelHeight, level + 1, x, rightBound)
    }
  }

  calculatePosition(root, width / 2, 50, 0, 0, width)
}

// Reset all node statuses
export function resetTreeStatus(root: TreeNode | null): void {
  if (root === null) return

  root.status = "default"
  resetTreeStatus(root.left)
  resetTreeStatus(root.right)
}

// Assign unique IDs to all nodes
export function assignNodeIds(root: TreeNode | null, idPrefix = "n", counter: { value: number } = { value: 0 }): void {
  if (root === null) return

  root.id = `${idPrefix}${counter.value++}`
  assignNodeIds(root.left, idPrefix, counter)
  assignNodeIds(root.right, idPrefix, counter)
}

// Create a sample binary search tree
export function createSampleBST(): TreeNode {
  const values = [50, 30, 70, 20, 40, 60, 80]
  let root: TreeNode | null = null

  for (const value of values) {
    if (root === null) {
      root = createTreeNode(value, "n0")
    } else {
      insertNode(root, value)
    }
  }

  // Reassign IDs to ensure they're sequential
  assignNodeIds(root)

  return root!
}

// Build a tree from level-order traversal array
export function buildTreeFromLevelOrder(values: (number | null)[]): TreeNode | null {
  if (values.length === 0 || values[0] === null) return null

  const root = createTreeNode(values[0] as number, "n0")
  const queue: (TreeNode | null)[] = [root]
  let i = 1

  while (i < values.length) {
    const current = queue.shift()

    if (current === null) {
      // Skip null nodes but still consume their children positions
      i += 2
      continue
    }

    // Add left child
    if (i < values.length) {
      if (values[i] !== null) {
        current.left = createTreeNode(values[i] as number, `n${i}`)
        queue.push(current.left)
      } else {
        queue.push(null)
      }
    }
    i++

    // Add right child
    if (i < values.length) {
      if (values[i] !== null) {
        current.right = createTreeNode(values[i] as number, `n${i}`)
        queue.push(current.right)
      } else {
        queue.push(null)
      }
    }
    i++
  }

  // Reassign IDs to ensure they're sequential
  assignNodeIds(root)

  return root
}
