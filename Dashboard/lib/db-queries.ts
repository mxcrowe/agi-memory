import { sql } from "./db";
import type {
  EpisodicMemory,
  SemanticMemory,
  MemoryCluster,
  WorldviewPrimitive,
  IdentityAspect,
  Concept,
} from "./db-types";

// Get agent status metrics
export async function getAgentStatus() {
  const [memoryStats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active') as active_memories,
      COUNT(*) FILTER (WHERE type = 'episodic') as episodic_count,
      COUNT(*) FILTER (WHERE type = 'semantic') as semantic_count,
      COUNT(*) FILTER (WHERE type = 'procedural') as procedural_count,
      COUNT(*) FILTER (WHERE type = 'strategic') as strategic_count,
      AVG(importance) as avg_importance,
      AVG(trust_level) as avg_trust
    FROM memories
  `;

  const [clusterStats] = await sql`
    SELECT COUNT(*) as cluster_count
    FROM memory_clusters
  `;

  const [recentActivity] = await sql`
    SELECT
      MAX(created_at) as last_memory_created,
      MAX(last_accessed) as last_memory_accessed
    FROM memories
  `;

  return {
    totalMemories: Number.parseInt(memoryStats.active_memories || "0"),
    episodicCount: Number.parseInt(memoryStats.episodic_count || "0"),
    semanticCount: Number.parseInt(memoryStats.semantic_count || "0"),
    proceduralCount: Number.parseInt(memoryStats.procedural_count || "0"),
    strategicCount: Number.parseInt(memoryStats.strategic_count || "0"),
    clusterCount: Number.parseInt(clusterStats.cluster_count || "0"),
    avgImportance: Number.parseFloat(memoryStats.avg_importance || "0"),
    avgTrust: Number.parseFloat(memoryStats.avg_trust || "0"),
    lastActivity:
      recentActivity.last_memory_created || new Date().toISOString(),
  };
}

// Get heartbeat state (energy, heartbeat count, last heartbeat time)
export async function getHeartbeatState() {
  const [state] = await sql`
    SELECT
      current_energy,
      heartbeat_count,
      last_heartbeat_at,
      next_heartbeat_at,
      is_paused,
      affective_state
    FROM heartbeat_state
    WHERE id = 1
  `;

  const [config] = await sql`
    SELECT
      (SELECT value FROM heartbeat_config WHERE key = 'max_energy') as max_energy,
      (SELECT value FROM heartbeat_config WHERE key = 'heartbeat_interval_minutes') as interval_minutes,
      (SELECT value FROM maintenance_config WHERE key = 'maintenance_interval_seconds') as maintenance_interval
  `;

  const [goalCount] = await sql`
    SELECT COUNT(*) as count FROM goals WHERE priority = 'active'
  `;

  const [firstHb] = await sql`
    SELECT MIN(started_at) as first_heartbeat FROM heartbeat_log
  `;

  const [llmConfig] = await sql`
    SELECT value FROM config WHERE key = 'llm.heartbeat'
  `;

  // Get heartbeat count in last 24 hours
  const [hb24h] = await sql`
    SELECT COUNT(*) as count FROM heartbeat_log WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
  `;

  // Parse affective state JSONB
  const affective = state?.affective_state || {};

  // Trend calculation disabled - affective_end column doesn't exist in heartbeat_log yet
  // TODO: Add affective_end column to heartbeat_log via schema update, then enable trends
  const valenceTrend: "up" | "down" | "flat" = "flat";
  const arousalTrend: "up" | "down" | "flat" = "flat";
  const dominanceTrend: "up" | "down" | "flat" = "flat";

  // Get unread message count from outbox (pending = not yet sent = unread by user)
  const [unreadCount] = await sql`
    SELECT COUNT(*) as count FROM outbox_messages WHERE status = 'pending'
  `;

  return {
    currentEnergy: Number.parseFloat(state?.current_energy || "10"),
    maxEnergy: Number.parseFloat(config?.max_energy || "20"),
    heartbeatCount: Number.parseInt(state?.heartbeat_count || "0"),
    firstHeartbeat: firstHb?.first_heartbeat || null,
    lastHeartbeat: state?.last_heartbeat_at || null,
    nextHeartbeat: state?.next_heartbeat_at || null,
    isPaused: state?.is_paused || false,
    intervalMinutes: Number.parseInt(config?.interval_minutes || "60"),
    maintenanceIntervalSeconds: Number.parseInt(
      config?.maintenance_interval || "300"
    ),
    activeGoals: Number.parseInt(goalCount?.count || "0"),
    llmModel:
      (typeof llmConfig?.value === "object"
        ? llmConfig.value.model
        : llmConfig?.value) || "unknown",
    affectiveState: {
      valence: Number.parseFloat(affective.valence || "0"),
      arousal: Number.parseFloat(affective.arousal || "0"),
      dominance: Number.parseFloat(affective.dominance || "0.5"),
      primaryEmotion: affective.primary_emotion || "neutral",
      valenceTrend,
      arousalTrend,
      dominanceTrend,
    },
    unreadMessages: Number.parseInt(unreadCount?.count || "0"),
    heartbeats24h: Number.parseInt(hb24h?.count || "0"),
  };
}

// Get energy details from the last heartbeat
export async function getLastHeartbeatEnergy() {
  const [lastHb] = await sql`
    SELECT
      heartbeat_number,
      energy_start,
      energy_end,
      actions_taken,
      decision_reasoning
    FROM heartbeat_log
    ORDER BY started_at DESC
    LIMIT 1
  `;

  if (!lastHb) {
    return {
      heartbeatNumber: 0,
      energyStart: 0,
      energyEnd: 0,
      totalCost: 0,
      recharge: 10, // default recharge amount
      actionCosts: [] as { action: string; cost: number }[],
    };
  }

  // Get all action costs from config
  const costConfigs = await sql`
    SELECT key, value FROM heartbeat_config WHERE key LIKE 'cost_%'
  `;
  const costLookup: Record<string, number> = {};
  for (const c of costConfigs) {
    const actionName = String(c.key).replace("cost_", "");
    costLookup[actionName] = Number(c.value);
  }

  // Calculate costs from actions (use stored cost if present, otherwise lookup from config)
  const actions = (lastHb.actions_taken || []) as {
    action: string;
    cost?: number;
  }[];
  const actionCosts = actions.map((a) => ({
    action: a.action,
    cost: a.cost ?? costLookup[a.action] ?? 0,
  }));
  const totalCost = actionCosts.reduce((sum, a) => sum + a.cost, 0);

  // Recharge is the difference between expected end and actual end (after +10)
  // Or we can get it from config
  const [rechargeConfig] = await sql`
    SELECT value FROM heartbeat_config WHERE key = 'base_regeneration'
  `;
  const recharge = Number(rechargeConfig?.value || 10);

  return {
    heartbeatNumber: lastHb.heartbeat_number,
    energyStart: Number(lastHb.energy_start || 0),
    energyEnd: Number(lastHb.energy_end || 0),
    totalCost,
    recharge,
    actionCosts,
    decisionReasoning: (lastHb.decision_reasoning as string) || null,
  };
}

// Get drive status from drive_status view
export async function getDriveStatus() {
  const drives = await sql`
    SELECT
      name,
      current_level,
      baseline,
      urgency_threshold,
      (current_level >= urgency_threshold) as is_urgent,
      ROUND((current_level / NULLIF(urgency_threshold, 0) * 100)::numeric, 1) as urgency_percent,
      last_satisfied
    FROM drives
    ORDER BY current_level DESC
  `;

  // Calculate average drive level
  const [avgResult] = await sql`SELECT AVG(current_level) as avg FROM drives`;
  const avgDriveLevel = Number(avgResult?.avg) || 0;

  return {
    drives: drives as unknown as {
      name: string;
      current_level: number;
      baseline: number;
      urgency_threshold: number;
      is_urgent: boolean;
      urgency_percent: number;
      last_satisfied: Date | null;
    }[],
    avgDriveLevel,
  };
}

// Get maintenance/subconscious state
export async function getMaintenanceState() {
  const [state] = await sql`
    SELECT
      last_maintenance_at,
      is_paused,
      updated_at
    FROM maintenance_state
    WHERE id = 1
  `;

  const [config] = await sql`
    SELECT value FROM maintenance_config WHERE key = 'maintenance_interval_seconds'
  `;

  // Get memory stats from correct tables
  const [stats] = await sql`
    SELECT
      (SELECT COUNT(*) FROM working_memory) as working_memory_count,
      (SELECT COUNT(*) FROM memories WHERE status = 'active') as long_term_count,
      (SELECT COUNT(*) FROM memories WHERE type = 'semantic' AND status = 'active') as semantic_count
  `;

  // Get latest maintenance log entry (may not exist yet)
  const [latestLog] = await sql`
    SELECT
      neighborhoods_recomputed,
      embedding_cache_deleted,
      working_memory_deleted,
      working_memory_promoted
    FROM maintenance_log
    ORDER BY ran_at DESC
    LIMIT 1
  `;

  // Get pending external calls count
  const [cogHealth] = await sql`SELECT pending_calls FROM cognitive_health`;

  return {
    lastMaintenanceAt: state?.last_maintenance_at || null,
    isPaused: state?.is_paused || false,
    intervalSeconds: Math.round(Number(config?.value) || 60),
    workingMemoryCount: Number.parseInt(stats?.working_memory_count || "0"),
    longTermCount: Number.parseInt(stats?.long_term_count || "0"),
    semanticCount: Number.parseInt(stats?.semantic_count || "0"),
    // Latest maintenance stats
    neighborhoodsRecomputed: Number.parseInt(
      latestLog?.neighborhoods_recomputed || "0"
    ),
    cacheDeleted: Number.parseInt(latestLog?.embedding_cache_deleted || "0"),
    wmDeleted: Number.parseInt(latestLog?.working_memory_deleted || "0"),
    wmPromoted: Number.parseInt(latestLog?.working_memory_promoted || "0"),
    pendingCalls: Number.parseInt(cogHealth?.pending_calls || "0"),
  };
}

// Get recent actions from heartbeat log
export async function getRecentActions(limit = 30) {
  const results = await sql`
    SELECT
      heartbeat_number,
      started_at,
      actions_taken
    FROM heartbeat_log
    WHERE actions_taken IS NOT NULL
      AND jsonb_array_length(actions_taken) > 0
    ORDER BY started_at DESC
    LIMIT ${limit}
  `;

  // Get all action costs from config
  const costConfigs = await sql`
    SELECT key, value FROM heartbeat_config WHERE key LIKE 'cost_%'
  `;
  const costLookup: Record<string, number> = {};
  for (const c of costConfigs) {
    const actionName = String(c.key).replace("cost_", "");
    costLookup[actionName] = Number(c.value);
  }

  // Collect all external_call_ids from action results
  const externalCallIds: string[] = [];
  for (const row of results) {
    const actionsArray = row.actions_taken as {
      result?: { external_call_id?: string };
    }[];
    for (const a of actionsArray) {
      if (a.result?.external_call_id) {
        externalCallIds.push(a.result.external_call_id);
      }
    }
  }

  // Fetch external_calls outputs if we have any IDs
  const externalCallOutputs: Record<string, unknown> = {};
  if (externalCallIds.length > 0) {
    const externalCalls = await sql`
      SELECT id::text, output, status
      FROM external_calls
      WHERE id = ANY(${externalCallIds}::uuid[])
    `;
    for (const ec of externalCalls) {
      if (ec.output) {
        externalCallOutputs[ec.id] = ec.output;
      }
    }
  }

  // Flatten actions from multiple heartbeats and enrich with external call outputs
  const actions: {
    heartbeatNumber: number;
    timestamp: Date;
    action: string;
    params?: Record<string, unknown>;
    result?: Record<string, unknown>;
    externalOutput?: Record<string, unknown>;
    cost: number;
  }[] = [];

  for (const row of results) {
    const actionsArray = row.actions_taken as {
      action: string;
      params?: Record<string, unknown>;
      result?: Record<string, unknown>;
      cost?: number;
    }[];
    for (const a of actionsArray) {
      // Get external call output if available
      const extCallId = a.result?.external_call_id as string | undefined;
      const externalOutput = extCallId
        ? (externalCallOutputs[extCallId] as
            | Record<string, unknown>
            | undefined)
        : undefined;

      actions.push({
        heartbeatNumber: row.heartbeat_number,
        timestamp: row.started_at,
        action: a.action,
        params: a.params,
        result: a.result,
        externalOutput,
        cost: a.cost ?? costLookup[a.action] ?? 0,
      });
    }
  }

  return actions;
}

// Get goals from goals_snapshot
export async function getGoals() {
  const [result] = await sql`SELECT get_goals_snapshot() as snapshot`;
  const snapshot = result?.snapshot || {
    active: [],
    queued: [],
    issues: [],
    counts: { active: 0, queued: 0, backburner: 0 },
  };

  // Get blocked count from cognitive_health
  const [cogHealth] = await sql`SELECT blocked_goals FROM cognitive_health`;
  const blockedCount = Number(cogHealth?.blocked_goals) || 0;

  return {
    active: snapshot.active as {
      id: string;
      title: string;
      description: string;
      due_at: string | null;
      last_touched: string;
      progress_count: number;
      blocked_by: string | null;
      metrics: {
        target?: number;
        target_met?: boolean;
        relationships_created?: number;
        worldview_beliefs?: number;
      } | null;
    }[],
    queued: snapshot.queued as {
      id: string;
      title: string;
      source: string;
      due_at: string | null;
    }[],
    issues: snapshot.issues as {
      goal_id: string;
      title: string;
      issue: string;
      due_at: string | null;
      days_since_touched: number;
    }[],
    counts: {
      ...(snapshot.counts as {
        active: number;
        queued: number;
        backburner: number;
      }),
      blocked: blockedCount,
    },
  };
}

// Get recent heartbeat log entries
export async function getRecentHeartbeats(limit = 15) {
  const heartbeats = await sql`
    SELECT
      id::text,
      heartbeat_number,
      started_at,
      energy_start,
      energy_end,
      narrative,
      emotional_valence
    FROM heartbeat_log
    ORDER BY started_at DESC
    LIMIT ${limit}
  `;
  return heartbeats as unknown as {
    id: string;
    heartbeat_number: number;
    started_at: Date;
    energy_start: number;
    energy_end: number;
    narrative: string | null;
    emotional_valence: number | null;
  }[];
}

// Get recent episodic memories
export async function getRecentEpisodicMemories(
  limit = 20
): Promise<EpisodicMemory[]> {
  const memories = await sql`
    SELECT
      m.*,
      em.action_taken,
      em.context,
      em.result,
      em.emotional_valence,
      em.verification_status,
      em.event_time
    FROM memories m
    JOIN episodic_memories em ON m.id = em.memory_id
    WHERE m.status = 'active'
    ORDER BY m.created_at DESC
    LIMIT ${limit}
  `;

  return memories as unknown as EpisodicMemory[];
}

// Get semantic memories
export async function getSemanticMemories(
  limit = 50
): Promise<SemanticMemory[]> {
  const memories = await sql`
    SELECT
      m.*,
      sm.confidence,
      sm.last_validated,
      sm.source_references,
      sm.contradictions,
      sm.category,
      sm.related_concepts
    FROM memories m
    JOIN semantic_memories sm ON m.id = sm.memory_id
    WHERE m.status = 'active'
    ORDER BY m.importance DESC, m.created_at DESC
    LIMIT ${limit}
  `;

  return memories as unknown as SemanticMemory[];
}

// Get episodes with memory counts
export async function getEpisodes(limit = 10) {
  const episodes = await sql`
    SELECT
      e.*,
      COUNT(em.memory_id) as memory_count
    FROM episodes e
    LEFT JOIN episode_memories em ON e.id = em.episode_id
    GROUP BY e.id
    ORDER BY e.started_at DESC
    LIMIT ${limit}
  `;

  return episodes;
}

// Get memory clusters
export async function getMemoryClusters(limit = 20): Promise<MemoryCluster[]> {
  const clusters = await sql`
    SELECT
      mc.*,
      COUNT(mcm.memory_id) as member_count
    FROM memory_clusters mc
    LEFT JOIN memory_cluster_members mcm ON mc.id = mcm.cluster_id
    GROUP BY mc.id
    ORDER BY mc.importance_score DESC, mc.last_activated DESC NULLS LAST
    LIMIT ${limit}
  `;

  return clusters as unknown as MemoryCluster[];
}

// Get worldview primitives
export async function getWorldviewPrimitives(): Promise<WorldviewPrimitive[]> {
  const worldview = await sql`
    SELECT *
    FROM worldview_primitives
    ORDER BY confidence DESC NULLS LAST, created_at DESC
  `;

  return worldview as unknown as WorldviewPrimitive[];
}

// Get identity aspects
export async function getIdentityAspects(): Promise<IdentityAspect[]> {
  const aspects = await sql`
    SELECT *
    FROM identity_aspects
    ORDER BY stability DESC, aspect_type
  `;

  return aspects as unknown as IdentityAspect[];
}

// Get concepts for knowledge graph
export async function getConcepts(limit = 100): Promise<Concept[]> {
  const concepts = await sql`
    SELECT
      c.*,
      COUNT(mc.memory_id) as memory_count
    FROM concepts c
    LEFT JOIN memory_concepts mc ON c.id = mc.concept_id
    GROUP BY c.id
    ORDER BY memory_count DESC, c.name
    LIMIT ${limit}
  `;

  return concepts as unknown as Concept[];
}

// Get memory dynamics for visualization
export async function getMemoryDynamics() {
  // Get memory creation over time (last 30 days)
  const creationTimeline = await sql`
    SELECT
      DATE(created_at) as date,
      type,
      COUNT(*) as count
    FROM memories
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at), type
    ORDER BY date DESC
  `;

  // Get cluster growth
  const clusterGrowth = await sql`
    SELECT
      DATE(created_at) as date,
      cluster_type,
      COUNT(*) as count
    FROM memory_clusters
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at), cluster_type
    ORDER BY date DESC
  `;

  // Get importance distribution
  const importanceDistribution = await sql`
    SELECT
      CASE
        WHEN importance < 0.2 THEN 'very_low'
        WHEN importance < 0.4 THEN 'low'
        WHEN importance < 0.6 THEN 'medium'
        WHEN importance < 0.8 THEN 'high'
        ELSE 'very_high'
      END as importance_level,
      COUNT(*) as count
    FROM memories
    WHERE status = 'active'
    GROUP BY importance_level
  `;

  return {
    creationTimeline,
    clusterGrowth,
    importanceDistribution,
  };
}

// Get system vitality metrics
export async function getVitalityMetrics() {
  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active') as active_count,
      AVG(importance) as avg_importance,
      AVG(trust_level) as avg_trust,
      MAX(created_at) as last_created
    FROM memories
  `;

  const [workingMemory] = await sql`
    SELECT COUNT(*) as count
    FROM working_memory
    WHERE expiry > NOW() OR expiry IS NULL
  `;

  return {
    activeMemories: Number.parseInt(stats.active_count || "0"),
    avgImportance: Number.parseFloat(stats.avg_importance || "0"),
    avgTrust: Number.parseFloat(stats.avg_trust || "0"),
    workingMemoryCount: Number.parseInt(workingMemory.count || "0"),
    lastActivity: stats.last_created,
  };
}
