CREATE OR REPLACE FUNCTION public.create_memory_relationship(
  p_from_id uuid,
  p_to_id uuid,
  p_relationship_type graph_edge_type,
  p_properties jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  props_text text := '';
BEGIN
  IF p_properties IS NULL OR p_properties = '{}'::jsonb THEN
    props_text := '';
  ELSE
    SELECT string_agg(
      CASE
        WHEN jsonb_typeof(value) IN ('number','boolean','null') THEN
          format('%I: %s', key, value::text)
        WHEN jsonb_typeof(value) = 'string' THEN
          -- strip JSON quotes and emit a proper SQL literal (becomes a Cypher string)
          format('%I: %L', key, trim(both '"' from value::text))
        ELSE
          -- arrays/objects: store as JSON text safely (prevents Cypher syntax issues)
          format('%I: %L', key, value::text)
      END,
      ', '
    )
    INTO props_text
    FROM jsonb_each(p_properties);

    props_text := format('{%s}', props_text);
  END IF;

  EXECUTE format(
    'SELECT * FROM cypher(''memory_graph'', $q$
      MATCH (a:MemoryNode {memory_id: %L}), (b:MemoryNode {memory_id: %L})
      CREATE (a)-[r:%s %s]->(b)
      RETURN r
    $q$) as (result agtype)',
    p_from_id,
    p_to_id,
    p_relationship_type,
    COALESCE(props_text, '')
  );
END;
$function$;
