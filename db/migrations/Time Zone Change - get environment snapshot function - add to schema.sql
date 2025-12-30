CREATE OR REPLACE FUNCTION get_environment_snapshot()
RETURNS JSONB AS $$
DECLARE
    last_user TIMESTAMPTZ;
    pending_count INT;
    user_local TIMESTAMPTZ;
BEGIN
    SELECT last_user_contact INTO last_user FROM heartbeat_state WHERE id = 1;

    -- Count pending external calls as proxy for pending events
    SELECT COUNT(*) INTO pending_count
    FROM external_calls
    WHERE status = 'pending';

    -- Michael is in Pacific time (UTC-8)
    user_local := CURRENT_TIMESTAMP AT TIME ZONE 'America/Los_Angeles';

    RETURN jsonb_build_object(
        'timestamp', CURRENT_TIMESTAMP,
        'user_timezone', 'America/Los_Angeles',
        'user_local_time', to_char(user_local, 'HH24:MI'),
        'user_local_day', to_char(user_local, 'Day'),
        'time_since_user_hours', CASE
            WHEN last_user IS NULL THEN NULL
            ELSE EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_user)) / 3600
        END,
        'pending_events', pending_count,
        'day_of_week', EXTRACT(DOW FROM user_local),
        'hour_of_day', EXTRACT(HOUR FROM user_local)
    );
END;
$$ LANGUAGE plpgsql;