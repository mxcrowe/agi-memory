CREATE OR REPLACE FUNCTION public.link_memory_to_concept(p_memory_id uuid, p_concept_name text, p_strength double precision DEFAULT 1.0)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_concept_id UUID;
    v_concept_cypher TEXT;
BEGIN
    -- Relational upsert (safe)
    INSERT INTO concepts (name)
    VALUES (p_concept_name)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_concept_id;

    INSERT INTO memory_concepts (memory_id, concept_id, strength)
    VALUES (p_memory_id, v_concept_id, p_strength)
    ON CONFLICT (memory_id, concept_id)
    DO UPDATE SET strength = EXCLUDED.strength;

    -- Cypher needs backslash escaping for apostrophes inside single-quoted literals
    -- An'nuk  ->  An\'nuk
    v_concept_cypher := replace(p_concept_name, '''', E'\\\'');

    EXECUTE format(
        'SELECT * FROM cypher(''memory_graph'', $q$
            MATCH (m:MemoryNode {memory_id: ''%s''})
            MERGE (c:ConceptNode {name: ''%s''})
            MERGE (m)-[r:INSTANCE_OF]->(c)
            SET r.strength = %s
            RETURN c
        $q$) as (result agtype)',
        p_memory_id::text,
        v_concept_cypher,
        COALESCE(p_strength, 1.0)
    );

    RETURN v_concept_id;
END;
$function$
