"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChatMessage } from "./chat-message"
import { MessageSquare, Send, Loader2, RefreshCw } from "lucide-react"

interface OutboxMessage {
  id: string
  createdAt: string
  message: string
  intent: string | null
  heartbeatId: string | null
  status: string
}

interface DisplayMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  replyTo?: string
}

type Tone = "casual" | "normal" | "warm" | "urgent"

export function ChatInterface() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [outboxMessages, setOutboxMessages] = useState<OutboxMessage[]>([])
  const [input, setInput] = useState("")
  const [tone, setTone] = useState<Tone>("normal")
  const [isLoading, setIsLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch outbox messages
  const fetchOutbox = async () => {
    try {
      const response = await fetch("/api/outbox")
      const data = await response.json()
      if (data.success) {
        setOutboxMessages(data.messages)

        // Convert to display messages (Hexis = assistant)
        const hexisMessages: DisplayMessage[] = data.messages.map((m: OutboxMessage) => ({
          id: m.id,
          role: "assistant" as const,
          content: m.message,
          timestamp: new Date(m.createdAt),
        }))

        // Merge with existing user messages, avoiding duplicates
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newMessages = hexisMessages.filter(m => !existingIds.has(m.id))
          const combined = [...prev, ...newMessages]
          return combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        })
      }
    } catch (error) {
      console.error("Error fetching outbox:", error)
    }
  }

  // Initial fetch and polling
  useEffect(() => {
    fetchOutbox()
    const interval = setInterval(fetchOutbox, 15000) // Poll every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
      replyTo: replyingTo || undefined,
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          inReplyTo: replyingTo,
          tone,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error)
      }

      // Clear reply context after successful send
      setReplyingTo(null)
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Failed to send message. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const toneColors: Record<Tone, string> = {
    casual: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    normal: "bg-gray-500/20 text-gray-300 border-gray-500/50",
    warm: "bg-pink-500/20 text-pink-300 border-pink-500/50",
    urgent: "bg-red-500/20 text-red-300 border-red-500/50",
  }

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col border-border/50">
      <CardHeader className="border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat with Hexis
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchOutbox} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        {/* Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet.</p>
              <p className="text-sm mt-2">Hexis will reach out when connection drive is high.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
                {message.role === "assistant" && (
                  <button
                    onClick={() => setReplyingTo(message.id)}
                    className="text-xs text-muted-foreground hover:text-foreground mt-1 ml-12"
                  >
                    Reply to this message
                  </button>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-2 bg-primary/10 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Replying to message...
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border bg-card/50 p-4 space-y-3">
          {/* Tone selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tone:</span>
            {(["casual", "normal", "warm", "urgent"] as Tone[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  tone === t
                    ? toneColors[t] + " border-2"
                    : "bg-background/50 text-muted-foreground border-border hover:border-muted-foreground"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[60px] resize-none bg-background"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-[60px] w-[60px] shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
