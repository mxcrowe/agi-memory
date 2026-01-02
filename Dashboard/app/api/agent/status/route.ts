import { NextResponse } from "next/server"
import { getAgentStatus } from "@/lib/db-queries"

export async function GET() {
  try {
    const status = await getAgentStatus()

    return NextResponse.json({
      status: "operational",
      totalMemories: status.totalMemories,
      episodicCount: status.episodicCount,
      semanticCount: status.semanticCount,
      clusterCount: status.clusterCount,
      avgImportance: status.avgImportance,
      avgTrust: status.avgTrust,
      lastActivity: status.lastActivity,
      current_energy: 850, // TODO: implement energy tracking
      max_energy: 1000,
      last_heartbeat: new Date(),
    })
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch agent status", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
