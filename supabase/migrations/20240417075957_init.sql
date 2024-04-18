-- Types
CREATE TYPE game_mode AS ENUM(
  'split-draw',
  'copycat'
);

-- Tables
CREATE TABLE rooms(
  room_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_name text NOT NULL,
  game_mode game_mode NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_round_at timestamp with time zone DEFAULT NULL
);

-- Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to rooms" ON rooms
  FOR SELECT
    USING (TRUE);

CREATE POLICY "Any user can insert rooms" ON rooms
  FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Any user can update rooms" ON rooms
  FOR UPDATE
    USING (TRUE);

CREATE POLICY "Any user can delete rooms" ON rooms
  FOR DELETE
    USING (TRUE);

-- Extensions
CREATE EXTENSION pg_cron WITH SCHEMA extensions;

-- Cron Jobs
SELECT
  cron.schedule('delete_old_rooms', '40 11 * * *', $$ DELETE FROM rooms
    WHERE last_round_at IS NULL
      OR last_round_at < now() - interval '1 day' $$);

