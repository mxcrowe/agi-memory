"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Clock } from "lucide-react"
import type { Relationship } from "@/lib/types"

interface ConversationHistoryProps {
  relationships: Relationship[]
}

export function ConversationHistory({ relationships }: ConversationHistoryProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Conversation History
        </CardTitle>
        <CardDescription>Recent interactions and relationships</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {relationships.map((relationship) => (
          <div key={relationship.id} className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">{relationship.entity_name}</h4>
              </div>
              <Badge variant="secondary" className="text-xs">
                Trust: {(relationship.trust_level * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">{relationship.summary}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{relationship.interaction_count} interactions</span>
              <span>Last: {new Date(relationship.last_interaction).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
