import { NextResponse } from "next/server"
import { mockInsightProgress } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockInsightProgress)
}
