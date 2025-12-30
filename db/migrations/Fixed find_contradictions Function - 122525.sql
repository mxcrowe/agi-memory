CREATE OR REPLACE FUNCTION public.find_contradictions(p_memory_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(memory_a uuid, memory_b uuid, content_a text, content_b text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    filter_clause TEXT;
    sql TEXT;
BEGIN
    filter_clause := CASE
        WHEN p_memory_id IS NULL THEN ''
        ELSE format('WHERE a.memory_id = %L OR b.memory_id = %L', p_memory_id, p_memory_id)
    END;

    sql := format($sql$
        WITH pairs AS (
            SELECT
                replace(a_id::text, '"', '')::uuid as a_uuid,
                replace(b_id::text, '"', '')::uuid as b_uuid
            FROM cypher('memory_graph', $q$
                MATCH (a:MemoryNode)-[:CONTRADICTS]-(b:MemoryNode)
                %s
                RETURN a.memory_id, b.memory_id
            $q$) as (a_id agtype, b_id agtype)
        )
        SELECT
            p.a_uuid as memory_a,
            p.b_uuid as memory_b,
            ma.content as content_a,
            mb.content as content_b
        FROM pairs p
        JOIN memories ma ON ma.id = p.a_uuid
        JOIN memories mb ON mb.id = p.b_uuid
    $sql$, filter_clause);

    BEGIN
        RETURN QUERY EXECUTE sql;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN;
    END;
END;
$function$
