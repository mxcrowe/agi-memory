"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquareText } from "lucide-react"

interface DecisionReasoningProps {
  reasoning: string | null | undefined
  heartbeatNumber: number
}

export function DecisionReasoning({ reasoning, heartbeatNumber }: DecisionReasoningProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquareText className="h-4 w-4" />
          Decision Reasoning
        </CardTitle>
        <CardDescription>Internal monologue from Heartbeat #{heartbeatNumber}</CardDescription>
      </CardHeader>
      <CardContent>
        {reasoning ? (
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {reasoning}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No decision reasoning recorded for this heartbeat
          </p>
        )}
      </CardContent>
    </Card>
  )
}
