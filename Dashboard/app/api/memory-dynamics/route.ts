import { NextResponse } from "next/server"
import { getMemoryDynamics } from "@/lib/db-queries"

export async function GET() {
  try {
    const dynamics = await getMemoryDynamics()
    return NextResponse.json(dynamics)
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch memory dynamics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
