'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Clock, ListVideo, CheckCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import ProgressRing from '@/components/ProgressRing';
import type { Course, Video, Progress } from '@/types';

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id as string;

  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async (userId: string) => {
    const [{ data: courseData }, { data: videosData }, { data: progressData }] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).eq('user_id', userId).single(),
      supabase.from('videos').select('*').eq('course_id', courseId).order('position'),
      supabase.from('progress').select('*').eq('user_id', userId).eq('course_id', courseId),
    ]);

    if (!courseData) { router.push('/dashboard'); return; }

    setCourse(courseData);
    setVideos(videosData || []);
    setProgress(progressData || []);

    // Set initial video from URL param or first video
    const urlVideo = searchParams.get('v');
    const firstVideo = videosData?.[0]?.video_id;
    setActiveVideoId(urlVideo || firstVideo || '');
    setLoading(false);
  }, [courseId, searchParams]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUser({ id: user.id, email: user.email || '' });
      loadData(user.id);
    });
  }, []);

  // Update URL when video changes
  useEffect(() => {
    if (activeVideoId) {
      const url = new URL(window.location.href);
      url.searchParams.set('v', activeVideoId);
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeVideoId]);

  const getVideoProgress = (videoId: string) => progress.find((p) => p.video_id === videoId);
  const isCompleted = (videoId: string) => getVideoProgress(videoId)?.completed ?? false;

  const toggleComplete = async (videoId: string) => {
    if (!user) return;
    const existing = getVideoProgress(videoId);
    const completed = !existing?.completed;

    // Optimistic update
    setProgress((prev) => {
      const filtered = prev.filter((p) => p.video_id !== videoId);
      return [...filtered, {
        ...(existing || {
          id: '',
          user_id: user.id,
          course_id: courseId,
          video_id: videoId,
          watch_seconds: 0,
          last_watched: new Date().toISOString(),
        }),
        completed,
        last_watched: new Date().toISOString(),
      } as Progress];
    });

    await supabase.from('progress').upsert({
      user_id: user.id,
      course_id: courseId,
      video_id: videoId,
      completed,
      last_watched: new Date().toISOString(),
    }, { onConflict: 'user_id,course_id,video_id' });
  };

  const handleProgress = useCallback(async (seconds: number) => {
    if (!user || !activeVideoId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase.from('progress').upsert({
        user_id: user.id,
        course_id: courseId,
        video_id: activeVideoId,
        watch_seconds: seconds,
        last_watched: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id,video_id' });
    }, 5000);
  }, [user, activeVideoId, courseId]);

  const activeVideo = videos.find((v) => v.video_id === activeVideoId);
  const activeIndex = videos.findIndex((v) => v.video_id === activeVideoId);
  const completedCount = progress.filter((p) => p.completed).length;
  const percent = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

  const goToNext = () => {
    if (activeIndex < videos.length - 1) setActiveVideoId(videos[activeIndex + 1].video_id);
  };
  const goToPrev = () => {
    if (activeIndex > 0) setActiveVideoId(videos[activeIndex - 1].video_id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar userEmail={user?.email} />

      <div className="flex flex-1 pt-14" style={{ minHeight: 0 }}>
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80 xl:w-96' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden`}
          style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="h-full flex flex-col" style={{ width: sidebarOpen ? '320px' : '0', minWidth: sidebarOpen ? '320px' : '0' }}>
            {/* Course info */}
            <div className="p-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1 text-xs mb-4 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}>
                <ChevronLeft size={12} /> All courses
              </button>
              <h2 className="font-display text-base font-semibold leading-snug mb-1" style={{ color: 'var(--text-primary)' }}>
                {course?.title}
              </h2>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{course?.channel_title}</p>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <ProgressRing percent={percent} size={48} stroke={4} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {completedCount} of {videos.length} done
                  </p>
                  {percent === 100 && (
                    <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                      🎉 Completed!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Video list */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-0.5">
                {videos.map((video, index) => {
                  const done = isCompleted(video.video_id);
                  const active = video.video_id === activeVideoId;
                  return (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideoId(video.video_id)}
                      className="w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all duration-150"
                      style={{
                        background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
                        border: active ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
                      }}>
                      {/* Status icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {done ? (
                          <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                        ) : active ? (
                          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: 'var(--accent)' }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                          </div>
                        ) : (
                          <Circle size={16} style={{ color: 'var(--border-2)' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-snug" style={{
                          color: active ? 'var(--text-primary)' : done ? 'var(--text-secondary)' : 'var(--text-secondary)',
                          fontWeight: active ? '500' : '400',
                        }}>
                          <span className="mr-1" style={{ color: 'var(--text-muted)' }}>{index + 1}.</span>
                          {video.title}
                        </p>
                        {video.duration && (
                          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={9} /> {video.duration}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            {/* Toggle sidebar btn */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4 flex items-center gap-1.5 text-xs rounded-md px-3 py-1.5 transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <ListVideo size={13} />
              {sidebarOpen ? 'Hide' : 'Show'} course content
            </button>

            {/* Video player */}
            {activeVideo && (
              <div className="page-enter">
                <VideoPlayer key={activeVideoId} videoId={activeVideoId} onProgress={handleProgress} />

                {/* Video controls */}
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      Lesson {activeIndex + 1} of {videos.length}
                    </p>
                    <h1 className="font-display text-xl font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {activeVideo.title}
                    </h1>
                  </div>

                  {/* Mark complete */}
                  <button
                    onClick={() => toggleComplete(activeVideoId)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      background: isCompleted(activeVideoId) ? 'rgba(76,175,125,0.15)' : 'var(--surface)',
                      border: isCompleted(activeVideoId) ? '1px solid rgba(76,175,125,0.3)' : '1px solid var(--border)',
                      color: isCompleted(activeVideoId) ? 'var(--success)' : 'var(--text-secondary)',
                    }}>
                    {isCompleted(activeVideoId)
                      ? <><CheckCheck size={14} /> Completed</>
                      : <><Circle size={14} /> Mark done</>}
                  </button>
                </div>

                {/* Prev / Next */}
                <div className="flex items-center gap-3 mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                  <button onClick={goToPrev} disabled={activeIndex === 0}
                    className="btn-ghost flex-1 disabled:opacity-30">
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button onClick={goToNext} disabled={activeIndex === videos.length - 1}
                    className="btn-primary flex-1 disabled:opacity-30">
                    Next <ChevronRight size={14} />
                  </button>
                </div>

                {/* Description */}
                {activeVideo.description && (
                  <div className="mt-6 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>About this lesson</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                      {activeVideo.description.slice(0, 500)}{activeVideo.description.length > 500 ? '…' : ''}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
