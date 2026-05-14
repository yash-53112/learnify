'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, TrendingUp, Award, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import AddCourseModal from '@/components/AddCourseModal';
import ProgressRing from '@/components/ProgressRing';
import type { Course, Video, Progress } from '@/types';

interface CourseData {
  course: Course;
  videos: Video[];
  progress: Progress[];
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = useCallback(async (userId: string) => {
    // Fetch courses
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!coursesData?.length) { setCourses([]); setLoading(false); return; }

    const courseIds = coursesData.map((c) => c.id);

    // Fetch all videos and progress in parallel
    const [{ data: videosData }, { data: progressData }] = await Promise.all([
      supabase.from('videos').select('*').in('course_id', courseIds).order('position'),
      supabase.from('progress').select('*').eq('user_id', userId).in('course_id', courseIds),
    ]);

    const courseDataArray = coursesData.map((course) => ({
      course,
      videos: (videosData || []).filter((v) => v.course_id === course.id),
      progress: (progressData || []).filter((p) => p.course_id === course.id),
    }));

    setCourses(courseDataArray);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUser({ id: user.id, email: user.email || '' });
      loadData(user.id);
    });
  }, []);

  const handleDelete = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.course.id !== courseId));
  };

  // Overall stats
  const totalCourses = courses.length;
  const totalVideos = courses.reduce((s, c) => s + c.videos.length, 0);
  const totalCompleted = courses.reduce(
    (s, c) => s + c.progress.filter((p) => p.completed).length, 0
  );
  const overallPercent = totalVideos > 0 ? Math.round((totalCompleted / totalVideos) * 100) : 0;
  const completedCourses = courses.filter((c) => {
    const done = c.progress.filter((p) => p.completed).length;
    return c.videos.length > 0 && done >= c.videos.length;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16 page-enter">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              My Learning
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {totalCourses === 0
                ? 'Add your first playlist to get started'
                : `${totalCourses} course${totalCourses !== 1 ? 's' : ''} · ${totalCompleted} of ${totalVideos} lessons done`}
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={16} /> Add course
          </button>
        </div>

        {/* Stats row */}
        {totalCourses > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: BookOpen, label: 'Courses', value: totalCourses, color: '#6c8cef' },
              { icon: TrendingUp, label: 'Lessons done', value: `${totalCompleted}/${totalVideos}`, color: '#c9a84c' },
              { icon: Award, label: 'Completed', value: completedCourses, color: '#4caf7d' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <stat.icon size={14} style={{ color: stat.color }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                </div>
                <p className="text-2xl font-semibold font-display" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </p>
              </div>
            ))}

            {/* Overall progress ring */}
            <div className="rounded-xl p-5 flex items-center gap-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <ProgressRing percent={overallPercent} size={56} stroke={5} />
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Overall</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Progress</p>
              </div>
            </div>
          </div>
        )}

        {/* Courses grid */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <BookOpen size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              No courses yet
            </h2>
            <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Add a YouTube playlist and it will be structured as a course with progress tracking.
            </p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <Plus size={16} /> Add your first course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map(({ course, videos, progress }) => (
              <CourseCard
                key={course.id}
                course={course}
                videos={videos}
                progress={progress}
                onDelete={handleDelete}
              />
            ))}
            {/* Add more card */}
            <button onClick={() => setShowAddModal(true)}
              className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border-2)', minHeight: '200px', color: 'var(--text-muted)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Plus size={18} />
              </div>
              <span className="text-sm">Add a playlist</span>
            </button>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddCourseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setLoading(true);
            if (user) loadData(user.id);
          }}
        />
      )}
    </div>
  );
}
