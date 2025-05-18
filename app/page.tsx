"use client"

import { useState, useEffect } from "react"
import ASTVisualizer from "@/components/ast-visualizer"
import CodeEditor from "@/components/code-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipForward, SkipBack, ZoomIn, ZoomOut, RefreshCw, Maximize, Minimize } from "lucide-react"
import GraphPage from "./graph/page"

export default function Home() {
  const [code, setCode] = useState("function example(x) {\n  return x * 2;\n}")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && currentStep < totalSteps - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000 / speed)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentStep, totalSteps, speed])

  const handlePlay = () => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleStepForward = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleFullscreen = () => {
    const visualizerContainer = document.getElementById("ast-visualizer-container")

    if (!document.fullscreenElement) {
      if (visualizerContainer?.requestFullscreen) {
        visualizerContainer
          .requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch((err) => console.error(`Error attempting to enable fullscreen: ${err.message}`))
      }
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch((err) => console.error(`Error attempting to exit fullscreen: ${err.message}`))
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return <GraphPage />;
  // return (
  //   <main className="container mx-auto p-4 min-h-screen">
  //     <Card className="mb-6">
  //       <CardHeader>
  //         <CardTitle>JavaScript AST Visualizer</CardTitle>
  //         <CardDescription>Visualize the Abstract Syntax Tree (AST) of JavaScript code step by step</CardDescription>
  //       </CardHeader>
  //     </Card>

  //     <div className="flex justify-center mt-4 mb-6">
  //       <Button asChild>
  //         <a href="/graph">Go to Graph & Tree Algorithm Visualizer</a>
  //       </Button>
  //     </div>

  //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  //       <Card className="lg:col-span-1">
  //         <CardHeader>
  //           <CardTitle>Code Input</CardTitle>
  //           <CardDescription>Enter JavaScript code to visualize</CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <CodeEditor
  //             code={code}
  //             onChange={setCode}
  //             onParse={(steps) => {
  //               setTotalSteps(steps)
  //               setCurrentStep(0)
  //               setIsPlaying(false)
  //             }}
  //           />
  //         </CardContent>
  //       </Card>

  //       <Card className="lg:col-span-2">
  //         <CardHeader>
  //           <div className="flex justify-between items-center">
  //             <div>
  //               <CardTitle>AST Visualization</CardTitle>
  //               <CardDescription>
  //                 Step {currentStep + 1} of {totalSteps}
  //               </CardDescription>
  //             </div>
  //             <Button variant="outline" size="icon" onClick={handleFullscreen}>
  //               {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
  //             </Button>
  //           </div>
  //         </CardHeader>
  //         <CardContent>
  //           <div
  //             id="ast-visualizer-container"
  //             className={`relative bg-muted rounded-md overflow-hidden ${isFullscreen ? "fullscreen-container" : ""}`}
  //           >
  //             <ASTVisualizer code={code} currentStep={currentStep} zoom={zoom} onTotalStepsChange={setTotalSteps} />

  //             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md">
  //               <Button variant="outline" size="icon" onClick={handleStepBack} disabled={currentStep <= 0}>
  //                 <SkipBack className="h-4 w-4" />
  //               </Button>
  //               <Button variant="outline" size="icon" onClick={handlePlay}>
  //                 {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
  //               </Button>
  //               <Button
  //                 variant="outline"
  //                 size="icon"
  //                 onClick={handleStepForward}
  //                 disabled={currentStep >= totalSteps - 1}
  //               >
  //                 <SkipForward className="h-4 w-4" />
  //               </Button>
  //               <Button variant="outline" size="icon" onClick={handleReset}>
  //                 <RefreshCw className="h-4 w-4" />
  //               </Button>
  //               <div className="w-32 px-2">
  //                 <Slider
  //                   value={[currentStep]}
  //                   max={totalSteps - 1}
  //                   step={1}
  //                   onValueChange={(value) => setCurrentStep(value[0])}
  //                 />
  //               </div>
  //               <Button variant="outline" size="icon" onClick={handleZoomOut}>
  //                 <ZoomOut className="h-4 w-4" />
  //               </Button>
  //               <Button variant="outline" size="icon" onClick={handleZoomIn}>
  //                 <ZoomIn className="h-4 w-4" />
  //               </Button>
  //               <div className="w-24 px-2">
  //                 <Slider value={[speed]} min={0.5} max={3} step={0.5} onValueChange={(value) => setSpeed(value[0])} />
  //               </div>
  //             </div>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>

  //     <Tabs defaultValue="ast" className="mt-6">
  //       <TabsList>
  //         <TabsTrigger value="ast">AST Structure</TabsTrigger>
  //         <TabsTrigger value="help">Help</TabsTrigger>
  //       </TabsList>
  //       <TabsContent value="ast" className="p-4 bg-muted rounded-md">
  //         <pre className="text-xs overflow-auto max-h-96">
  //           <code id="ast-output" className="whitespace-pre-wrap"></code>
  //         </pre>
  //       </TabsContent>
  //       <TabsContent value="help" className="p-4 bg-muted rounded-md">
  //         <div className="prose dark:prose-invert">
  //           <h3>How to use the AST Visualizer</h3>
  //           <ul>
  //             <li>
  //               <strong>Enter JavaScript code</strong> in the editor on the left
  //             </li>
  //             <li>
  //               <strong>Play/Pause</strong> to start or stop the automatic visualization
  //             </li>
  //             <li>
  //               <strong>Step Forward/Back</strong> to navigate through the AST nodes manually
  //             </li>
  //             <li>
  //               <strong>Zoom In/Out</strong> to adjust the visualization size
  //             </li>
  //             <li>
  //               <strong>Speed</strong> slider to control the animation speed
  //             </li>
  //           </ul>
  //           <h3>About Abstract Syntax Trees</h3>
  //           <p>
  //             An Abstract Syntax Tree (AST) is a tree representation of the abstract syntactic structure of source code.
  //             Each node of the tree denotes a construct occurring in the source code.
  //           </p>
  //         </div>
  //       </TabsContent>
  //     </Tabs>
  //     <style jsx global>{`
  //       .fullscreen-container {
  //         position: fixed !important;
  //         top: 0;
  //         left: 0;
  //         width: 100vw !important;
  //         height: 100vh !important;
  //         z-index: 9999;
  //         background-color: white;
  //         display: flex;
  //         flex-direction: column;
  //         justify-content: center;
  //       }
        
  //       .fullscreen-container canvas {
  //         height: 100% !important;
  //       }
        
  //       :fullscreen {
  //         background-color: white;
  //       }
  //     `}</style>
  //   </main>
  // )
}
