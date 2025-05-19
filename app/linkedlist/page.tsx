"use client"

import LinkedListVisualizer from "@/components/linkedlist-visualizer"

export default function LinkedListPage() {
  return (
    <main className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Linked List Algorithm Visualizer</h1>
      <p className="mb-6 text-muted-foreground">
        Visualize common linked list operations and algorithms step by step
      </p>
      
      <LinkedListVisualizer />
    </main>
  )
}