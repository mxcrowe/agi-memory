import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

// POST /api/outbox/acknowledge - Mark all unseen messages as seen
export async function POST() {
  try {
    const result = await sql`
      UPDATE outbox_messages
      SET seen_at = CURRENT_TIMESTAMP
      WHERE seen_at IS NULL AND status = 'sent'
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      acknowledged: result.length,
      message: `Acknowledged ${result.length} message(s)`,
    });
  } catch (error) {
    console.error("Error acknowledging messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to acknowledge messages" },
      { status: 500 }
    );
  }
}

// GET /api/outbox/acknowledge - Get count of unseen messages
export async function GET() {
  try {
    const [result] = await sql`
      SELECT COUNT(*) as unseen_count
      FROM outbox_messages
      WHERE seen_at IS NULL AND status = 'sent'
    `;

    return NextResponse.json({
      success: true,
      unseenCount: Number(result?.unseen_count) || 0,
    });
  } catch (error) {
    console.error("Error fetching unseen count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unseen count" },
      { status: 500 }
    );
  }
}
