import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// POST /api/chat - Handle user response to outbox message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, inReplyTo, tone } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    // Map tone to valence/importance
    const toneValues: Record<string, { valence: number; importance: number }> = {
      casual: { valence: 0.3, importance: 0.6 },
      normal: { valence: 0.5, importance: 0.8 },
      warm: { valence: 0.7, importance: 0.85 },
      urgent: { valence: 0.5, importance: 0.95 },
    }

    const { valence, importance } = toneValues[tone] || toneValues.normal

    // Insert into inbox_messages
    const result = await sql`
      INSERT INTO inbox_messages (
        in_reply_to,
        from_user,
        message,
        emotional_valence,
        importance
      ) VALUES (
        ${inReplyTo || null},
        'Michael',
        ${message},
        ${valence},
        ${importance}
      )
      RETURNING id
    `

    const inboxId = result[0]?.id

    // Process immediately to create the episodic memory
    const memoryResult = await sql`
      SELECT process_inbox_message(${inboxId}) as memory_id
    `

    const memoryId = memoryResult[0]?.memory_id

    return NextResponse.json({
      success: true,
      inboxId,
      memoryId,
      message: "Response recorded and memory created",
    })
  } catch (error) {
    console.error("Error processing chat message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process message" },
      { status: 500 }
    )
  }
}

// GET /api/chat - Get inbox message history (for debugging)
export async function GET() {
  try {
    const messages = await sql`
      SELECT
        i.id,
        i.created_at,
        i.in_reply_to,
        i.message,
        i.emotional_valence,
        i.importance,
        i.processed,
        i.created_memory_id,
        o.payload->>'message' as original_message
      FROM inbox_messages i
      LEFT JOIN outbox_messages o ON i.in_reply_to = o.id
      ORDER BY i.created_at DESC
      LIMIT 20
    `

    return NextResponse.json({ success: true, messages })
  } catch (error) {
    console.error("Error fetching inbox:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch inbox messages" },
      { status: 500 }
    )
  }
}
