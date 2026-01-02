import { NextResponse } from "next/server"
import { mockHeartbeatCycles } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockHeartbeatCycles)
}
