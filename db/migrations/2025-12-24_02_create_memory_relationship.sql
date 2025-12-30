CREATE OR REPLACE FUNCTION public.create_memory_relationship(p_from_id uuid, p_to_id uuid, p_relationship_type graph_edge_type, p_properties jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  props_text text := '';
  qry text;
  rel_token text;
BEGIN
  -- Guardrails: required params must be present
  IF p_from_id IS NULL OR p_to_id IS NULL THEN
    RAISE EXCEPTION 'create_memory_relationship: from_id/to_id must not be NULL (from_id=%, to_id=%)', p_from_id, p_to_id;
  END IF;

  -- relationship_type is an enum, but still guard against weird empty/NULL routing
  IF p_relationship_type IS NULL THEN
    RAISE EXCEPTION 'create_memory_relationship: relationship_type must not be NULL';
  END IF;

  -- Belt-and-suspenders: ensure relationship token is a valid Cypher identifier
  rel_token := p_relationship_type::text;
  IF rel_token IS NULL OR rel_token = '' OR rel_token !~ '^[A-Za-z_][A-Za-z0-9_]*$' THEN
    RAISE EXCEPTION 'create_memory_relationship: invalid relationship_type token: %', rel_token;
  END IF;

  IF p_properties IS NULL OR p_properties = '{}'::jsonb THEN
    props_text := '';
  ELSE
    SELECT string_agg(
      CASE
        WHEN jsonb_typeof(value) IN ('number','boolean','null') THEN
          format('%I: %s', key, value::text)
        WHEN jsonb_typeof(value) = 'string' THEN
          format('%I: %L', key, trim(both '"' from value::text))
        ELSE
          format('%I: %L', key, value::text)
      END,
      ', '
    )
    INTO props_text
    FROM jsonb_each(p_properties);

    props_text := format('{%s}', props_text);
  END IF;

  qry := format(
    'SELECT * FROM cypher(''memory_graph'', $q$
      MATCH (a:MemoryNode {memory_id: %L}), (b:MemoryNode {memory_id: %L})
      CREATE (a)-[r:%s %s]->(b)
      RETURN r
    $q$) as (result agtype)',
    p_from_id,
    p_to_id,
    rel_token,
    COALESCE(props_text, '')
  );

  EXECUTE qry;

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'create_memory_relationship failed: % | generated query: %', SQLERRM, qry;
END;
$function$
