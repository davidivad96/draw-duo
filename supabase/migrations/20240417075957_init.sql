-- Tables
CREATE TABLE rooms(
  room_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to rooms" ON rooms
  FOR SELECT
    USING (TRUE);

CREATE POLICY "Any user can insert rooms" ON rooms
  FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Any user can delete rooms" ON rooms
  FOR DELETE
    USING (TRUE);

