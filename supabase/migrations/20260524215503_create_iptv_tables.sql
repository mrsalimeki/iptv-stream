/*
  # IPTV App Database Schema

  1. New Tables
    - `iptv_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) — optional for anonymous use
      - `channel_id` (text) — unique channel identifier
      - `channel_name` (text)
      - `channel_logo` (text)
      - `channel_url` (text)
      - `country` (text)
      - `language` (text)
      - `category` (text)
      - `created_at` (timestamptz)

    - `iptv_channel_cache`
      - `id` (uuid, primary key)
      - `source_url` (text, unique)
      - `channels_json` (jsonb) — cached parsed channel list
      - `last_updated` (timestamptz)
      - `etag` (text) — for conditional requests

  2. Security
    - RLS enabled on both tables
    - Favorites: authenticated users can manage their own
    - Channel cache: public read, no write from client (server-only)
*/

CREATE TABLE IF NOT EXISTS iptv_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id text NOT NULL,
  channel_name text NOT NULL DEFAULT '',
  channel_logo text DEFAULT '',
  channel_url text NOT NULL DEFAULT '',
  country text DEFAULT '',
  language text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE iptv_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON iptv_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON iptv_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON iptv_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS iptv_channel_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text UNIQUE NOT NULL,
  channels_json jsonb DEFAULT '[]'::jsonb,
  last_updated timestamptz DEFAULT now(),
  etag text DEFAULT ''
);

ALTER TABLE iptv_channel_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read channel cache"
  ON iptv_channel_cache FOR SELECT
  TO anon, authenticated
  USING (true);