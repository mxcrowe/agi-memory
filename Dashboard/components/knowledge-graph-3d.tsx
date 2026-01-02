"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import type { KnowledgeGraph } from "@/lib/types"

interface KnowledgeGraph3DProps {
  graph: KnowledgeGraph
}

export function KnowledgeGraph3D({ graph }: KnowledgeGraph3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple 2D force-directed graph simulation
    const width = canvas.width
    const height = canvas.height

    const nodes = graph.nodes.map((node) => ({
      ...node,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
    }))

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, width, height)

      // Apply forces
      nodes.forEach((node, i) => {
        // Repulsion between nodes
        nodes.forEach((other, j) => {
          if (i === j) return
          const dx = other.x - node.x
          const dy = other.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = -500 / (dist * dist)
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        })

        // Attraction along edges
        graph.edges.forEach((edge) => {
          if (edge.source === node.id) {
            const target = nodes.find((n) => n.id === edge.target)
            if (target) {
              const dx = target.x - node.x
              const dy = target.y - node.y
              const dist = Math.sqrt(dx * dx + dy * dy) || 1
              const force = (dist - 100) * 0.01 * edge.strength
              node.vx += (dx / dist) * force
              node.vy += (dy / dist) * force
            }
          }
        })

        // Center gravity
        node.vx += (width / 2 - node.x) * 0.001
        node.vy += (height / 2 - node.y) * 0.001

        // Damping
        node.vx *= 0.9
        node.vy *= 0.9

        // Update position
        node.x += node.vx
        node.y += node.vy

        // Boundaries
        node.x = Math.max(20, Math.min(width - 20, node.x))
        node.y = Math.max(20, Math.min(height - 20, node.y))
      })

      // Draw edges
      graph.edges.forEach((edge) => {
        const source = nodes.find((n) => n.id === edge.source)
        const target = nodes.find((n) => n.id === edge.target)
        if (source && target) {
          ctx.strokeStyle = `rgba(100, 150, 200, ${edge.strength * 0.5})`
          ctx.lineWidth = edge.strength * 2
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.stroke()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        const colors = {
          entity: "#a78bfa",
          concept: "#22d3ee",
          memory: "#4ade80",
        }
        ctx.fillStyle = colors[node.type] || "#888"
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fill()

        // Label
        ctx.fillStyle = "#fff"
        ctx.font = "10px monospace"
        ctx.textAlign = "center"
        ctx.fillText(node.label, node.x, node.y + node.size + 12)
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [graph])

  return (
    <Card className="p-4 bg-background/50 border-border/50">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Knowledge Graph Visualizer</h3>
      <canvas ref={canvasRef} width={800} height={500} className="w-full h-auto rounded-lg bg-black/50" />
      <div className="mt-3 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-400" />
          <span className="text-muted-foreground">Entities</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400" />
          <span className="text-muted-foreground">Concepts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground">Memories</span>
        </div>
      </div>
    </Card>
  )
}
