import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const dbCheck = await checkDatabaseConnection()

    if (!dbCheck.connected) {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: {
            connected: false,
            error: dbCheck.error,
          },
        },
        { status: 503 },
      )
    }

    // Get some basic stats to verify we can query the database
    const [memoryCount] = await sql`SELECT COUNT(*) as count FROM memories`
    const [episodeCount] = await sql`SELECT COUNT(*) as count FROM episodes`
    const [clusterCount] = await sql`SELECT COUNT(*) as count FROM memory_clusters`

    return NextResponse.json({
      status: "healthy",
      database: {
        connected: true,
        tables: {
          memories: Number.parseInt(memoryCount.count || "0"),
          episodes: Number.parseInt(episodeCount.count || "0"),
          clusters: Number.parseInt(clusterCount.count || "0"),
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 503 },
    )
  }
}
