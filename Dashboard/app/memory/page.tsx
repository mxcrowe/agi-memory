import { MemoryTimeline } from "@/components/memory-timeline"
import { SemanticMemories } from "@/components/semantic-memories"
import { IdentityPanel } from "@/components/identity-panel"
import { WorldviewGrid } from "@/components/worldview-grid"
import { KnowledgeGraph3D } from "@/components/knowledge-graph-3d"
import { SemanticDensityMap } from "@/components/semantic-density-map"
import { InsightProgressBar } from "@/components/insight-progress-bar"
import { MemoryDepthChart } from "@/components/memory-depth-chart"
import { Brain } from "lucide-react"
import Link from "next/link"
import {
  mockEpisodicMemories,
  mockSemanticMemories,
  mockIdentityAspects,
  mockWorldviewBeliefs,
  mockKnowledgeGraph,
  mockMemoryDynamics,
  mockInsightProgress,
  mockMemoryDistribution,
} from "@/lib/mock-data"

export default async function MemoryPage() {
  const episodicMemories = mockEpisodicMemories
  const semanticMemories = mockSemanticMemories
  const identity = {
    aspects: mockIdentityAspects,
    worldview: mockWorldviewBeliefs,
  }
  const knowledgeGraph = mockKnowledgeGraph

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Hexis Dashboard</h1>
              <p className="text-sm text-muted-foreground">Memory Explorer</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Status
            </Link>
            <button className="text-sm font-medium text-foreground hover:text-primary">Memory</button>
            <Link href="/chat" className="text-sm text-muted-foreground hover:text-foreground">
              Chat
            </Link>
            <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
              Config
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Relationship Graphing</h2>
          <KnowledgeGraph3D graph={knowledgeGraph} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Memory Dynamics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <SemanticDensityMap clusters={mockMemoryDynamics.semantic_density} />
            <div className="space-y-4">
              <InsightProgressBar progress={mockInsightProgress} />
              <MemoryDepthChart data={mockMemoryDistribution} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Timeline */}
          <div className="space-y-6 lg:col-span-2">
            <MemoryTimeline memories={episodicMemories} />
            <WorldviewGrid beliefs={identity.worldview} />
          </div>

          {/* Right Column - Semantic & Identity */}
          <div className="space-y-6">
            <IdentityPanel aspects={identity.aspects} />
            <SemanticMemories memories={semanticMemories} />
          </div>
        </div>
      </main>
    </div>
  )
}
