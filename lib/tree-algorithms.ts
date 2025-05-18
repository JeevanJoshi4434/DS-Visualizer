import { type TreeNode, resetTreeStatus } from "./tree-utils"
import type { NodeStatus } from "./algorithm-types"

// Algorithm step for visualization
export interface TreeAlgorithmStep {
  nodes: Map<string, NodeStatus>
  description: string
  values: number[]
}

// In-order traversal
export function runInOrderTraversal(root: TreeNode | null): TreeAlgorithmStep[] {
  resetTreeStatus(root)
  const steps: TreeAlgorithmStep[] = []
  const values: number[] = []

  steps.push({
    nodes: new Map(),
    description: "Starting in-order traversal",
    values: [],
  })

  function inOrder(node: TreeNode | null) {
    if (node === null) return

    // Visit left subtree
    if (node.left !== null) {
      steps.push({
        nodes: new Map([
          [node.id, "active"],
          [node.left.id, "active"],
        ]),
        description: `Moving to left child of ${node.value}`,
        values: [...values],
      })
    }

    inOrder(node.left)

    // Visit node
    values.push(node.value)

    steps.push({
      nodes: new Map([[node.id, "active"]]),
      description: `Visiting node ${node.value}`,
      values: [...values],
    })

    // Visit right subtree
    if (node.right !== null) {
      steps.push({
        nodes: new Map([
          [node.id, "active"],
          [node.right.id, "active"],
        ]),
        description: `Moving to right child of ${node.value}`,
        values: [...values],
      })
    }

    inOrder(node.right)
  }

  inOrder(root)

  steps.push({
    nodes: new Map(),
    description: `In-order traversal completed: [${values.join(", ")}]`,
    values: [...values],
  })

  return steps
}

// Pre-order traversal
export function runPreOrderTraversal(root: TreeNode | null): TreeAlgorithmStep[] {
  resetTreeStatus(root)
  const steps: TreeAlgorithmStep[] = []
  const values: number[] = []

  steps.push({
    nodes: new Map(),
    description: "Starting pre-order traversal",
    values: [],
  })

  function preOrder(node: TreeNode | null) {
    if (node === null) return

    // Visit node first
    values.push(node.value)

    steps.push({
      nodes: new Map([[node.id, "active"]]),
      description: `Visiting node ${node.value}`,
      values: [...values],
    })

    // Then visit left subtree
    if (node.left !== null) {
      steps.push({
        nodes: new Map([
          [node.id, "visited"],
          [node.left.id, "active"],
        ]),
        description: `Moving to left child of ${node.value}`,
        values: [...values],
      })
      preOrder(node.left)
    }

    // Then visit right subtree
    if (node.right !== null) {
      steps.push({
        nodes: new Map([
          [node.id, "visited"],
          [node.right.id, "active"],
        ]),
        description: `Moving to right child of ${node.value}`,
        values: [...values],
      })
      preOrder(node.right)
    }
  }

  preOrder(root)

  steps.push({
    nodes: new Map(),
    description: `Pre-order traversal completed: [${values.join(", ")}]`,
    values: [...values],
  })

  return steps
}

// Post-order traversal
export function runPostOrderTraversal(root: TreeNode | null): TreeAlgorithmStep[] {
  resetTreeStatus(root)
  const steps: TreeAlgorithmStep[] = []
  const values: number[] = []

  steps.push({
    nodes: new Map(),
    description: "Starting post-order traversal",
    values: [],
  })

  function postOrder(node: TreeNode | null) {
    if (node === null) return

    // Visit left subtree
    if (node.left !== null) {
      steps.push({
        nodes: new Map([
          [node.id, "active"],
          [node.left.id, "active"],
        ]),
        description: `Moving to left child of ${node.value}`,
        values: [...values],
      })
    }

    postOrder(node.left)

    // Visit right subtree
    if (node.right !== null) {
      steps.push({
        nodes: new Map([
          [node.id, "active"],
          [node.right.id, "active"],
        ]),
        description: `Moving to right child of ${node.value}`,
        values: [...values],
      })
    }

    postOrder(node.right)

    // Visit node
    values.push(node.value)

    steps.push({
      nodes: new Map([[node.id, "active"]]),
      description: `Visiting node ${node.value}`,
      values: [...values],
    })
  }

  postOrder(root)

  steps.push({
    nodes: new Map(),
    description: `Post-order traversal completed: [${values.join(", ")}]`,
    values: [...values],
  })

  return steps
}

// Level-order traversal
export function runLevelOrderTraversal(root: TreeNode | null): TreeAlgorithmStep[] {
  resetTreeStatus(root)
  const steps: TreeAlgorithmStep[] = []
  const values: number[] = []

  if (root === null) {
    steps.push({
      nodes: new Map(),
      description: "Tree is empty",
      values: [],
    })
    return steps
  }

  steps.push({
    nodes: new Map(),
    description: "Starting level-order traversal",
    values: [],
  })

  const queue: TreeNode[] = [root]

  while (queue.length > 0) {
    const node = queue.shift()!

    // Visit node
    values.push(node.value)

    steps.push({
      nodes: new Map([[node.id, "active"]]),
      description: `Visiting node ${node.value}`,
      values: [...values],
    })

    // Add left child to queue
    if (node.left !== null) {
      queue.push(node.left)

      steps.push({
        nodes: new Map([
          [node.id, "visited"],
          [node.left.id, "active"],
        ]),
        description: `Adding left child ${node.left.value} to queue`,
        values: [...values],
      })
    }

    // Add right child to queue
    if (node.right !== null) {
      queue.push(node.right)

      steps.push({
        nodes: new Map([
          [node.id, "visited"],
          [node.right.id, "active"],
        ]),
        description: `Adding right child ${node.right.value} to queue`,
        values: [...values],
      })
    }
  }

  steps.push({
    nodes: new Map(),
    description: `Level-order traversal completed: [${values.join(", ")}]`,
    values: [...values],
  })

  return steps
}
