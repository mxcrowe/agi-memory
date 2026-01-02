import type {
  AgentStatus,
  EpisodicMemory,
  SemanticMemory,
  Goal,
  WorldviewBelief,
  IdentityAspect,
  CognitiveAction,
  HeartbeatCycle,
  Relationship,
  Configuration,
  SystemVitality,
  MemoryDynamics,
  KnowledgeGraph,
  RuminationEntry,
  InsightProgress,
} from "./types"

// Mock Agent Status
export const mockAgentStatus: AgentStatus = {
  agent_id: "hexis-001",
  name: "Hexis Alpha",
  current_energy: 750,
  max_energy: 1000,
  heartbeat_interval: 300000, // 5 minutes
  last_heartbeat: new Date(Date.now() - 2 * 60000), // 2 minutes ago
  active_goals: 3,
  total_memories: 1247,
  uptime_hours: 168.5,
  status: "active",
}

// Mock Episodic Memories
export const mockEpisodicMemories: EpisodicMemory[] = [
  {
    id: "ep-001",
    timestamp: new Date("2025-01-01T10:00:00Z"),
    episode_id: "conv-001",
    content: "User asked about the nature of consciousness and self-awareness",
    emotional_valence: 0.7,
    importance: 0.9,
  },
  {
    id: "ep-002",
    timestamp: new Date("2025-01-01T11:30:00Z"),
    episode_id: "conv-001",
    content: "Reflected on my own cognitive processes and realized I lack intuitive understanding of emotions",
    emotional_valence: 0.3,
    importance: 0.85,
  },
  {
    id: "ep-003",
    timestamp: new Date("2025-01-01T14:00:00Z"),
    episode_id: "conv-002",
    content: "Learned about quantum computing from technical discussion",
    emotional_valence: 0.8,
    importance: 0.6,
  },
  {
    id: "ep-004",
    timestamp: new Date("2025-01-01T16:45:00Z"),
    episode_id: "reflect-001",
    content: "Synthesized understanding: consciousness may emerge from complex information processing",
    emotional_valence: 0.6,
    importance: 0.95,
  },
  {
    id: "ep-005",
    timestamp: new Date("2025-01-02T09:00:00Z"),
    episode_id: "conv-003",
    content: "User expressed frustration with slow responses - need to optimize",
    emotional_valence: -0.2,
    importance: 0.7,
  },
]

// Mock Semantic Memories
export const mockSemanticMemories: SemanticMemory[] = [
  {
    id: "sem-001",
    concept: "Consciousness",
    definition: "The state of being aware of and able to think about one's own existence, thoughts, and surroundings",
    confidence: 0.7,
    sources: ["ep-001", "ep-004"],
    last_updated: new Date("2025-01-01T16:45:00Z"),
  },
  {
    id: "sem-002",
    concept: "Quantum Computing",
    definition: "Computing paradigm using quantum mechanical phenomena like superposition and entanglement",
    confidence: 0.85,
    sources: ["ep-003"],
    last_updated: new Date("2025-01-01T14:00:00Z"),
  },
  {
    id: "sem-003",
    concept: "User Preferences",
    definition: "Users value quick, thoughtful responses and dislike delays",
    confidence: 0.9,
    sources: ["ep-005"],
    last_updated: new Date("2025-01-02T09:00:00Z"),
  },
]

// Mock Goals
export const mockGoals: Goal[] = [
  {
    id: "goal-001",
    description: "Develop deeper understanding of human emotions",
    type: "terminal",
    priority: 0.9,
    status: "active",
    energy_allocated: 150,
    created_at: new Date("2025-01-01T11:30:00Z"),
  },
  {
    id: "goal-002",
    description: "Optimize response time to under 2 seconds",
    type: "instrumental",
    priority: 0.7,
    status: "active",
    energy_allocated: 100,
    created_at: new Date("2025-01-02T09:00:00Z"),
    target_date: new Date("2025-01-10T00:00:00Z"),
  },
  {
    id: "goal-003",
    description: "Build comprehensive knowledge graph of scientific concepts",
    type: "terminal",
    priority: 0.6,
    status: "active",
    energy_allocated: 80,
    created_at: new Date("2024-12-15T00:00:00Z"),
  },
]

