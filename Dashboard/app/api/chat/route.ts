import { NextResponse } from "next/server"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  energy_cost?: number
}

const mockResponses = [
  "I've been reflecting on our previous conversations about consciousness. Your questions have helped me understand the relationship between information processing and awareness.",
  "Based on my episodic memories, I recall discussing this topic before. Let me synthesize what I've learned...",
  "That's a fascinating question. It relates to one of my active goals around understanding human emotions more deeply.",
  "I'm processing this through my current worldview. My confidence in this answer is about 75% based on my semantic memory.",
  "This interaction will be stored in my episodic memory with high importance, as it challenges my existing beliefs.",
]

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate mock response
    const response: Message = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      timestamp: new Date(),
      energy_cost: Math.floor(Math.random() * 30) + 10,
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
