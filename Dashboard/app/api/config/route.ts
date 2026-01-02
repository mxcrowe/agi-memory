import { NextResponse } from "next/server"
import { mockConfiguration } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockConfiguration)
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json()
    // In a real implementation, this would update the configuration
    // For now, just return the updated config
    return NextResponse.json({ ...mockConfiguration, ...updates })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 })
  }
}
