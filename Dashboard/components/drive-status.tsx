"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Zap, Brain, Users, Coffee } from "lucide-react"

interface Drive {
  name: string
  current_level: number
  baseline: number
  urgency_threshold: number
  is_urgent: boolean
  urgency_percent: number
  last_satisfied: Date | null
}

interface DriveStatusProps {
  drives: Drive[]
}

const driveIcons: Record<string, typeof Flame> = {
  curiosity: Brain,
  coherence: Zap,
  connection: Users,
  competence: Flame,
  rest: Coffee,
}

const driveColors: Record<string, string> = {
  curiosity: "bg-purple-500",
  coherence: "bg-cyan-500",
  connection: "bg-pink-500",
  competence: "bg-orange-500",
  rest: "bg-emerald-500",
}

export function DriveStatus({ drives }: DriveStatusProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400" />
          Drive Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {drives.map((drive) => {
          const Icon = driveIcons[drive.name] || Flame
          const barColor = driveColors[drive.name] || "bg-primary"
          const urgencyPct = Number(drive.urgency_percent) || 0
          const urgencyWidth = Math.min(100, urgencyPct)

          return (
            <div key={drive.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${drive.is_urgent ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium capitalize">{drive.name}</span>
                </div>
                <span className={`text-xs font-mono ${drive.is_urgent ? 'text-red-400 font-bold' : 'text-muted-foreground'}`}>
                  {urgencyPct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all duration-500 ${drive.is_urgent ? 'bg-red-500' : barColor}`}
                  style={{ width: `${urgencyWidth}%` }}
                />
              </div>
            </div>
          )
        })}

        {drives.length === 0 && (
          <p className="text-sm text-muted-foreground">No drive data available</p>
        )}
      </CardContent>
    </Card>
  )
}
