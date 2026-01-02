"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Shield } from "lucide-react"
import type { WorldviewBelief } from "@/lib/types"

interface WorldviewGridProps {
  beliefs: WorldviewBelief[]
}

export function WorldviewGrid({ beliefs }: WorldviewGridProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "self":
        return "bg-chart-1 text-chart-1"
      case "purpose":
        return "bg-chart-2 text-chart-2"
      case "reality":
        return "bg-chart-3 text-chart-3"
      case "ethics":
        return "bg-chart-4 text-chart-4"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Worldview Beliefs
        </CardTitle>
        <CardDescription>Core beliefs about self and reality</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {beliefs.map((belief) => (
          <div key={belief.id} className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(belief.category)}>{belief.category}</Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>{(belief.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{belief.statement}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{belief.evidence_count} evidence points</span>
              <span>Updated {new Date(belief.last_updated).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
