import { NextResponse } from "next/server"
import { mockRelationships } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockRelationships)
}
