// Core Hexis Types based on architecture

export type MemoryType = "episodic" | "semantic" | "procedural" | "strategic" | "working"

export interface EpisodicMemory {
  id: string
  timestamp: Date
  episode_id: string
  content: string
  emotional_valence: number
  importance: number
  embedding?: number[]
}

export interface SemanticMemory {
  id: string
  concept: string
  definition: string
  confidence: number
  sources: string[]
  last_updated: Date
}

export interface IdentityAspect {
  id: string
  aspect_type: "value" | "trait" | "belief" | "capability"
  content: string
  strength: number
  stability: number
}

export interface Goal {
  id: string
  description: string
  type: "terminal" | "instrumental"
  priority: number
  status: "active" | "achieved" | "abandoned"
  energy_allocated: number
  created_at: Date
  target_date?: Date
}

export interface WorldviewBelief {
  id: string
  category: string
  statement: string
  confidence: number
  evidence_count: number
  last_updated: Date
}

export interface CognitiveAction {
  id: string
  action_type: "reflect" | "inquire" | "synthesize" | "reach_out" | "plan" | "observe"
  timestamp: Date
  energy_cost: number
  input: string
  output: string
  success: boolean
}

export interface AgentStatus {
  agent_id: string
  name: string
  current_energy: number
  max_energy: number
  heartbeat_interval: number
  last_heartbeat: Date
  active_goals: number
  total_memories: number
  llm_model: string
  status: "active" | "idle" | "sleeping" | "error"
}

export interface HeartbeatCycle {
  id: string
  timestamp: Date
  phase: "observe" | "orient" | "decide" | "act" | "record"
  energy_before: number
  energy_after: number
  actions_taken: CognitiveAction[]
  duration_ms: number
}

export interface Relationship {
  id: string
  entity_name: string
  relationship_type: "user" | "agent" | "system"
  trust_level: number
  interaction_count: number
  last_interaction: Date
  summary: string
}

export interface Configuration {
  agent: {
    name: string
    heartbeat_interval: number
    max_energy: number
    energy_regen_rate: number
  }
  llm: {
    provider: string
    model: string
    temperature: number
    max_tokens: number
  }
  memory: {
    episodic_retention_days: number
    semantic_confidence_threshold: number
    working_memory_size: number
  }
  goals: {
    max_active_goals: number
    energy_allocation_strategy: "balanced" | "priority" | "adaptive"
  }
  guardrails: {
    max_energy_per_action: number
    require_approval_for_reach_out: boolean
    blocked_action_types: string[]
  }
}

export interface SystemVitality {
  heartbeat_index: number
  pulse_status: "active" | "sleeping" | "error"
  loop_latency_ms: number
  connection_health: {
    mcp_bridge: "connected" | "disconnected" | "error"
    postgres: "connected" | "disconnected" | "error"
    llm_api: "connected" | "disconnected" | "error"
  }
  uptime_seconds: number
  hb_min: number
  mx_sec: number
  api_latency_ms: number
}

export interface MemoryDynamics {
  memory_count: number
  semantic_density: {
    cluster_name: string
    size: number
    growth_rate: number
  }[]
  consolidation_rate: number // percentage of raw memories converted to insights
  importance_gradient: {
    highest: EpisodicMemory[]
    lowest: EpisodicMemory[]
  }
}

export interface GraphNode {
  id: string
  label: string
  type: "entity" | "concept" | "memory"
  size: number
  color?: string
}

export interface GraphEdge {
  source: string
  target: string
  type: string
  strength: number
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface RuminationEntry {
  id: string
  timestamp: Date
  content: string
  category: "reflection" | "synthesis" | "planning" | "observation"
}

export interface InsightProgress {
  current_observations: number
  threshold_for_consolidation: number
  progress_percentage: number
  estimated_time_to_next: number // seconds
}
