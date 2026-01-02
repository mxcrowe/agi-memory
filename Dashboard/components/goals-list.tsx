"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp } from "lucide-react"
import type { Goal } from "@/lib/types"

interface GoalsListProps {
  goals: Goal[]
}

export function GoalsList({ goals }: GoalsListProps) {
  const getGoalProgress = (goal: Goal) => {
    if (goal.status === "achieved") return 100
    if (goal.status === "abandoned") return 0
    // Mock progress based on energy allocated and priority
    return Math.min(95, (goal.energy_allocated / 200) * 100)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Goals
            </CardTitle>
            <CardDescription>Current objectives and priorities</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {goals.filter((g) => g.status === "active").length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2 rounded-lg border border-border/50 bg-card/50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={goal.type === "terminal" ? "default" : "secondary"} className="text-xs">
                    {goal.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Priority: {(goal.priority * 100).toFixed(0)}%</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground">{goal.description}</p>
              </div>
              <TrendingUp className="h-4 w-4 shrink-0 text-accent" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{getGoalProgress(goal).toFixed(0)}%</span>
              </div>
              <Progress value={getGoalProgress(goal)} className="h-1.5" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Energy: {goal.energy_allocated}</span>
              {goal.target_date && <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
