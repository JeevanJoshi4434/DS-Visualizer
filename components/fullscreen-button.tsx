"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Maximize, Minimize } from "lucide-react"

interface FullscreenButtonProps {
  targetId: string
  className?: string
}

export default function FullscreenButton({ targetId, className = "" }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    const element = document.getElementById(targetId)
    if (!element) return

    if (!document.fullscreenElement) {
      element
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true)
          // Force resize event to ensure canvas resizes properly
          window.dispatchEvent(new Event('resize'))
        })
        .catch((err) => console.error(`Error attempting to enable fullscreen: ${err.message}`))
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false)
          // Force resize event to ensure canvas resizes properly
          window.dispatchEvent(new Event('resize'))
        })
        .catch((err) => console.error(`Error attempting to exit fullscreen: ${err.message}`))
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement.id === targetId)
      
      // Force resize event to ensure canvas resizes properly
      window.dispatchEvent(new Event('resize'))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [targetId])

  return (
    <Button variant="outline" size="icon" className={className} onClick={toggleFullscreen}>
      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
    </Button>
  )
}

