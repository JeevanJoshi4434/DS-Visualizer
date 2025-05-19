import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Data Structure Visualizer',
  description: 'For more https://github.com/jeevanjoshi4434',
  keywords: ['data structure', 'visualizer', 'algorithm', 'jeevan joshi', 'jeevanjoshi4434', 'Github', 'Graph', 'Tree', 'Linked List'],
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
