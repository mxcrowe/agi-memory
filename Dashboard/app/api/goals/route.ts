import { NextResponse } from "next/server"

export async function GET() {
  try {
    // TODO: Add goals table to schema and implement goal tracking
    // For now, return empty array since goals aren't in current schema
    return NextResponse.json([])
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch goals", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
