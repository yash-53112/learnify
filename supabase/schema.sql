-- ============================================================
-- LearnFlow Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- COURSES table
-- Each row represents a YouTube playlist added by a user
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playlist_id     TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT DEFAULT '',
  thumbnail       TEXT DEFAULT '',
  channel_title   TEXT DEFAULT '',
  video_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, playlist_id)
);

-- ──────────────────────────────────────────────
-- VIDEOS table
-- Each video in a course (playlist)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id    UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  video_id     TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  thumbnail    TEXT DEFAULT '',
  duration     TEXT DEFAULT '',
  position     INTEGER NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, video_id)
);

-- ──────────────────────────────────────────────
-- PROGRESS table
-- Tracks per-user per-video completion
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id     UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  video_id      TEXT NOT NULL,
  completed     BOOLEAN DEFAULT FALSE,
  watch_seconds INTEGER DEFAULT 0,
  last_watched  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, video_id)
);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────
ALTER TABLE courses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Courses: only owner can CRUD
CREATE POLICY "courses_select" ON courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "courses_insert" ON courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "courses_update" ON courses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "courses_delete" ON courses FOR DELETE USING (auth.uid() = user_id);

-- Videos: accessible if user owns the parent course
CREATE POLICY "videos_select" ON videos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM courses WHERE courses.id = videos.course_id AND courses.user_id = auth.uid()
  ));
CREATE POLICY "videos_insert" ON videos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM courses WHERE courses.id = videos.course_id AND courses.user_id = auth.uid()
  ));
CREATE POLICY "videos_delete" ON videos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM courses WHERE courses.id = videos.course_id AND courses.user_id = auth.uid()
  ));

-- Progress: only owner
CREATE POLICY "progress_select" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_insert" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_update" ON progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "progress_upsert" ON progress FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ──────────────────────────────────────────────

-- Auto-update courses.updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- INDEXES for performance
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_courses_user_id    ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_course_id   ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_position    ON videos(course_id, position);
CREATE INDEX IF NOT EXISTS idx_progress_user      ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course    ON progress(user_id, course_id);
