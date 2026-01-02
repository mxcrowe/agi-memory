import { NextResponse } from "next/server"
import { getIdentityAspects, getWorldviewPrimitives } from "@/lib/db-queries"

export async function GET() {
  try {
    const [aspects, worldview] = await Promise.all([getIdentityAspects(), getWorldviewPrimitives()])

    return NextResponse.json({
      aspects,
      worldview,
    })
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch identity data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
