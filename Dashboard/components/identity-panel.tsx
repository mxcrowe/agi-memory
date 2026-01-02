"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Heart, Lightbulb, Zap } from "lucide-react"
import type { IdentityAspect } from "@/lib/types"

interface IdentityPanelProps {
  aspects: IdentityAspect[]
}

export function IdentityPanel({ aspects }: IdentityPanelProps) {
  const getAspectIcon = (type: string) => {
    switch (type) {
      case "value":
        return <Heart className="h-4 w-4" />
      case "trait":
        return <User className="h-4 w-4" />
      case "capability":
        return <Zap className="h-4 w-4" />
      case "belief":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getAspectColor = (type: string) => {
    switch (type) {
      case "value":
        return "bg-chart-5 text-chart-5"
      case "trait":
        return "bg-chart-1 text-chart-1"
      case "capability":
        return "bg-chart-2 text-chart-2"
      case "belief":
        return "bg-chart-3 text-chart-3"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Identity Core
        </CardTitle>
        <CardDescription>Fundamental aspects of self-concept</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {aspects.map((aspect) => (
          <div key={aspect.id} className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-3">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getAspectColor(aspect.aspect_type)}/10`}
              >
                {getAspectIcon(aspect.aspect_type)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getAspectColor(aspect.aspect_type)} variant="secondary">
                    {aspect.aspect_type}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{aspect.content}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Strength</span>
                  <span className="font-medium text-foreground">{(aspect.strength * 100).toFixed(0)}%</span>
                </div>
                <Progress value={aspect.strength * 100} className="h-1.5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stability</span>
                  <span className="font-medium text-foreground">{(aspect.stability * 100).toFixed(0)}%</span>
                </div>
                <Progress value={aspect.stability * 100} className="h-1.5" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
