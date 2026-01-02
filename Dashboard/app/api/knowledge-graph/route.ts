import { NextResponse } from "next/server"
import { getConcepts } from "@/lib/db-queries"

export async function GET() {
  try {
    const concepts = await getConcepts(100)

    // Transform concepts into nodes and edges for the graph
    const nodes = concepts.map((concept) => ({
      id: concept.id,
      name: concept.name,
      description: concept.description,
      depth: concept.depth,
      memoryCount: concept.memory_count || 0,
    }))

    // Create edges from parent-child relationships
    const edges = concepts
      .filter((c) => c.ancestors && c.ancestors.length > 0)
      .flatMap((concept) => {
        const parentId = concept.ancestors?.[concept.ancestors.length - 1]
        if (!parentId) return []
        return [
          {
            source: parentId,
            target: concept.id,
            type: "parent_of",
          },
        ]
      })

    return NextResponse.json({ nodes, edges })
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch knowledge graph", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
