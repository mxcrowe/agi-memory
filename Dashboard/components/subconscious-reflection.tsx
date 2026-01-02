"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Moon, Clock, Database, ArrowUpRight, Layers } from "lucide-react"

interface MaintenanceState {
  lastMaintenanceAt: Date | null
  isPaused: boolean
  intervalSeconds: number
  workingMemoryCount: number
  longTermCount: number
  semanticCount: number
}

interface SubconsciousReflectionProps {
  state: MaintenanceState
}

export function SubconsciousReflection({ state }: SubconsciousReflectionProps) {
  const getTimeSinceLastMaintenance = () => {
    if (!state.lastMaintenanceAt) return "Never"
    const diff = Date.now() - new Date(state.lastMaintenanceAt).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ago`
  }

  const getStatusColor = () => {
    if (state.isPaused) return "bg-muted text-muted-foreground"
    return "bg-accent text-accent-foreground"
  }

  const getStatus = () => {
    if (state.isPaused) return "paused"
    return "active"
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Moon className="h-5 w-5 text-indigo-400" />
          Subconscious Reflection
        </CardTitle>
        <Badge className={getStatusColor()}>{getStatus()}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timing Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last Tick</span>
            </div>
            <p className="text-sm font-medium text-foreground">{getTimeSinceLastMaintenance()}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Interval</span>
            </div>
            <p className="text-sm font-medium text-foreground">{state.intervalSeconds}s</p>
          </div>
        </div>

        {/* Memory Tiers */}
        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Memory Tiers</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 rounded-md bg-background/50">
              <p className="text-muted-foreground">Working</p>
              <p className="text-lg font-bold text-foreground">{state.workingMemoryCount}</p>
            </div>
            <div className="text-center p-2 rounded-md bg-background/50 relative">
              <ArrowUpRight className="h-3 w-3 absolute top-1 right-1 text-emerald-400" />
              <p className="text-muted-foreground">Long-Term</p>
              <p className="text-lg font-bold text-foreground">{state.longTermCount}</p>
            </div>
            <div className="text-center p-2 rounded-md bg-background/50">
              <Database className="h-3 w-3 absolute top-1 right-1 text-cyan-400 hidden" />
              <p className="text-muted-foreground">Semantic</p>
              <p className="text-lg font-bold text-foreground">{state.semanticCount}</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <p className="text-xs text-muted-foreground text-center italic">
          {state.isPaused
            ? "Maintenance paused — memories are not being consolidated"
            : "Quietly consolidating and organizing memories..."
          }
        </p>
      </CardContent>
    </Card>
  )
}
