export interface Course {
  id: string;
  user_id: string;
  playlist_id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel_title: string;
  video_count: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  course_id: string;
  video_id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  position: number;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  course_id: string;
  video_id: string;
  completed: boolean;
  watch_seconds: number;
  last_watched: string;
}

export interface CourseWithProgress extends Course {
  videos: Video[];
  progress: Progress[];
  completedCount: number;
  progressPercent: number;
}

export interface PlaylistAPIResponse {
  course: Course;
  videos: Video[];
}
