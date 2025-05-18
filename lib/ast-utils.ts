// Helper functions for AST visualization

export function getNodeColor(type: string): string {
  // Color mapping for different node types
  const colorMap: Record<string, string> = {
    Program: "#3b82f6", // blue
    FunctionDeclaration: "#10b981", // green
    Identifier: "#f59e0b", // amber
    BlockStatement: "#8b5cf6", // purple
    ReturnStatement: "#ef4444", // red
    BinaryExpression: "#ec4899", // pink
    Literal: "#6366f1", // indigo
    VariableDeclaration: "#0ea5e9", // sky
    ExpressionStatement: "#14b8a6", // teal
    CallExpression: "#f97316", // orange
    MemberExpression: "#84cc16", // lime
    ArrowFunctionExpression: "#06b6d4", // cyan
  }

  return colorMap[type] || "#6b7280" // gray default
}

export function getNodeLabel(node: any): string {
  switch (node.type) {
    case "Identifier":
      return `${node.type}: ${node.name}`
    case "Literal":
      return `${node.type}: ${node.value}`
    case "BinaryExpression":
      return `${node.type}: ${node.operator}`
    default:
      return node.type
  }
}

export function getNodeDetails(node: any): Record<string, string> {
  const details: Record<string, string> = {}

  for (const key in node) {
    if (key === "type" || key === "loc" || key === "start" || key === "end") continue

    const value = node[key]

    if (value !== null && value !== undefined) {
      if (typeof value === "object") {
        if ("type" in value) {
          details[key] = `<${value.type}>`
        } else if (Array.isArray(value)) {
          details[key] = `Array[${value.length}]`
        } else {
          details[key] = "{...}"
        }
      } else {
        details[key] = String(value)
      }
    }
  }

  return details
}
