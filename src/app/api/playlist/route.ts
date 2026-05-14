import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { fetchPlaylistData, extractPlaylistId } from '@/lib/youtube';

// POST /api/playlist — Add a new playlist as a course
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const playlistId = extractPlaylistId(url);
    if (!playlistId) return NextResponse.json({ error: 'Invalid YouTube playlist URL' }, { status: 400 });

    // Check if user already added this playlist
    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('user_id', user.id)
      .eq('playlist_id', playlistId)
      .single();

    if (existing) return NextResponse.json({ error: 'You already have this playlist as a course', courseId: existing.id }, { status: 409 });

    // Fetch from YouTube
    const playlist = await fetchPlaylistData(playlistId);

    // Insert course
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .insert({
        user_id: user.id,
        playlist_id: playlist.playlistId,
        title: playlist.title,
        description: playlist.description,
        thumbnail: playlist.thumbnail,
        channel_title: playlist.channelTitle,
        video_count: playlist.videos.length,
      })
      .select()
      .single();

    if (courseErr) throw courseErr;

    // Insert videos in batches
    const videoRows = playlist.videos.map((v) => ({
      course_id: course.id,
      video_id: v.videoId,
      title: v.title,
      description: v.description,
      thumbnail: v.thumbnail,
      duration: v.duration,
      position: v.position,
    }));

    // Supabase has a limit on batch size; insert 100 at a time
    for (let i = 0; i < videoRows.length; i += 100) {
      const batch = videoRows.slice(i, i + 100);
      const { error: vidErr } = await supabase.from('videos').insert(batch);
      if (vidErr) throw vidErr;
    }

    return NextResponse.json({ course, videoCount: playlist.videos.length });
  } catch (err: unknown) {
    console.error('Playlist API error:', err);
    const message = err instanceof Error ? err.message : 'Failed to add playlist';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/playlist?courseId=xxx — Remove a course
export async function DELETE(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete course';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
