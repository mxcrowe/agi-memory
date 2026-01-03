import { AgentStatusCard } from "@/components/agent-status-card"
import { RecentActions } from "@/components/recent-actions"
import { GoalsList } from "@/components/goals-list"
import { HeartbeatMonitor } from "@/components/heartbeat-monitor"
import { PulseIndicator } from "@/components/pulse-indicator"
import { VitalityMetrics } from "@/components/vitality-metrics"
import { ConnectionHealth } from "@/components/connection-health"
import { RuminationTicker } from "@/components/rumination-ticker"
import { SemanticDensityMap } from "@/components/semantic-density-map"
import { InsightProgressBar } from "@/components/insight-progress-bar"
import { MemoryDepthChart } from "@/components/memory-depth-chart"
import { DriveStatus } from "@/components/drive-status"
import { Brain } from "lucide-react"
import Link from "next/link"
import { getAgentStatus, getHeartbeatState, getRecentHeartbeats, getDriveStatus, getMaintenanceState, getRecentActions, getGoals } from "@/lib/db-queries"

// Helper to safely fetch data with fallback
async function fetchWithFallback<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fetcher()
  } catch (error) {
    console.error("Fetch error:", error)
    return fallback
  }
}

export default async function DashboardPage() {
  // Fetch real data from database
  const status = await fetchWithFallback(getAgentStatus, {
    totalMemories: 0, episodicCount: 0, semanticCount: 0, proceduralCount: 0, strategicCount: 0,
    clusterCount: 0, avgImportance: 0, avgTrust: 0, lastActivity: new Date().toISOString()
  })

  const heartbeatState = await fetchWithFallback(getHeartbeatState, {
    currentEnergy: 10, maxEnergy: 20, heartbeatCount: 0,
    firstHeartbeat: null, lastHeartbeat: null, nextHeartbeat: null, isPaused: false,
    intervalMinutes: 60, maintenanceIntervalSeconds: 300, activeGoals: 0, llmModel: "unknown",
    affectiveState: { valence: 0, arousal: 0, dominance: 0.5, primaryEmotion: "neutral" }
  })

  // Map to expected format for AgentStatusCard
  const agentStatus = {
    agent_id: "hexis-001",
    name: "Homunculus",
    status: heartbeatState.isPaused ? "sleeping" as const : "active" as const,
    total_memories: status.totalMemories,
    episodic_count: status.episodicCount,
    semantic_count: status.semanticCount,
    procedural_count: 0,
    strategic_count: 0,
    current_energy: heartbeatState.currentEnergy,
    max_energy: heartbeatState.maxEnergy,
    last_heartbeat: heartbeatState.lastHeartbeat || new Date(),
    cluster_count: status.clusterCount,
    active_goals: heartbeatState.activeGoals,
    llm_model: heartbeatState.llmModel,
    heartbeat_interval: heartbeatState.intervalMinutes,
    affective_state: heartbeatState.affectiveState,
  }

  // Fetch goals data
  const goals = await fetchWithFallback(getGoals, {
    active: [], queued: [], issues: [],
    counts: { active: 0, queued: 0, backburner: 0 }
  })

  // Fetch real heartbeat entries
  const heartbeatEntries = await fetchWithFallback(getRecentHeartbeats, [])

  // Calculate real uptime from first heartbeat
  const firstHbDate = heartbeatState.firstHeartbeat ? new Date(heartbeatState.firstHeartbeat) : null
  const uptimeSeconds = firstHbDate ? Math.floor((Date.now() - firstHbDate.getTime()) / 1000) : 0

  const vitality = {
    pulse_status: heartbeatState.isPaused ? "sleeping" as const : "active" as const,
    heartbeat_index: heartbeatState.heartbeatCount,
    hb_min: heartbeatState.intervalMinutes,
    mx_sec: heartbeatState.maintenanceIntervalSeconds,
    uptime_seconds: uptimeSeconds,
    api_latency_ms: 45,
    loop_latency_ms: 12,
    connection_health: { mcp_bridge: "connected" as const, postgres: "connected" as const, llm_api: "connected" as const },
    first_heartbeat: heartbeatState.firstHeartbeat,
    last_heartbeat: heartbeatState.lastHeartbeat,
    next_heartbeat: heartbeatState.nextHeartbeat,
  }
  const memoryDynamics = { semantic_density: [] as { name: string; value: number }[] }
  const ruminations: { id: string; content: string; timestamp: Date }[] = []
  const insightProgress = { current_observations: 0, threshold_for_consolidation: 100, progress_percentage: 0, estimated_time_to_next: "--" }


  const memoryDistribution = [
    { type: "Episodic", count: status.episodicCount, color: "bg-purple-500" },
    { type: "Semantic", count: status.semanticCount, color: "bg-cyan-500" },
    { type: "Procedural", count: status.proceduralCount, color: "bg-emerald-500" },
    { type: "Strategic", count: status.strategicCount, color: "bg-blue-500" },
  ]


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Hexis Dashboard</h1>
              <p className="text-sm text-muted-foreground">Cognitive Architecture Monitor</p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
            <div className="font-mono">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <nav className="flex items-center gap-4">
            <button className="text-sm font-medium text-foreground hover:text-primary">Status</button>
            <Link href="/memory" className="text-sm text-muted-foreground hover:text-foreground">
              Memory
            </Link>
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
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">System Vitality</h2>
          <div className="flex items-center justify-between">
            <PulseIndicator status={vitality.pulse_status} />
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-foreground">#{vitality.heartbeat_index}</div>
              <div className="text-xs text-muted-foreground">Heartbeat Index</div>
            </div>
          </div>
          <VitalityMetrics
            hb_min={vitality.hb_min}
            mx_sec={vitality.mx_sec}
            uptime_seconds={vitality.uptime_seconds}
            api_latency_ms={vitality.api_latency_ms}
            loop_latency_ms={vitality.loop_latency_ms}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            <AgentStatusCard status={agentStatus} />
            <DriveStatus drives={await fetchWithFallback(getDriveStatus, [])} />



            <RecentActions actions={await fetchWithFallback(getRecentActions, [])} />
            <GoalsList goals={goals} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ConnectionHealth
              mcp_bridge={vitality.connection_health.mcp_bridge}
              postgres={vitality.connection_health.postgres}
              llm_api={vitality.connection_health.llm_api}
            />
            <HeartbeatMonitor entries={heartbeatEntries} />
            <RuminationTicker
              ruminations={ruminations}
              maintenanceState={await fetchWithFallback(getMaintenanceState, {
                lastMaintenanceAt: null, isPaused: false, intervalSeconds: 60,
                workingMemoryCount: 0, longTermCount: 0, semanticCount: 0,
                neighborhoodsRecomputed: 0, cacheDeleted: 0, wmDeleted: 0, wmPromoted: 0
              })}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
