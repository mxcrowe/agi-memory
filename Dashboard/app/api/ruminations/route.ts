import { NextResponse } from "next/server"
import { mockRuminations } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockRuminations)
}
