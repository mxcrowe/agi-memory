"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Brain, Zap, Target, Heart, Sparkles } from "lucide-react"

interface AffectiveState {
  valence: number
  arousal: number
  dominance: number
  primaryEmotion: string
}

interface AgentStatusCardProps {
  status: {
    name: string
    status: "active" | "idle" | "sleeping" | "error"
    total_memories: number
    current_energy: number
    max_energy: number
    last_heartbeat: Date
    active_goals: number
    llm_model: string
    affective_state: AffectiveState
  }
}

export function AgentStatusCard({ status }: AgentStatusCardProps) {
  const energyPercent = (status.current_energy / status.max_energy) * 100
  const timeSinceHeartbeatMinutes = Math.floor((Date.now() - new Date(status.last_heartbeat).getTime()) / 60000)

  const getStatusColor = () => {
    switch (status.status) {
      case "active":
        return "bg-accent text-accent-foreground"
      case "idle":
        return "bg-muted text-muted-foreground"
      case "sleeping":
        return "bg-secondary text-secondary-foreground"
      case "error":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getValenceLabel = (val: number) => {
    if (val > 0.3) return "Positive"
    if (val < -0.3) return "Negative"
    return "Neutral"
  }

  const getArousalLabel = (val: number) => {
    if (val > 0.5) return "High"
    if (val < 0.3) return "Low"
    return "Moderate"
  }

  const getDominanceLabel = (val: number) => {
    if (val > 0.6) return "Dominant"
    if (val < 0.4) return "Submissive"
    return "Balanced"
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Current Status</CardTitle>
        <Badge className={getStatusColor()}>{status.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emotional State Section */}
        <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Heart className="h-4 w-4 text-pink-400" />
            <span>Emotional State</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Feeling</span>
              <p className="font-medium text-foreground capitalize">{status.affective_state.primaryEmotion}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Valence</span>
              <p className="font-medium text-foreground">{getValenceLabel(status.affective_state.valence)} ({status.affective_state.valence.toFixed(2)})</p>
            </div>
            <div>
              <span className="text-muted-foreground">Arousal</span>
              <p className="font-medium text-foreground">{getArousalLabel(status.affective_state.arousal)} ({status.affective_state.arousal.toFixed(2)})</p>
            </div>
            <div>
              <span className="text-muted-foreground">Dominance</span>
              <p className="font-medium text-foreground">{getDominanceLabel(status.affective_state.dominance)} ({status.affective_state.dominance.toFixed(2)})</p>
            </div>
          </div>
        </div>

        {/* Energy Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Energy</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {status.current_energy} / {status.max_energy}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${energyPercent}%` }} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last Heartbeat</span>
            </div>
            <p className="text-sm font-medium text-foreground">{timeSinceHeartbeatMinutes}m ago</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Active Goals</span>
            </div>
            <p className="text-sm font-medium text-foreground">{status.active_goals}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Memories</span>
            </div>
            <p className="text-sm font-medium text-foreground">{status.total_memories.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">LLM Model</span>
            </div>
            <p className="text-xs font-medium text-foreground truncate" title={status.llm_model}>{status.llm_model}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

