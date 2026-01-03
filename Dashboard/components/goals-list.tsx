"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react"

interface ActiveGoal {
  id: string
  title: string
  description: string
  due_at: string | null
  last_touched: string
  progress_count: number
  blocked_by: string | null
  metrics: {
    target?: number
    target_met?: boolean
    relationships_created?: number
    worldview_beliefs?: number
  } | null
}

interface GoalsData {
  active: ActiveGoal[]
  queued: { id: string; title: string; source: string; due_at: string | null }[]
  issues: { goal_id: string; title: string; issue: string; due_at: string | null; days_since_touched: number }[]
  counts: { active: number; queued: number; backburner: number }
}

interface GoalsListProps {
  goals: GoalsData
}

export function GoalsList({ goals }: GoalsListProps) {
  const getMetricsProgress = (goal: ActiveGoal): { value: number; label: string } | null => {
    if (!goal.metrics) return null

    if (goal.metrics.relationships_created !== undefined && goal.metrics.target) {
      const pct = Math.min(100, (goal.metrics.relationships_created / goal.metrics.target) * 100)
      return { value: pct, label: `${goal.metrics.relationships_created}/${goal.metrics.target} relationships` }
    }

    if (goal.metrics.worldview_beliefs !== undefined && goal.metrics.target) {
      const pct = Math.min(100, (goal.metrics.worldview_beliefs / goal.metrics.target) * 100)
      return { value: pct, label: `${goal.metrics.worldview_beliefs}/${goal.metrics.target} beliefs` }
    }

    return null
  }

  const formatLastTouched = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals
            </CardTitle>
            <CardDescription>Active objectives and queue</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="default" className="text-xs">
              {goals.counts.active} active
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {goals.counts.queued} queued
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Goals */}
        {goals.active.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">No active goals</p>
        ) : (
          goals.active.map((goal) => {
            const metricsProgress = getMetricsProgress(goal)
            const isComplete = goal.metrics?.target_met === true

            return (
              <div key={goal.id} className="space-y-2 rounded-lg border border-border/50 bg-card/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Target className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-sm font-medium text-foreground">{goal.title}</span>
                      {goal.blocked_by && (
                        <Badge variant="destructive" className="text-[10px]">blocked</Badge>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                    )}
                  </div>
                </div>

                {/* Metrics Progress */}
                {metricsProgress && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{metricsProgress.label}</span>
                      <span className={`font-medium ${isComplete ? 'text-emerald-400' : 'text-foreground'}`}>
                        {isComplete ? '✓ Complete' : `${metricsProgress.value.toFixed(0)}%`}
                      </span>
                    </div>
                    <Progress value={metricsProgress.value} className={`h-1.5 ${isComplete ? '[&>div]:bg-emerald-500' : ''}`} />
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatLastTouched(goal.last_touched)}
                  </span>
                  {goal.progress_count > 0 && (
                    <span>{goal.progress_count} progress notes</span>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Queued Goals (compact) */}
        {goals.queued.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Queued</span>
            </div>
            <div className="space-y-1.5">
              {goals.queued.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80 truncate">{goal.title}</span>
                  <Badge variant="outline" className="text-xs">{goal.source}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues (if any) */}
        {goals.issues.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">Issues</span>
            </div>
            <div className="space-y-1">
              {goals.issues.map((issue) => (
                <div key={issue.goal_id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground/80 truncate">{issue.title}</span>
                  <Badge variant="outline" className="text-[9px] border-yellow-500/50 text-yellow-400">
                    {issue.issue}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
