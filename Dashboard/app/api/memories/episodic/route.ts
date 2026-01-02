import { NextResponse } from "next/server"
import { getRecentEpisodicMemories } from "@/lib/db-queries"

export async function GET() {
  try {
    const memories = await getRecentEpisodicMemories(20)
    return NextResponse.json(memories)
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch episodic memories", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
