import { NextResponse } from "next/server"
import { mockCognitiveActions } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockCognitiveActions)
}
