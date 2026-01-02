"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Link2 } from "lucide-react"
import type { SemanticMemory } from "@/lib/types"

interface SemanticMemoriesProps {
  memories: SemanticMemory[]
}

export function SemanticMemories({ memories }: SemanticMemoriesProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-accent text-accent-foreground"
    if (confidence >= 0.6) return "bg-chart-3 text-chart-3"
    return "bg-muted text-muted-foreground"
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Semantic Memory
        </CardTitle>
        <CardDescription>Conceptual knowledge and understanding</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {memories.map((memory) => (
          <div key={memory.id} className="space-y-2 rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">{memory.concept}</h4>
              <Badge className={getConfidenceColor(memory.confidence)}>{(memory.confidence * 100).toFixed(0)}%</Badge>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{memory.definition}</p>
            <div className="flex items-center gap-2 pt-1">
              <Link2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {memory.sources.length} source{memory.sources.length !== 1 ? "s" : ""} • Updated{" "}
                {new Date(memory.last_updated).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
