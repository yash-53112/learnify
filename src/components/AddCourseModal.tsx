'use client';
import { useState, useRef, useEffect } from 'react';
import { X, Link2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AddCourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCourseModal({ onClose, onSuccess }: AddCourseModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError('You already have this playlist. Redirecting to it…');
          setTimeout(() => {
            window.location.href = `/course/${data.courseId}`;
          }, 1500);
        } else {
          setError(data.error || 'Failed to add playlist');
        }
        return;
      }

      setSuccess(`Added "${data.course.title}" with ${data.videoCount} lessons!`);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-xl p-6 animate-fade-in"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Add new course
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Paste any YouTube playlist URL or ID
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Link2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              className="input-base"
              style={{ paddingLeft: '42px' }}
              placeholder="https://youtube.com/playlist?list=PLxxxx"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              disabled={loading}
            />
          </div>

          {/* Examples */}
          <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Supported formats:</p>
            <p>• https://youtube.com/playlist?list=PLxxxx</p>
            <p>• https://www.youtube.com/watch?v=xxx&list=PLxxxx</p>
            <p>• PLxxxx (bare playlist ID)</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
              style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)', color: 'var(--error)' }}>
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
              style={{ background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', color: 'var(--success)' }}>
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading || !url.trim()}>
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Fetching…</>
              ) : 'Add course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
