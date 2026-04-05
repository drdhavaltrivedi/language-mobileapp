/*
  # Language Practice App Schema

  ## Overview
  Full schema for a language shadowing and playlist practice application.

  ## New Tables

  1. `profiles` - Extended user data (native/target language preferences)
  2. `language_items` - Individual words, phrases, or sentences to practice
  3. `playlists` - Named collections of language items
  4. `playlist_items` - Junction table linking items to playlists (with ordering)
  5. `practice_sessions` - Records of completed practice sessions
  6. `item_progress` - Per-user spaced repetition progress for each item

  ## Security
  - RLS enabled on all tables
  - All policies restrict access to the authenticated owner only
  - Public items/playlists are readable by all authenticated users

  ## Notes
  - Uses SM-2-style spaced repetition fields on item_progress
  - Difficulty scale: 1 (beginner) to 5 (advanced)
  - Sessions track duration and accuracy for analytics
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  native_language text DEFAULT 'English',
  target_language text DEFAULT 'Spanish',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Language items table
CREATE TABLE IF NOT EXISTS language_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  translation text,
  pronunciation text,
  notes text,
  language text NOT NULL DEFAULT 'es',
  difficulty integer DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE language_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items"
  ON language_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own items"
  ON language_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON language_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON language_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  language text NOT NULL DEFAULT 'es',
  cover_color text DEFAULT '#0ea5e9',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and public playlists"
  ON playlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own playlists"
  ON playlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Playlist items junction table
CREATE TABLE IF NOT EXISTS playlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES language_items(id) ON DELETE CASCADE NOT NULL,
  position integer DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, item_id)
);

ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view playlist items for accessible playlists"
  ON playlist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_items.playlist_id
      AND (playlists.user_id = auth.uid() OR playlists.is_public = true)
    )
  );

CREATE POLICY "Users can insert items into own playlists"
  ON playlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_items.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own playlists"
  ON playlist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_items.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own playlists"
  ON playlist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_items.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Practice sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playlist_id uuid REFERENCES playlists(id) ON DELETE SET NULL,
  playlist_name text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  total_items integer DEFAULT 0,
  correct_items integer DEFAULT 0,
  duration_seconds integer DEFAULT 0
);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON practice_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON practice_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON practice_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Item progress table (spaced repetition)
CREATE TABLE IF NOT EXISTS item_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES language_items(id) ON DELETE CASCADE NOT NULL,
  ease_factor real DEFAULT 2.5,
  interval_days integer DEFAULT 1,
  repetitions integer DEFAULT 0,
  next_review timestamptz DEFAULT now(),
  last_reviewed timestamptz,
  times_practiced integer DEFAULT 0,
  times_correct integer DEFAULT 0,
  UNIQUE(user_id, item_id)
);

ALTER TABLE item_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON item_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON item_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON item_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_language_items_user_id ON language_items(user_id);
CREATE INDEX IF NOT EXISTS idx_language_items_language ON language_items(language);
CREATE INDEX IF NOT EXISTS idx_language_items_public ON language_items(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_item_id ON playlist_items(item_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_item_progress_user_id ON item_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_item_progress_next_review ON item_progress(next_review);
