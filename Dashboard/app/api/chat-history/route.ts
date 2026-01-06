import { NextResponse } from "next/server";
import { getChatHistory } from "@/lib/db-queries";

export async function GET() {
  try {
    const messages = await getChatHistory(50);
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
