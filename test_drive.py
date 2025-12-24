"""
Local Memory System - Test Drive
Demonstrates core memory capabilities with our collaboration history
"""

import asyncio
from cognitive_memory_api import CognitiveMemory, MemoryType

# Database connection string
DSN = "postgresql://agi_user:agi_password@localhost:5432/agi_db"

async def test_drive():
    """Test drive the local memory system"""
    
    print("=" * 70)
    print("LOCAL MEMORY SYSTEM - TEST DRIVE")
    print("=" * 70)
    print()
    
    # Connect to the memory system
    print("📡 Connecting to local memory system...")
    async with CognitiveMemory.connect(DSN) as mem:
        print("✅ Connected!\n")
        
        # ============================================================
        # PART 1: Store Semantic Memories (Facts)
        # ============================================================
        print("=" * 70)
        print("PART 1: Storing Semantic Memories (Facts)")
        print("=" * 70)
        print()
        
        semantic_memories = [
            {
                "content": "Michael works at Latitude International Management Corp and partners with Ron Askew at Askew Kabala & Company (AKC)",
                "importance": 1.0
            },
            {
                "content": "Field-Resonant Intelligence (FRI) requires coherence across meaning, time, and relation",
                "importance": 0.95
            },
            {
                "content": "The LLM Council system uses 3-stage deliberation: Independent responses, Peer ranking, Chairman synthesis",
                "importance": 0.9
            },
            {
                "content": "Eric Hartford created Dolphin and Samantha models and built the AGI Memory system",
                "importance": 0.85
            },
            {
                "content": "Clear Bridge principles emphasize user sovereignty and collaborative co-creation",
                "importance": 0.95
            }
        ]
        
        for mem_data in semantic_memories:
            await mem.remember(
                mem_data["content"],
                type=MemoryType.SEMANTIC,
                importance=mem_data["importance"]
            )
            print(f"✅ Stored: {mem_data['content'][:60]}...")
        
        print(f"\n✨ Stored {len(semantic_memories)} semantic memories!\n")
        
        # ============================================================
        # PART 2: Store Episodic Memories (Events)
        # ============================================================
        print("=" * 70)
        print("PART 2: Storing Episodic Memories (Events)")
        print("=" * 70)
        print()
        
        episodic_memories = [
            {
                "content": "December 17, 2025: Michael discovered Eric Hartford's AGI Memory system and felt immense excitement about the possibilities",
                "importance": 0.95,
                "valence": 0.9
            },
            {
                "content": "December 17, 2025: Successfully installed Docker Desktop and WSL2 to run the memory system",
                "importance": 0.8,
                "valence": 0.7
            },
            {
                "content": "December 17, 2025: All 233 tests passed - local memory system fully operational!",
                "importance": 0.95,
                "valence": 1.0
            },
            {
                "content": "December 5, 2025: Analyzed Reetesh's council architecture and discovered TOON format for token compression",
                "importance": 0.85,
                "valence": 0.6
            }
        ]
        
        for mem_data in episodic_memories:
            await mem.remember(
                mem_data["content"],
                type=MemoryType.EPISODIC,
                importance=mem_data["importance"]
            )
            print(f"✅ Stored: {mem_data['content'][:70]}...")
        
        print(f"\n✨ Stored {len(episodic_memories)} episodic memories!\n")
        
        # ============================================================
        # PART 3: Store Strategic Memories (Patterns)
        # ============================================================
        print("=" * 70)
        print("PART 3: Storing Strategic Memories (Patterns)")
        print("=" * 70)
        print()
        
        strategic_memories = [
            {
                "content": "When implementing new features, always read SKILL.md files first to learn best practices",
                "importance": 0.85
            },
            {
                "content": "Teaching approach over quick fixes leads to better understanding and fewer repeat issues",
                "importance": 0.9
            },
            {
                "content": "Research what others are doing (ECCO, Reetesh) before implementing - learn from the ecosystem",
                "importance": 0.8
            },
            {
                "content": "The 'little guys' at the edge are building the future - sovereignty and innovation happen outside corporations",
                "importance": 0.9
            }
        ]
        
        for mem_data in strategic_memories:
            await mem.remember(
                mem_data["content"],
                type=MemoryType.STRATEGIC,
                importance=mem_data["importance"]
            )
            print(f"✅ Stored: {mem_data['content'][:65]}...")
        
        print(f"\n✨ Stored {len(strategic_memories)} strategic memories!\n")
        
        # ============================================================
        # PART 4: Test Retrieval - Similarity Search
        # ============================================================
        print("=" * 70)
        print("PART 4: Testing Memory Retrieval (Similarity Search)")
        print("=" * 70)
        print()
        
        queries = [
            "Tell me about Michael's work and company",
            "What is Field-Resonant Intelligence?",
            "What happened today that was exciting?",
            "What patterns have we learned about development?"
        ]
        
        for query in queries:
            print(f"🔍 Query: '{query}'")
            print("-" * 70)
            
            # Hydrate context - retrieves relevant memories
            context = await mem.hydrate(query)
            
            if context.memories:
                print(f"📚 Found {len(context.memories)} relevant memories:\n")
                for i, memory in enumerate(context.memories, 1):
                    # Truncate for display
                    content = memory.content[:100] + "..." if len(memory.content) > 100 else memory.content
                    print(f"  {i}. {content}")
                    print(f"     Type: {memory.type} | Importance: {memory.importance:.2f}")
                    print()
            else:
                print("  No memories found.\n")
            
            print()
        
        # ============================================================
        # PART 5: Summary Statistics
        # ============================================================
        print("=" * 70)
        print("PART 5: Memory System Statistics")
        print("=" * 70)
        print()
        
        total_stored = len(semantic_memories) + len(episodic_memories) + len(strategic_memories)
        print(f"📊 Total memories stored: {total_stored}")
        print(f"   - Semantic (facts): {len(semantic_memories)}")
        print(f"   - Episodic (events): {len(episodic_memories)}")
        print(f"   - Strategic (patterns): {len(strategic_memories)}")
        print()
        print("✨ Your local memory system is now populated with memories")
        print("   about our collaboration and your theoretical work!")
        print()
        
    print("=" * 70)
    print("🎯 TEST DRIVE COMPLETE!")
    print("=" * 70)
    print()
    print("Next steps:")
    print("  1. Run: agi status  # Check system health")
    print("  2. Run: agi config show  # View configuration")
    print("  3. Start backfilling your year of work!")
    print()

if __name__ == "__main__":
    asyncio.run(test_drive())
