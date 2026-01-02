"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Zap } from "lucide-react"

interface HeartbeatEntry {
  id: string
  heartbeat_number: number
  started_at: Date
  energy_start: number
  energy_end: number
  narrative: string | null
  emotional_valence: number | null
}

interface HeartbeatMonitorProps {
  entries: HeartbeatEntry[]
}

export function HeartbeatMonitor({ entries }: HeartbeatMonitorProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Heartbeat Monitor
        </CardTitle>
        <CardDescription>Recent heartbeat cycles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No heartbeats recorded yet</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">#{entry.heartbeat_number}</span>
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(entry.started_at)}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <Zap className="h-3 w-3 text-primary" />
                      <span className="text-muted-foreground">
                        {entry.energy_start} → {entry.energy_end}
                      </span>
                    </div>
                  </div>
                  {entry.narrative && (
                    <p className="text-xs text-foreground/80 line-clamp-2" title={entry.narrative}>
                      {entry.narrative}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
