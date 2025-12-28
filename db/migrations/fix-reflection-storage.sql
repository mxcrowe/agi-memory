-- ============================================================================
-- AGI Memory Bug Fix: Reflection Storage Format Mismatch
-- ============================================================================
-- Issue: LLMs generate {"insight": "...", "confidence": 0.85} (singular)
--        But process_reflection_result() expects {"insights": [...]} (plural)
-- Result: All reflections are LOST - never saved to worldview/identity!
-- Fix: Handle BOTH singular "insight" and plural "insights" formats
-- Date: December 21, 2025
-- ============================================================================

CREATE OR REPLACE FUNCTION process_reflection_result(
    p_heartbeat_id UUID,
    p_result JSONB
)
RETURNS VOID AS $$
	DECLARE
    insight JSONB;
    ident JSONB;
    wupd JSONB;
    rel JSONB;
    contra JSONB;
    selfupd JSONB;
    content TEXT;
    conf FLOAT;
    category TEXT;
    aspect_type TEXT;
    change_text TEXT;
    reason_text TEXT;
	    wid UUID;
	    new_conf FLOAT;
	    winf JSONB;
	    wmem UUID;
	    wstrength FLOAT;
	    wtype TEXT;
	    from_id UUID;
	    to_id UUID;
	    rel_type graph_edge_type;
	    rel_conf FLOAT;
    ma UUID;
    mb UUID;
    sm_kind TEXT;
    sm_concept TEXT;
    sm_strength FLOAT;
    sm_evidence UUID;
