'use client';
import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  onProgress?: (seconds: number) => void;
}

export default function VideoPlayer({ videoId, onProgress }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  // YouTube embed params for maximum distraction removal:
  // rel=0        — only show same-channel related videos (best we can do)
  // modestbranding=1 — removes YouTube logo from control bar
  // iv_load_policy=3 — disables video annotations
  // disablekb=0  — allow keyboard shortcuts
  // fs=1         — allow fullscreen
  // playsinline=1 — play inline on iOS
  // enablejsapi=1 — enable JS API for progress tracking
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

  useEffect(() => {
    setReady(false);
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, [videoId]);

  // YouTube IFrame API progress tracking
  useEffect(() => {
    if (!onProgress) return;
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.event === 'onStateChange' && data.info === 0) {
          // Video ended — report full watch
        }
        if (data.event === 'infoDelivery' && data.info?.currentTime) {
          onProgress(Math.floor(data.info.currentTime));
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress]);

  return (
    <div className="video-container" style={{ borderRadius: '10px', overflow: 'hidden' }}>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#000' }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={videoId}
        src={embedUrl}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s ease' }}
      />
    </div>
  );
}
