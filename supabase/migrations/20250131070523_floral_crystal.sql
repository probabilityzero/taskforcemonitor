/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text)
      - `description` (text)
      - `categories` (text)
      - `link` (text)
      - `status` (text)
      - `tags` (text)
      - `comments` (text)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for public access (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  categories text NOT NULL,
  link text,
  status text NOT NULL,
  tags text NOT NULL DEFAULT '',
  comments text
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- For demo purposes, allow public access
CREATE POLICY "Allow public access"
  ON projects
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);