"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Brain, Zap, Link2, RefreshCw, Coffee, Search, MessageSquare } from "lucide-react"

interface ActionEntry {
  heartbeatNumber: number
  timestamp: Date
  action: string
  params?: Record<string, unknown>
  cost?: number
}

interface RecentActionsProps {
  actions: ActionEntry[]
}

const actionIcons: Record<string, typeof Activity> = {
  recall: Search,
  reflect: Brain,
  connect: Link2,
  maintain: RefreshCw,
  rest: Coffee,
  reach_out_user: MessageSquare,
  reach_out_public: MessageSquare,
  reprioritize: Zap,
  inquire_shallow: Search,
  inquire_deep: Search,
}

const actionColors: Record<string, string> = {
  recall: "text-purple-400",
  reflect: "text-cyan-400",
  connect: "text-pink-400",
  maintain: "text-emerald-400",
  rest: "text-blue-400",
  reach_out_user: "text-orange-400",
  reach_out_public: "text-orange-400",
  reprioritize: "text-yellow-400",
  inquire_shallow: "text-violet-400",
  inquire_deep: "text-violet-400",
}

export function RecentActions({ actions }: RecentActionsProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionSummary = (action: ActionEntry): string => {
    const params = action.params || {}
    switch (action.action) {
      case 'recall':
        return params.query ? `"${String(params.query).slice(0, 40)}..."` : 'Memory retrieval'
      case 'reflect':
        return params.aspect ? `On ${params.aspect}` : 'Self-reflection'
      case 'connect':
        return 'Created memory relationship'
      case 'maintain':
        return String(params.operation || 'Maintenance operation')
      case 'rest':
        return 'Energy conservation'
      case 'reach_out_user':
        return 'Reached out to user'
      case 'reach_out_public':
        return 'Public post queued'
      case 'reprioritize':
        return String(params.action || 'Goal management')
      default:
        return action.action
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Actions
        </CardTitle>
        <CardDescription>Actions taken in recent heartbeats</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2">
          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No actions recorded yet
            </p>
          ) : (
            actions.map((entry, idx) => {
              const Icon = actionIcons[entry.action] || Activity
              const color = actionColors[entry.action] || "text-muted-foreground"

              return (
                <div
                  key={`${entry.heartbeatNumber}-${entry.action}-${idx}`}
                  className="flex items-start gap-3 p-2 rounded-lg bg-background/30 border border-border/30"
                >
                  <div className={`mt-0.5 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold uppercase ${color}`}>
                        {entry.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{entry.heartbeatNumber}
                      </span>
                      {entry.cost && (
                        <span className="text-xs text-muted-foreground">
                          -{entry.cost}⚡
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/70 truncate">
                      {getActionSummary(entry)}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
