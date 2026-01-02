// Types matching the actual Hexis PostgreSQL schema
export type MemoryType = "episodic" | "semantic" | "procedural" | "strategic"
export type MemoryStatus = "active" | "archived" | "invalidated"
export type ClusterType = "theme" | "emotion" | "temporal" | "person" | "pattern" | "mixed"

export interface Memory {
  id: string
  created_at: string
  updated_at: string
  type: MemoryType
  status: MemoryStatus
  content: string
  embedding: number[]
  importance: number
  source_attribution: Record<string, any>
  trust_level: number
  trust_updated_at: string
  access_count: number
  last_accessed: string | null
  decay_rate: number
}

export interface EpisodicMemory extends Memory {
  action_taken: Record<string, any> | null
  context: Record<string, any> | null
  result: Record<string, any> | null
  emotional_valence: number | null
  verification_status: boolean | null
  event_time: string | null
}

export interface SemanticMemory extends Memory {
  confidence: number
  last_validated: string | null
  source_references: Record<string, any> | null
  contradictions: Record<string, any> | null
  category: string[] | null
  related_concepts: string[] | null
}

export interface Episode {
  id: string
  started_at: string
  ended_at: string | null
  episode_type: string | null
  summary: string | null
  summary_embedding: number[] | null
}

export interface MemoryCluster {
  id: string
  created_at: string
  updated_at: string
  cluster_type: ClusterType
  name: string
  description: string | null
  centroid_embedding: number[] | null
  emotional_signature: Record<string, any> | null
  keywords: string[] | null
  importance_score: number
  coherence_score: number | null
  last_activated: string | null
  activation_count: number
}

export interface WorldviewPrimitive {
  id: string
  category: string
  belief: string
  confidence: number | null
  emotional_valence: number | null
  stability_score: number | null
  connected_beliefs: string[] | null
  created_at: string
  updated_at: string
}

export interface IdentityAspect {
  id: string
  aspect_type: string
  content: Record<string, any>
  stability: number
  core_memory_clusters: string[] | null
  created_at: string
  updated_at: string
}

export interface Concept {
  id: string
  name: string
  ancestors: string[] | null
  path_text: string | null
  depth: number
  description: string | null
  created_at: string
}
