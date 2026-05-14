'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Trash2, PlayCircle, Clock } from 'lucide-react';
import ProgressRing from './ProgressRing';
import type { Course, Video, Progress } from '@/types';

interface CourseCardProps {
  course: Course;
  videos: Video[];
  progress: Progress[];
  onDelete: (courseId: string) => void;
}

export default function CourseCard({ course, videos, progress, onDelete }: CourseCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const completedCount = progress.filter((p) => p.completed).length;
  const total = videos.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Last watched video
  const lastProgress = [...progress]
    .filter((p) => p.last_watched)
    .sort((a, b) => new Date(b.last_watched).getTime() - new Date(a.last_watched).getTime())[0];
  const lastVideo = lastProgress ? videos.find((v) => v.video_id === lastProgress.video_id) : null;
  const nextVideo = videos.find((v) => !progress.find((p) => p.video_id === v.video_id && p.completed));

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/playlist?courseId=${course.id}`, { method: 'DELETE' });
      if (res.ok) onDelete(course.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden surface-hover"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
            <PlayCircle size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
        {/* Progress overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="h-full transition-all duration-500" style={{ width: `${percent}%`, background: 'var(--accent)' }} />
        </div>
        {/* Ring overlay */}
        <div className="absolute top-2 right-2">
          <ProgressRing percent={percent} size={44} stroke={4} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href={`/course/${course.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-snug hover:opacity-80 transition-opacity line-clamp-2"
              style={{ color: 'var(--text-primary)' }}>
              {course.title}
            </h3>
          </Link>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-shrink-0 p-1.5 rounded-md transition-colors"
            style={{ color: confirmDelete ? 'var(--error)' : 'var(--text-muted)' }}
            title={confirmDelete ? 'Click again to confirm' : 'Delete course'}>
            <Trash2 size={14} />
          </button>
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{course.channel_title}</p>

        <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {total} lessons
          </span>
          <span>·</span>
          <span style={{ color: percent === 100 ? 'var(--success)' : 'var(--text-secondary)' }}>
            {completedCount}/{total} done
          </span>
        </div>

        <Link href={`/course/${course.id}${nextVideo ? `?v=${nextVideo.video_id}` : ''}`}
          className="btn-primary w-full text-xs" style={{ padding: '9px 16px', fontSize: '12px' }}>
          {percent === 0 ? 'Start course' : percent === 100 ? 'Review course' : 'Continue learning'}
        </Link>
      </div>
    </div>
  );
}