BEGIN
    IF p_result IS NULL THEN
        RETURN;
    END IF;

    -- ========================================================================
    -- FIX: Handle BOTH "insight" (singular) and "insights" (plural array)
    -- ========================================================================
    
    -- Handle singular "insight" format from LLM
    IF p_result ? 'insight' AND NOT p_result ? 'insights' THEN
        content := COALESCE(p_result->>'insight', '');
        IF content <> '' AND trim(content) <> '' THEN
            conf := COALESCE((p_result->>'confidence')::float, 0.7);
            category := COALESCE(p_result->>'category', 'pattern');
            PERFORM create_semantic_memory(
                content,
                conf,
                ARRAY['reflection', category],
                NULL,
                jsonb_build_object('heartbeat_id', p_heartbeat_id, 'source', 'reflect'),
                0.6
            );
        END IF;
    END IF;
    
    -- Handle plural "insights" array format (original)
    IF p_result ? 'insights' THEN
        FOR insight IN SELECT * FROM jsonb_array_elements(COALESCE(p_result->'insights', '[]'::jsonb))
        LOOP
            content := COALESCE(insight->>'content', '');
            IF content <> '' THEN
                conf := COALESCE((insight->>'confidence')::float, 0.7);
                category := COALESCE(insight->>'category', 'pattern');
                PERFORM create_semantic_memory(
                    content,
                    conf,
                    ARRAY['reflection', category],
                    NULL,
                    jsonb_build_object('heartbeat_id', p_heartbeat_id, 'source', 'reflect'),
                    0.6
                );
            END IF;
        END LOOP;
    END IF;
    -- ========================================================================

    IF p_result ? 'identity_updates' THEN
        FOR ident IN SELECT * FROM jsonb_array_elements(COALESCE(p_result->'identity_updates', '[]'::jsonb))
        LOOP
            aspect_type := COALESCE(ident->>'aspect_type', '');
            change_text := COALESCE(ident->>'change', '');
            reason_text := COALESCE(ident->>'reason', '');
            IF aspect_type <> '' AND change_text <> '' THEN
                INSERT INTO identity_aspects (aspect_type, content, stability)
                VALUES (
                    aspect_type,
                    jsonb_build_object('change', change_text, 'reason', reason_text, 'heartbeat_id', p_heartbeat_id),
                    0.5
                );
            END IF;
        END LOOP;
    END IF;

	    IF p_result ? 'worldview_updates' THEN
	        FOR wupd IN SELECT * FROM jsonb_array_elements(COALESCE(p_result->'worldview_updates', '[]'::jsonb))
	        LOOP
            wid := NULLIF(wupd->>'id', '')::uuid;
            new_conf := COALESCE((wupd->>'new_confidence')::float, NULL);
            IF wid IS NOT NULL AND new_conf IS NOT NULL THEN
                UPDATE worldview_primitives
                SET confidence = new_conf,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = wid;
            END IF;
	        END LOOP;
	    END IF;

	    -- Optional worldview evidence links: insert influences so trust/alignment can be computed and beliefs can update over time.
	    IF p_result ? 'worldview_influences' THEN
	        FOR winf IN SELECT * FROM jsonb_array_elements(COALESCE(p_result->'worldview_influences', '[]'::jsonb))
	        LOOP
	            BEGIN
	                wid := NULLIF(winf->>'worldview_id', '')::uuid;
	                wmem := NULLIF(winf->>'memory_id', '')::uuid;
	                wstrength := COALESCE(NULLIF(winf->>'strength', '')::float, NULL);
	                wtype := COALESCE(NULLIF(winf->>'influence_type', ''), 'evidence');

	                IF wid IS NOT NULL AND wmem IS NOT NULL AND wstrength IS NOT NULL THEN
	                    INSERT INTO worldview_memory_influences (worldview_id, memory_id, influence_type, strength)
	                    VALUES (wid, wmem, wtype, wstrength)
	                    ON CONFLICT (worldview_id, memory_id, influence_type) DO UPDATE
	                    SET strength = EXCLUDED.strength,
	                        created_at = CURRENT_TIMESTAMP;

	                    IF wstrength > 0 THEN
	                        PERFORM link_memory_supports_worldview(wmem, wid, LEAST(1.0, GREATEST(0.0, wstrength)));
	                    END IF;
	                END IF;
	            EXCEPTION
	                WHEN OTHERS THEN
	                    NULL;
	            END;
	        END LOOP;
	    END IF;

    IF p_result ? 'discovered_relationships' THEN
        FOR rel IN SELECT * FROM jsonb_array_elements(COALESCE(p_result->'discovered_relationships', '[]'::jsonb))
        LOOP
            BEGIN
                from_id := NULLIF(rel->>'from_id', '')::uuid;
                to_id := NULLIF(rel->>'to_id', '')::uuid;
                rel_type := (rel->>'type')::graph_edge_type;
                rel_conf := COALESCE((rel->>'confidence')::float, 0.8);
                IF from_id IS NOT NULL AND to_id IS NOT NULL THEN
                    PERFORM discover_relationship(from_id, to_id, rel_type, rel_conf, 'reflection', p_heartbeat_id, 'reflect');
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END;
        END LOOP;
    END IF;

    IF p_result ? 'contradictions_noted' THEN
        FOR contra IN SELECT * FROM jsonb_array_elements(COALESCE(p_result->'contradictions_noted', '[]'::jsonb))
        LOOP
            ma := NULLIF(contra->>'memory_a', '')::uuid;
            mb := NULLIF(contra->>'memory_b', '')::uuid;
            reason_text := COALESCE(contra->>'resolution', '');
            IF ma IS NOT NULL AND mb IS NOT NULL THEN
                PERFORM discover_relationship(
                    ma,
                    mb,
                    'CONTRADICTS',
                    0.8,
                    'reflection',
                    p_heartbeat_id,
                    COALESCE(reason_text, '')
                );
            END IF;
        END LOOP;
    END IF;

    -- Self-model updates (stored in graph as Self --[ASSOCIATED {kind}]--> ConceptNode).
    IF p_result ? 'self_model_updates' THEN
        FOR selfupd IN SELECT * FROM jsonb_array_elements(COALESCE(p_result->'self_model_updates', '[]'::jsonb))
        LOOP
            sm_kind := COALESCE(selfupd->>'kind', '');
            sm_concept := COALESCE(selfupd->>'concept', '');
            sm_strength := COALESCE((selfupd->>'strength')::float, 0.8);
            sm_evidence := NULLIF(selfupd->>'evidence_memory_id', '')::uuid;
            IF sm_kind <> '' AND sm_concept <> '' THEN
                PERFORM update_self_model(sm_kind, sm_concept, sm_strength, sm_evidence);
            END IF;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- End of patch
-- ============================================================================
