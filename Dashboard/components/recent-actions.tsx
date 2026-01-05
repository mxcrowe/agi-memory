"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Brain, Zap, Link2, RefreshCw, Coffee, Search, MessageSquare } from "lucide-react"

interface ActionEntry {
  heartbeatNumber: number
  timestamp: Date
  action: string
  params?: Record<string, unknown>
  result?: Record<string, unknown>
  externalOutput?: Record<string, unknown>
  cost: number
}

interface RecentActionsProps {
  actions: ActionEntry[]
}

const actionIcons: Record<string, typeof Sparkles> = {
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
        if (params.query) {
          const query = String(params.query)
          return query.length > 80 ? `"${query.slice(0, 80)}..."` : `"${query}"`
        }
        return 'Retrieving from memory'
      case 'reflect': {
        const reflectMessages = [
          'Examining recent patterns and experiences...',
          'Checking for contradictions in worldview...',
          'Updating self-model based on observations...',
          'Analyzing identity coherence...',
          'Synthesizing insights from recent activity...',
        ]
        // Use timestamp to pick a message (different per entry)
        const msgIndex = new Date(action.timestamp).getSeconds() % reflectMessages.length
        return reflectMessages[msgIndex]
      }
      case 'synthesize': {
        // Build a rich summary: topic or first sentence + source count
        const sources = Array.isArray(params.sources) ? params.sources : []
        const sourceCount = sources.length > 0 ? ` (${sources.length} sources)` : ''

        if (params.topic) {
          const topic = String(params.topic)
          return `Synthesized: ${topic.slice(0, 60)}${topic.length > 60 ? '...' : ''}${sourceCount}`
        }
        if (params.content) {
          // Extract first sentence or first 60 chars
          const content = String(params.content)
          const firstSentence = content.split(/[.!?]/)[0]?.trim() || content
          const display = firstSentence.length > 60 ? `${firstSentence.slice(0, 60)}...` : firstSentence
          return `Synthesized: ${display}${sourceCount}`
        }
        return `Synthesized semantic memory${sourceCount}`
      }
      case 'connect':
        if (params.relationship_type) {
          return `Linking memories: ${params.relationship_type}`
        }
        return 'Creating relationship between memories'
      case 'maintain':
        if (params.worldview_id) {
          return `Updating worldview belief confidence`
        }
        return String(params.operation || 'Internal maintenance')
      case 'rest':
        return 'Conserving energy — allowing passive regeneration'
      case 'reach_out_user':
        if (params.intent) {
          return `To user: ${params.intent}`
        }
        return 'Initiating contact with user'
      case 'reach_out_public':
        return 'Queuing public post'
      case 'reprioritize':
        const priority = params.new_priority ? ` → ${params.new_priority}` : ''
        const reason = params.reason ? `: ${String(params.reason).slice(0, 50)}` : ''
        return `Goal${priority}${reason}` || 'Adjusting goal priorities'
      case 'brainstorm_goals':
        return 'Generating self-directed goals based on current state'
      case 'inquire_shallow':
        return params.question ? `Quick lookup: "${String(params.question).slice(0, 50)}"` : 'Quick information lookup'
      case 'inquire_deep':
        return params.question ? `Deep research: "${String(params.question).slice(0, 50)}"` : 'Comprehensive research query'
      default:
        return action.action.replace(/_/g, ' ')
    }
  }

  // Format the result into a human-readable "→ outcome" line
  const getActionResult = (action: ActionEntry): string | null => {
    const result = action.result

    // Check for errors first
    if (result?.error) {
      return `⚠ ${String(result.error).slice(0, 80)}`
    }

    // Navigate the nested structure: result -> result -> external_call_result -> result
    const innerResult = (result?.result as Record<string, unknown>) || {}
    const externalCallResult = (innerResult?.external_call_result as Record<string, unknown>) || {}
    const llmResult = (externalCallResult?.result as Record<string, unknown>) || {}

    // For reflect actions, extract insights from the deeply nested LLM response
    if (action.action === 'reflect') {
      const insights = llmResult.insights as Array<{ content?: string }> | undefined
      if (insights && insights.length > 0 && insights[0]?.content) {
        const text = insights[0].content.slice(0, 100)
        return `${text}${insights[0].content.length > 100 ? '...' : ''}`
      }
      // Check for self_updates or worldview_updates as fallback
      const selfUpdates = llmResult.self_updates as Array<{ content?: string }> | undefined
      if (selfUpdates && selfUpdates.length > 0 && selfUpdates[0]?.content) {
        const text = selfUpdates[0].content.slice(0, 80)
        return `Self-update: ${text}${selfUpdates[0].content.length > 80 ? '...' : ''}`
      }
    }

    // For inquire actions, check for answer in the nested structure
    if (action.action === 'inquire_shallow' || action.action === 'inquire_deep') {
      const answer = llmResult.answer || llmResult.response || externalCallResult.answer
      if (answer && typeof answer === 'string') {
        const text = answer.slice(0, 100)
        return `${text}${answer.length > 100 ? '...' : ''}`
      }
    }

    // For synthesize, check for created memory content
    if (action.action === 'synthesize') {
      const content = llmResult.content || llmResult.synthesis
      if (content && typeof content === 'string') {
        const text = content.slice(0, 80)
        return `Created: "${text}${content.length > 80 ? '...' : ''}"`
      }
    }

    // For brainstorm_goals, check for generated goals
    if (action.action === 'brainstorm_goals') {
      const goals = llmResult.goals as Array<unknown> | undefined
      if (goals && goals.length > 0) {
        return `Generated ${goals.length} goal${goals.length > 1 ? 's' : ''}`
      }
    }

    // Fall back to basic result parsing
    if (!result) return null

    switch (action.action) {
      case 'recall':
        // Check the nested structure first (innerResult is already declared above)
        if (innerResult.memory_count !== undefined) {
          return `Retrieved ${innerResult.memory_count} relevant memories`
        }
        if (innerResult.memories && Array.isArray(innerResult.memories)) {
          return `Retrieved ${innerResult.memories.length} relevant memories`
        }
        if (result.memory_count !== undefined) {
          return `Retrieved ${result.memory_count} relevant memories`
        }
        if (result.memories && Array.isArray(result.memories)) {
          return `Retrieved ${result.memories.length} relevant memories`
        }
        return result.queued ? 'Processing memory query...' : null
      case 'reflect':
        return result.queued ? 'Processing reflection...' : null
      case 'synthesize':
        if (result.synthesis_memory_id) {
          return 'Created semantic memory'
        }
        return result.queued ? 'Processing synthesis...' : null
      case 'connect':
        if (result.connected) {
          return `Linked memories via ${action.params?.relationship_type || 'relationship'}`
        }
        return null
      case 'reprioritize':
        if (result.reprioritized) {
          return 'Goal priority updated'
        }
        return null
      case 'reach_out_user':
        if (result.queued || result.success) {
          return 'Message queued for user'
        }
        return null
      case 'inquire_shallow':
      case 'inquire_deep':
        return result.queued ? 'Query processing...' : null
      case 'rest':
        return 'Energy conserved'
      case 'maintain':
        return result.success ? 'Maintenance cycle completed' : null
      default:
        if (result.success === true) {
          return 'Completed'
        }
        if (result.success === false) {
          return 'Action failed'
        }
        return null
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
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
              const Icon = actionIcons[entry.action] || Sparkles
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
                      <span className="text-xs text-muted-foreground">
                        (Cost = {entry.cost})
                      </span>
                    </div>
                    <p className="text-xs text-foreground/70 truncate">
                      {getActionSummary(entry)}
                    </p>
                    {getActionResult(entry) && (
                      <p className="text-xs text-emerald-400/80 truncate">
                        → {getActionResult(entry)}
                      </p>
                    )}
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
