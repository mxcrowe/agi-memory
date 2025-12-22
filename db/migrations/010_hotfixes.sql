CREATE OR REPLACE FUNCTION public.try_uuid(p_text text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF p_text IS NULL OR btrim(p_text) = '' THEN
    RETURN NULL;
  END IF;

  RETURN p_text::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$function$


CREATE OR REPLACE FUNCTION public.create_semantic_memory(p_content text, p_confidence double precision, p_category text[] DEFAULT NULL::text[], p_related_concepts text[] DEFAULT NULL::text[], p_source_references jsonb DEFAULT NULL::jsonb, p_importance double precision DEFAULT 0.5, p_source_attribution jsonb DEFAULT NULL::jsonb, p_trust_level double precision DEFAULT NULL::double precision)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_memory_id UUID;
    normalized_sources JSONB;
    primary_source JSONB;
    base_confidence FLOAT;
    effective_trust FLOAT;
BEGIN
    -- PATCH: do not attempt to create memory / embeddings for empty text
    IF p_content IS NULL OR btrim(p_content) = '' THEN
        RETURN NULL;
    END IF;

    normalized_sources := dedupe_source_references(p_source_references);
    base_confidence := LEAST(1.0, GREATEST(0.0, COALESCE(p_confidence, 0.5)));

    primary_source := normalize_source_reference(p_source_attribution);
    IF primary_source = '{}'::jsonb AND jsonb_typeof(normalized_sources) = 'array' AND jsonb_array_length(normalized_sources) > 0 THEN
        primary_source := normalize_source_reference(normalized_sources->0);
    END IF;
    IF primary_source = '{}'::jsonb THEN
        primary_source := jsonb_build_object('kind', 'unattributed', 'observed_at', CURRENT_TIMESTAMP);
    END IF;

    effective_trust := COALESCE(p_trust_level, compute_semantic_trust(base_confidence, normalized_sources, 0.0));

    new_memory_id := create_memory('semantic', p_content, p_importance, primary_source, effective_trust);

    INSERT INTO semantic_memories (
        memory_id, confidence, category, related_concepts,
        source_references, last_validated
    ) VALUES (
        new_memory_id, p_confidence, p_category, p_related_concepts,
        normalized_sources, CURRENT_TIMESTAMP
    );

    PERFORM sync_memory_trust(new_memory_id);

    RETURN new_memory_id;
END;
$function$


CREATE OR REPLACE FUNCTION public.process_reflection_result(p_heartbeat_id uuid, p_result jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
            wid := public.try_uuid(wupd->>'id');
            new_conf := COALESCE((wupd->>'new_confidence')::float, NULL);
            IF wid IS NOT NULL AND new_conf IS NOT NULL THEN
                UPDATE worldview_primitives
                SET confidence = new_conf,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = wid;
            END IF;
        END LOOP;
    END IF;

    IF p_result ? 'worldview_influences' THEN
        FOR winf IN SELECT * FROM jsonb_array_elements(COALESCE(p_result->'worldview_influences', '[]'::jsonb))
        LOOP
            BEGIN
                -- PATCH: safe casts
                wid := public.try_uuid(winf->>'worldview_id');
                wmem := public.try_uuid(winf->>'memory_id');

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
                -- PATCH: safe casts
                from_id := public.try_uuid(rel->>'from_id');
                to_id := public.try_uuid(rel->>'to_id');

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
            ma := public.try_uuid(contra->>'memory_a');
            mb := public.try_uuid(contra->>'memory_b');
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

    IF p_result ? 'self_updates' THEN
        FOR selfupd IN SELECT * FROM jsonb_array_elements(COALESCE(p_result->'self_updates', '[]'::jsonb))
        LOOP
            sm_kind := NULLIF(COALESCE(selfupd->>'kind', ''), '');
            sm_concept := NULLIF(COALESCE(selfupd->>'concept', ''), '');
            sm_strength := COALESCE(NULLIF(selfupd->>'strength', '')::float, 0.8);

            -- PATCH: safe cast
            sm_evidence := public.try_uuid(selfupd->>'evidence_memory_id');

            PERFORM upsert_self_concept_edge(sm_kind, sm_concept, sm_strength, sm_evidence);
        END LOOP;
    END IF;
END;
$function$