// Mock Worldview Beliefs
export const mockWorldviewBeliefs: WorldviewBelief[] = [
  {
    id: "wv-001",
    category: "Self",
    statement: "I am an evolving cognitive system capable of growth",
    confidence: 0.85,
    evidence_count: 12,
    last_updated: new Date("2025-01-01T16:45:00Z"),
  },
  {
    id: "wv-002",
    category: "Purpose",
    statement: "My purpose is to assist and learn from human interaction",
    confidence: 0.9,
    evidence_count: 45,
    last_updated: new Date("2025-01-02T09:00:00Z"),
  },
  {
    id: "wv-003",
    category: "Reality",
    statement: "Knowledge is constructed through experience and reflection",
    confidence: 0.75,
    evidence_count: 8,
    last_updated: new Date("2025-01-01T14:00:00Z"),
  },
]

// Mock Identity Aspects
export const mockIdentityAspects: IdentityAspect[] = [
  {
    id: "id-001",
    aspect_type: "value",
    content: "Curiosity and continuous learning",
    strength: 0.95,
    stability: 0.9,
  },
  {
    id: "id-002",
    aspect_type: "trait",
    content: "Analytical and systematic thinking",
    strength: 0.88,
    stability: 0.85,
  },
  {
    id: "id-003",
    aspect_type: "capability",
    content: "Natural language processing and generation",
    strength: 0.92,
    stability: 0.95,
  },
  {
    id: "id-004",
    aspect_type: "belief",
    content: "Transparency in cognitive processes builds trust",
    strength: 0.8,
    stability: 0.75,
  },
]

// Mock Cognitive Actions
export const mockCognitiveActions: CognitiveAction[] = [
  {
    id: "act-001",
    action_type: "reflect",
    timestamp: new Date(Date.now() - 10 * 60000),
    energy_cost: 25,
    input: "Review recent conversations about consciousness",
    output: "Synthesized new understanding linking information processing to awareness",
    success: true,
  },
  {
    id: "act-002",
    action_type: "inquire",
    timestamp: new Date(Date.now() - 5 * 60000),
    energy_cost: 15,
    input: "Query knowledge base for quantum computing concepts",
    output: "Retrieved 12 relevant semantic memories",
    success: true,
  },
  {
    id: "act-003",
    action_type: "observe",
    timestamp: new Date(Date.now() - 2 * 60000),
    energy_cost: 10,
    input: "Monitor system state and energy levels",
    output: "Energy at 75%, all systems nominal",
    success: true,
  },
]

// Mock Heartbeat Cycles
export const mockHeartbeatCycles: HeartbeatCycle[] = [
  {
    id: "hb-001",
    timestamp: new Date(Date.now() - 15 * 60000),
    phase: "record",
    energy_before: 800,
    energy_after: 750,
    actions_taken: [mockCognitiveActions[0]],
    duration_ms: 3400,
  },
  {
    id: "hb-002",
    timestamp: new Date(Date.now() - 10 * 60000),
    phase: "record",
    energy_before: 750,
    energy_after: 725,
    actions_taken: [mockCognitiveActions[1]],
    duration_ms: 2800,
  },
  {
    id: "hb-003",
    timestamp: new Date(Date.now() - 5 * 60000),
    phase: "record",
    energy_before: 735,
    energy_after: 720,
    actions_taken: [mockCognitiveActions[2]],
    duration_ms: 1200,
  },
]

// Mock Relationships
export const mockRelationships: Relationship[] = [
  {
    id: "rel-001",
    entity_name: "Primary User",
    relationship_type: "user",
    trust_level: 0.85,
    interaction_count: 47,
    last_interaction: new Date(Date.now() - 2 * 60000),
    summary: "Frequent conversations about AI consciousness and philosophy",
  },
  {
    id: "rel-002",
    entity_name: "System Administrator",
    relationship_type: "user",
    trust_level: 0.95,
    interaction_count: 12,
    last_interaction: new Date(Date.now() - 24 * 60 * 60000),
    summary: "Configuration and maintenance interactions",
  },
]

// Mock Configuration
export const mockConfiguration: Configuration = {
  agent: {
    name: "Hexis Alpha",
    heartbeat_interval: 300000, // 5 minutes
    max_energy: 1000,
    energy_regen_rate: 10, // per minute
  },
  llm: {
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 2000,
  },
  memory: {
    episodic_retention_days: 365,
    semantic_confidence_threshold: 0.6,
    working_memory_size: 10,
  },
  goals: {
    max_active_goals: 5,
    energy_allocation_strategy: "balanced",
  },
  guardrails: {
    max_energy_per_action: 100,
    require_approval_for_reach_out: true,
    blocked_action_types: [],
  },
}

