'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { BookOpen, CheckCircle, BarChart3, Play, ArrowRight, Layers } from 'lucide-react';

const FEATURES = [
  { icon: Layers, title: 'Any Playlist → Course', desc: 'Paste a YouTube playlist URL and instantly get a structured curriculum with all lessons organized.' },
  { icon: CheckCircle, title: 'Track Every Video', desc: 'Mark videos as complete. Your progress is saved and synced across all your devices in real time.' },
  { icon: BarChart3, title: 'Visual Progress', desc: 'Beautiful progress rings and bars show exactly where you are in each course at a glance.' },
  { icon: Play, title: 'Zero Distractions', desc: 'Videos play without YouTube recommendations, autoplay suggestions, or anything pulling you away.' },
  { icon: BookOpen, title: 'Multiple Courses', desc: 'Add as many playlists as you want. Keep your JavaScript, design, and cooking courses all in one place.' },
];

const STEPS = [
  { num: '01', title: 'Sign up for free', desc: 'Create your account with just an email and password. No credit card needed.' },
  { num: '02', title: 'Add a playlist', desc: 'Paste any YouTube playlist URL. LearnFlow fetches all videos and structures them as a course.' },
  { num: '03', title: 'Start learning', desc: 'Watch videos distraction-free, mark them complete, and track your progress visually.' },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0c0c0f' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Play size={12} fill="#0c0c0f" color="#0c0c0f" />
            </div>
            <span className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>LearnFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm" style={{ padding: '8px 16px' }}>Sign in</Link>
            <Link href="/login?mode=signup" className="btn-primary text-sm" style={{ padding: '8px 16px' }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-16 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at var(--mx, 50%) var(--my, 40%), rgba(201,168,76,0.06) 0%, transparent 60%), #0c0c0f',
        }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        }} />

        <div className="relative max-w-4xl mx-auto px-6 py-32 text-center page-enter">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-10"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: 'var(--accent)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: 'var(--accent)' }} />
            Free to use · Open source
          </div>

          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6" style={{ color: 'var(--text-primary)' }}>
            Turn any playlist<br />
            <span className="gradient-text">into a course</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            LearnFlow transforms YouTube playlists into structured, distraction-free learning experiences —
            complete with progress tracking, so you always know where you left off.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?mode=signup" className="btn-primary text-base w-full sm:w-auto" style={{ padding: '14px 32px' }}>
              Start learning for free <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard" className="btn-ghost text-base w-full sm:w-auto" style={{ padding: '14px 32px' }}>
              View dashboard
            </Link>
          </div>

          {/* Floating stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16 pt-16"
            style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'Distraction-free player', value: '✓' },
              { label: 'Progress sync', value: '✓' },
              { label: 'Unlimited playlists', value: '✓' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="text-xl font-semibold" style={{ color: 'var(--accent)' }}>{stat.value}</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything you need to<br />learn without friction
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Built for focused learners who want to finish what they start.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="rounded-xl p-6 surface-hover"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'rgba(201,168,76,0.12)' }}>
                  <f.icon size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}

            {/* CTA card */}
            <div className="rounded-xl p-6 flex flex-col justify-between md:col-span-2 lg:col-span-1"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.04) 100%)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <div>
                <h3 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Ready to start learning?
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Free forever. No credit card required.
                </p>
              </div>
              <Link href="/login?mode=signup" className="btn-primary" style={{ width: 'fit-content' }}>
                Create free account <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How it works
            </h2>
          </div>
          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-8 relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-7 top-16 bottom-0 w-px" style={{ background: 'var(--border)' }} />
                )}
                <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-sm font-semibold z-10"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--accent)', fontFamily: 'Sora' }}>
                  {step.num}
                </div>
                <div className="pb-12">
                  <h3 className="text-lg font-semibold mb-2 pt-3" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Play size={8} fill="#0c0c0f" color="#0c0c0f" />
            </div>
            <span className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>LearnFlow</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Open source. Built with Next.js & Supabase.
          </p>
          <div className="flex gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
