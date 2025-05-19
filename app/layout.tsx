import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Data Structure Visualizer',
  description:
    'A powerful and interactive tool for visualizing data structures and algorithms, including graphs, trees, and linked lists. Perfect for students, educators, and developers to understand complex concepts visually. Open-source on GitHub by Jeevan Joshi.',
  keywords: [
    'data structure',
    'algorithm',
    'visualizer',
    'graph',
    'tree',
    'linked list',
    'sorting',
    'DFS',
    'BFS',
    'jeevan joshi',
    'github',
    'JeevanJoshi4434'
  ],
  icons: {
    icon: '/favicon.ico',      
    shortcut: '/favicon.ico', 
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
