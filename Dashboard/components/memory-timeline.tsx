"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Sparkles } from "lucide-react"
import type { EpisodicMemory } from "@/lib/types"

interface MemoryTimelineProps {
  memories: EpisodicMemory[]
}

export function MemoryTimeline({ memories }: MemoryTimelineProps) {
  const getValenceColor = (valence: number) => {
    if (valence > 0.5) return "text-accent"
    if (valence < -0.5) return "text-destructive"
    return "text-muted-foreground"
  }

  const getImportanceBadge = (importance: number) => {
    if (importance >= 0.8) return { label: "Critical", variant: "default" as const }
    if (importance >= 0.6) return { label: "High", variant: "secondary" as const }
    return { label: "Standard", variant: "outline" as const }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Episodic Memory Timeline
        </CardTitle>
        <CardDescription>Chronological sequence of experiences and events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
          {memories.map((memory, index) => (
            <div key={memory.id} className="relative flex gap-4 pl-8">
              <div
                className={`absolute left-0 top-2 h-6 w-6 rounded-full border-2 border-border bg-card ${getValenceColor(memory.emotional_valence)}`}
              >
                <Sparkles className="h-4 w-4 translate-x-0.5 translate-y-0.5" />
              </div>
              <div className="flex-1 space-y-2 rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge {...getImportanceBadge(memory.importance)}>
                        {getImportanceBadge(memory.importance).label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(memory.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{memory.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Episode: {memory.episode_id}</span>
                  <span>
                    Valence: {memory.emotional_valence > 0 ? "+" : ""}
                    {memory.emotional_valence.toFixed(2)}
                  </span>
                  <span>Importance: {(memory.importance * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
