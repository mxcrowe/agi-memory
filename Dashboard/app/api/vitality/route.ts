import { NextResponse } from "next/server"
import { getVitalityMetrics } from "@/lib/db-queries"
import { checkDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    const metrics = await getVitalityMetrics()
    const dbStatus = await checkDatabaseConnection()

    return NextResponse.json({
      ...metrics,
      heartbeatActive: true,
      ooda_phase: "Observe", // TODO: implement heartbeat tracking
      connectionHealth: {
        database: dbStatus.connected,
        mcp_bridge: false, // TODO: implement MCP health check
        llm_api: false, // TODO: implement LLM health check
      },
    })
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch vitality metrics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