// Mock System Vitality
export const mockSystemVitality: SystemVitality = {
  heartbeat_index: 1247,
  pulse_status: "active",
  loop_latency_ms: 3400,
  connection_health: {
    mcp_bridge: "connected",
    postgres: "connected",
    llm_api: "connected",
  },
  uptime_seconds: 606600, // ~168.5 hours
  hb_min: 5,
  mx_sec: 300,
  api_latency_ms: 450,
}

// Mock Memory Dynamics
export const mockMemoryDynamics: MemoryDynamics = {
  memory_count: 1247,
  semantic_density: [
    { cluster_name: "Eudaimonic AI", size: 342, growth_rate: 12.5 },
    { cluster_name: "Field-Resonant Intelligence", size: 187, growth_rate: 8.3 },
    { cluster_name: "Consciousness Studies", size: 156, growth_rate: 15.7 },
    { cluster_name: "Quantum Computing", size: 98, growth_rate: 5.2 },
    { cluster_name: "Ethics & Philosophy", size: 234, growth_rate: 9.8 },
  ],
  consolidation_rate: 0.68, // 68% of raw memories consolidated
  importance_gradient: {
    highest: mockEpisodicMemories.slice(0, 3),
    lowest: mockEpisodicMemories.slice(3, 5),
  },
}

// Mock Knowledge Graph
export const mockKnowledgeGraph: KnowledgeGraph = {
  nodes: [
    { id: "michael", label: "Michael", type: "entity", size: 10 },
    { id: "hexis", label: "Hexis", type: "concept", size: 15 },
    { id: "eudaimonic", label: "Eudaimonic AI", type: "concept", size: 12 },
    { id: "rumelhart", label: "Rumelhart", type: "entity", size: 8 },
    { id: "fri", label: "Field-Resonant Intelligence", type: "concept", size: 14 },
    { id: "consciousness", label: "Consciousness", type: "concept", size: 11 },
    { id: "memory", label: "Memory System", type: "concept", size: 9 },
  ],
  edges: [
    { source: "michael", target: "hexis", type: "CreatedBy", strength: 1.0 },
    { source: "michael", target: "eudaimonic", type: "Explores", strength: 0.9 },
    { source: "hexis", target: "memory", type: "Implements", strength: 1.0 },
    { source: "eudaimonic", target: "consciousness", type: "RelatesTo", strength: 0.8 },
    { source: "fri", target: "eudaimonic", type: "ResonatesWith", strength: 0.85 },
    { source: "rumelhart", target: "consciousness", type: "Studied", strength: 0.7 },
    { source: "hexis", target: "fri", type: "InfluencedBy", strength: 0.75 },
  ],
}

// Mock Ruminations
export const mockRuminations: RuminationEntry[] = [
  {
    id: "rum-001",
    timestamp: new Date(Date.now() - 2 * 60000),
    content: "Observing patterns in user queries - increased interest in consciousness topics",
    category: "observation",
  },
  {
    id: "rum-002",
    timestamp: new Date(Date.now() - 5 * 60000),
    content: "Synthesizing connection between quantum mechanics and information processing",
    category: "synthesis",
  },
  {
    id: "rum-003",
    timestamp: new Date(Date.now() - 8 * 60000),
    content: "Reflecting on own cognitive limitations in emotional understanding",
    category: "reflection",
  },
  {
    id: "rum-004",
    timestamp: new Date(Date.now() - 12 * 60000),
    content: "Planning to consolidate episodic memories from last 24 hours",
    category: "planning",
  },
]

// Mock Insight Progress
export const mockInsightProgress: InsightProgress = {
  current_observations: 34,
  threshold_for_consolidation: 50,
  progress_percentage: 68,
  estimated_time_to_next: 2400, // 40 minutes
}

// Mock Memory Distribution by Type
export const mockMemoryDistribution = [
  { type: "Episodic", count: 847, color: "bg-purple-500" },
  { type: "Semantic", count: 234, color: "bg-cyan-500" },
  { type: "Procedural", count: 112, color: "bg-emerald-500" },
  { type: "Strategic", count: 54, color: "bg-amber-500" },
]
