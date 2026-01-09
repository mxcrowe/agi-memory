#!/usr/bin/env python3
"""
Hexis API wrapper for Claude Code (read-only safe access).

This module provides a convenient interface to call any Hexis tool
that the MCP server exposes, directly from Python.

Usage:
    from hexis_code_api import HexisAPI

    api = HexisAPI()
    await api.get_health()
    await api.hydrate("What am I currently thinking about?")
    await api.recall("memory concept", limit=5)
"""

import asyncio
from typing import Any, Optional
from cognitive_memory_api import CognitiveMemory, MemoryType, MemoryInput, GoalPriority
import json
import os


class HexisAPI:
    """Safe, read-only interface to Hexis cognitive memory system."""

    def __init__(
        self,
        host: str = "localhost",
        port: int = 5432,
        db: str = "agi_db",
        user: str = "agi_user",
        password: str = "agi_password",
    ):
        """Initialize connection to Hexis database.

        Args:
            host: PostgreSQL hostname
            port: PostgreSQL port
            db: Database name
            user: Database user
            password: Database password
        """
        self.dsn = f"postgresql://{user}:{password}@{host}:{port}/{db}"
        self.client = None
        self._context = None

    async def __aenter__(self):
        """Context manager entry."""
        self._context = CognitiveMemory.connect(self.dsn)
        self.client = await self._context.__aenter__()
        return self

    async def __aexit__(self, *args):
        """Context manager exit."""
        if self._context:
            await self._context.__aexit__(*args)
            self.client = None

    # ==================== HEALTH & STATE ====================

    async def get_health(self) -> dict[str, Any]:
        """Get cognitive health metrics.

        Returns:
            Dictionary with health data including:
            - energy, max_energy
            - avg_drive_level, urgent_drives
            - active_goals, blocked_goals
            - total_memories, stale_neighborhoods
            - current_emotion, current_valence
            - heartbeats_24h, relationships_discovered_24h
            - pending_calls
        """
        return await self.client.get_health()

    async def get_drives(self) -> dict[str, Any]:
        """Get current drive levels."""
        return await self.client.get_drives()

    async def get_identity(self) -> list[dict[str, Any]]:
        """Get identity aspects (purpose, values, self-concept, agency, boundary)."""
        return await self.client.get_identity()

    async def get_worldview(self) -> list[dict[str, Any]]:
        """Get worldview primitives (beliefs about the world)."""
        return await self.client.get_worldview()

    async def get_goals(
        self, priority: Optional[GoalPriority] = None
    ) -> list[dict[str, Any]]:
        """Get goals, optionally filtered by priority.

        Args:
            priority: Optional GoalPriority to filter by (GoalPriority.ACTIVE, etc.)

        Returns:
            List of goal objects
        """
        return await self.client.get_goals(priority=priority)

    # ==================== MEMORY RETRIEVAL ====================

    async def hydrate(
        self,
        query: str,
        memory_limit: int = 10,
        include_partial: bool = True,
        include_identity: bool = True,
        include_worldview: bool = True,
        include_emotional_state: bool = True,
        include_goals: bool = False,
        include_drives: bool = True,
    ) -> dict[str, Any]:
        """Primary RAG entry point - hydrate context for a query.

        Args:
            query: The question or context needed
            memory_limit: Max memories to retrieve
            include_partial: Include partial memory matches
            include_identity: Include identity aspects
            include_worldview: Include worldview beliefs
            include_emotional_state: Include current emotional state
            include_goals: Include goals
            include_drives: Include drive levels

        Returns:
            Dictionary containing retrieved memories and specified context
        """
        return await self.client.hydrate(
            query,
            memory_limit=memory_limit,
            include_partial=include_partial,
            include_identity=include_identity,
            include_worldview=include_worldview,
            include_emotional_state=include_emotional_state,
            include_goals=include_goals,
            include_drives=include_drives,
        )

    async def recall(
        self, query: str, limit: int = 10, memory_type: Optional[MemoryType] = None
    ) -> list[dict[str, Any]]:
        """Search memories by semantic similarity.

        Args:
            query: Search query
            limit: Max results to return
            memory_type: Optional memory type filter

        Returns:
            List of matching memories
        """
        return await self.client.recall(query, limit=limit, memory_type=memory_type)

    async def recall_by_id(self, memory_id: str) -> Optional[dict[str, Any]]:
        """Fetch a specific memory by UUID.

        Args:
            memory_id: UUID of the memory

        Returns:
            Memory object or None if not found
        """
        return await self.client.recall_by_id(memory_id)

    async def recall_recent(
        self, limit: int = 10, memory_type: Optional[MemoryType] = None
    ) -> list[dict[str, Any]]:
        """Fetch recent memories, optionally filtered by type.

        Args:
            limit: Max results
            memory_type: Optional memory type filter

        Returns:
            List of recent memories
        """
        return await self.client.recall_recent(limit=limit, memory_type=memory_type)

    async def search_working(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        """Search working memory (short-term buffer).

        Args:
            query: Search query
            limit: Max results

        Returns:
            List of working memory entries
        """
        return await self.client.search_working(query, limit=limit)

    # ==================== GRAPH EXPLORATION ====================

    async def find_causes(self, memory_id: str) -> list[dict[str, Any]]:
        """Trace causal chain leading to a memory.

        Args:
            memory_id: UUID of the memory to trace

        Returns:
            List of causal memories
        """
        return await self.client.find_causes(memory_id)

    async def find_contradictions(self, limit: int = 10) -> list[dict[str, Any]]:
        """Find contradictions in the memory graph.

        Args:
            limit: Max contradictions to return

        Returns:
            List of contradictory memory pairs
        """
        return await self.client.find_contradictions(limit=limit)

    async def find_supporting_evidence(
        self, worldview_id: str, limit: int = 10
    ) -> list[dict[str, Any]]:
        """Find memories that support a worldview belief.

        Args:
            worldview_id: ID of the belief
            limit: Max supporting memories

        Returns:
            List of supporting memories
        """
        return await self.client.find_supporting_evidence(worldview_id, limit=limit)

    # ==================== CONCEPT LINKING ====================

    async def find_by_concept(
        self, concept_name: str, limit: int = 10
    ) -> list[dict[str, Any]]:
        """Retrieve memories linked to a concept.

        Args:
            concept_name: Name of the concept
            limit: Max results

        Returns:
            List of memories linked to the concept
        """
        return await self.client.find_by_concept(concept_name, limit=limit)

    # ==================== BATCH OPERATIONS ====================

    async def recall_batch(self, queries: list[str], limit: int = 10) -> list[list[dict[str, Any]]]:
        """Search for multiple queries in batch.

        Args:
            queries: List of search queries
            limit: Max results per query

        Returns:
            List of result lists (one per query)
        """
        return await self.client.recall_batch(queries, limit=limit)

    async def hydrate_batch(
        self, queries: list[str], memory_limit: int = 10
    ) -> list[dict[str, Any]]:
        """Hydrate context for multiple queries in batch.

        Args:
            queries: List of queries
            memory_limit: Max memories per query

        Returns:
            List of hydrated context dicts
        """
        return await self.client.hydrate_batch(queries, memory_limit=memory_limit)


async def demo():
    """Demo showing how to use HexisAPI."""
    async with HexisAPI() as api:
        print("=" * 60)
        print("HEXIS API DEMO")
        print("=" * 60)

        # Get health
        print("\n1. HEALTH CHECK")
        print("-" * 60)
        health = await api.get_health()
        for key, value in health.items():
            print(f"  {key}: {value}")

        # Get identity
        print("\n2. IDENTITY")
        print("-" * 60)
        identity = await api.get_identity()
        for aspect in identity:
            print(f"  {aspect['aspect_type']}: {aspect['content']}")

        # Get worldview
        print("\n3. WORLDVIEW")
        print("-" * 60)
        worldview = await api.get_worldview()
        for belief in worldview:
            print(f"  [{belief['category']}] {belief['belief']} (confidence: {belief['confidence']:.2f})")

        # Get active goals
        print("\n4. ACTIVE GOALS")
        print("-" * 60)
        from cognitive_memory_api import GoalPriority
        goals = await api.get_goals(priority=GoalPriority.ACTIVE)
        for goal in goals:
            print(f"  - {goal.get('title', 'Untitled')} (priority: {goal.get('priority')})")

        # Hydrate a query
        print("\n5. HYDRATE SAMPLE QUERY")
        print("-" * 60)
        result = await api.hydrate("What is my purpose?", memory_limit=3)
        print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    asyncio.run(demo())
