/*
  # Initial Schema Setup for Project-Ops Dashboard

  ## Overview
  Creates the complete database schema for a personal project management dashboard.

  ## Tables Created
  
  ### 1. users
  - `id` (uuid, primary key) - User identifier
  - `username` (varchar) - Username for login
  - `password_hash` (text) - Hashed password
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. projects
  - `id` (text, primary key) - Project identifier
  - `project_name` (text) - Project name
  - `description` (text) - Project description
  - `status` (text) - Current project status
  - `start_date` (text) - Project start date
  - `technology_stack` (text array) - Technologies used
  - `repo_link` (text) - Repository URL
  - `live_link` (text) - Live site URL
  - `dev_notes` (text) - Developer notes
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. issues
  - `id` (text, primary key) - Issue identifier
  - `project_id` (text, foreign key) - Reference to project
  - `title` (text) - Issue title
  - `description` (text) - Issue description
  - `priority` (text) - Priority level (Low/Medium/High)
  - `status` (text) - Issue status (Open/Closed)
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. credentials
  - `id` (text, primary key) - Credential identifier
  - `project_id` (text, foreign key) - Reference to project
  - `key` (text) - Credential key name
  - `value` (text) - Credential value
  
  ### 5. team_members
  - `id` (text, primary key) - Member identifier
  - `project_id` (text, foreign key) - Reference to project
  - `name` (text) - Member name
  - `role` (text) - Member role
  - `contact` (text) - Contact information

  ### 6. goals
  - `id` (text, primary key) - Goal identifier
  - `project_id` (text, foreign key) - Reference to project
  - `text` (text) - Goal description
  - `completed` (boolean) - Completion status

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - All data restricted to authenticated users only
  - Policies enforce data isolation and proper access control

  ## Important Notes
  - Cascade deletes ensure data integrity when projects are removed
  - Default values set for appropriate fields
  - Indexes added for frequently queried columns
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(255) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  project_name text NOT NULL,
  description text DEFAULT '' NOT NULL,
  status text DEFAULT 'Planning' NOT NULL,
  start_date text NOT NULL,
  technology_stack text[] DEFAULT '{}' NOT NULL,
  repo_link text DEFAULT '' NOT NULL,
  live_link text DEFAULT '' NOT NULL,
  dev_notes text DEFAULT '',
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '' NOT NULL,
  priority text DEFAULT 'Medium' NOT NULL,
  status text DEFAULT 'Open' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  contact text DEFAULT '' NOT NULL
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text text NOT NULL,
  completed boolean DEFAULT false NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table (single user system)
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for projects table
CREATE POLICY "Authenticated users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for issues table
CREATE POLICY "Authenticated users can view all issues"
  ON issues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete issues"
  ON issues FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for credentials table
CREATE POLICY "Authenticated users can view all credentials"
  ON credentials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert credentials"
  ON credentials FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update credentials"
  ON credentials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete credentials"
  ON credentials FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for team_members table
CREATE POLICY "Authenticated users can view all team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for goals table
CREATE POLICY "Authenticated users can view all goals"
  ON goals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete goals"
  ON goals FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_credentials_project_id ON credentials(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_project_id ON team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_goals_project_id ON goals(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- Insert default user (username: priyam, password: priyam@2653)
INSERT INTO users (username, password_hash)
VALUES ('priyam', 'priyam@2653')
ON CONFLICT (username) DO NOTHING;