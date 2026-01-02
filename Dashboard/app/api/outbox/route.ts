import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/outbox - Fetch recent outbox messages for display
export async function GET() {
  try {
    const messages = await sql`
      SELECT
        id,
        created_at,
        kind,
        payload->>'message' as message,
        payload->>'intent' as intent,
        payload->>'heartbeat_id' as heartbeat_id,
        status,
        sent_at
      FROM outbox_messages
      WHERE kind = 'user'
      ORDER BY created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      success: true,
      messages: messages.map(m => ({
        id: m.id,
        createdAt: m.created_at,
        message: m.message,
        intent: m.intent,
        heartbeatId: m.heartbeat_id,
        status: m.status,
        sentAt: m.sent_at,
      }))
    })
  } catch (error) {
    console.error("Error fetching outbox:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch outbox messages" },
      { status: 500 }
    )
  }
}
