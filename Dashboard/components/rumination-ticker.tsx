"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, Layers, ArrowUpRight } from "lucide-react"
import type { RuminationEntry } from "@/lib/types"

interface MaintenanceState {
  lastMaintenanceAt: Date | null
  isPaused: boolean
  intervalSeconds: number
  workingMemoryCount: number
  longTermCount: number
  semanticCount: number
  // Latest run stats
  neighborhoodsRecomputed?: number
  cacheDeleted?: number
  wmDeleted?: number
  wmPromoted?: number
}

interface RuminationTickerProps {
  ruminations: RuminationEntry[]
  maintenanceState?: MaintenanceState
}

export function RuminationTicker({ ruminations, maintenanceState }: RuminationTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const element = scrollRef.current
    if (!element || isPaused || ruminations.length === 0) return

    const scroll = () => {
      if (element.scrollTop >= element.scrollHeight / 2) {
        element.scrollTop = 0
      } else {
        element.scrollTop += 1
      }
    }

    const interval = setInterval(scroll, 50)
    return () => clearInterval(interval)
  }, [isPaused, ruminations.length])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "reflection":
        return "text-purple-400"
      case "synthesis":
        return "text-cyan-400"
      case "planning":
        return "text-emerald-400"
      case "observation":
        return "text-blue-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getTimeSinceLastMaintenance = () => {
    if (!maintenanceState?.lastMaintenanceAt) return "Never"
    const diff = Date.now() - new Date(maintenanceState.lastMaintenanceAt).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ago`
  }

  const getStatus = () => {
    if (maintenanceState?.isPaused) return "paused"
    return "active"
  }

  const getStatusColor = () => {
    if (maintenanceState?.isPaused) return "bg-muted text-muted-foreground"
    return "bg-accent text-accent-foreground"
  }

  const doubledRuminations = [...ruminations, ...ruminations]

  return (
    <Card className="p-4 bg-background/50 border-border/50 h-full">
      {/* Header with status badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-foreground">Subconscious Reflection</h3>
        </div>
        {maintenanceState && (
          <Badge className={getStatusColor()}>{getStatus()}</Badge>
        )}
      </div>

      {/* Maintenance Stats */}
      {maintenanceState && (
        <div className="mb-4 space-y-3">
          {/* Timing */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Last Tick:</span>
              <span className="font-medium text-foreground">{getTimeSinceLastMaintenance()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Interval:</span>
              <span className="font-medium text-foreground">{maintenanceState.intervalSeconds}s</span>
            </div>
          </div>

          {/* Memory Tiers */}
          <div className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
              <Layers className="h-3 w-3 text-purple-400" />
              <span>Memory Tiers</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-1.5 rounded bg-background/50">
                <p className="text-muted-foreground text-[10px]">Working</p>
                <p className="text-sm font-bold text-foreground">{maintenanceState.workingMemoryCount}</p>
              </div>
              <div className="text-center p-1.5 rounded bg-background/50">
                <p className="text-muted-foreground text-[10px]">Long-Term</p>
                <p className="text-sm font-bold text-foreground">{maintenanceState.longTermCount}</p>
              </div>
              <div className="text-center p-1.5 rounded bg-background/50">
                <p className="text-muted-foreground text-[10px]">Semantic</p>
                <p className="text-sm font-bold text-foreground">{maintenanceState.semanticCount}</p>
              </div>
            </div>
          </div>

          {/* Last Run Stats */}
          <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
              <ArrowUpRight className="h-3 w-3 text-cyan-400" />
              <span>Last Run Stats</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div className="text-center p-1 rounded bg-background/50">
                <p className="text-muted-foreground text-[9px]">Neighbors</p>
                <p className="text-sm font-bold text-foreground">{maintenanceState.neighborhoodsRecomputed ?? 0}</p>
              </div>
              <div className="text-center p-1 rounded bg-background/50">
                <p className="text-muted-foreground text-[9px]">Cache</p>
                <p className="text-sm font-bold text-foreground">{maintenanceState.cacheDeleted ?? 0}</p>
              </div>
              <div className="text-center p-1 rounded bg-background/50">
                <p className="text-muted-foreground text-[9px]">WM Del</p>
                <p className="text-sm font-bold text-foreground">{maintenanceState.wmDeleted ?? 0}</p>
              </div>
              <div className="text-center p-1 rounded bg-background/50">
                <p className="text-muted-foreground text-[9px]">WM Promo</p>
                <p className="text-sm font-bold text-foreground">{maintenanceState.wmPromoted ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
