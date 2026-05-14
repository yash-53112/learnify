'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Play, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/dashboard');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess('Check your email for a confirmation link to activate your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0c0c0f' }}>
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 60%)',
        }} />
        <div className="relative max-w-sm">
          <div className="mb-8">
            <div className="flex gap-3 mb-6">
              {[75, 45, 90, 60, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{
                  height: `${h * 0.8}px`,
                  background: i === 4
                    ? 'var(--accent)'
                    : `rgba(201,168,76,${0.1 + i * 0.05})`,
                }} />
              ))}
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--accent)' }}>5 of 5 completed</p>
            <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full" style={{ width: '100%', background: 'var(--accent)' }} />
            </div>
          </div>

          <h2 className="font-display text-3xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
            "Finally finished a<br />course I started."
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            LearnFlow keeps you accountable without being annoying. 
            Paste a playlist, watch videos, check them off. That's it.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#c9a84c', '#6c8cef', '#4caf7d'].map((c) => (
                <div key={c} className="w-7 h-7 rounded-full border-2" style={{ background: c, borderColor: 'var(--surface)' }} />
              ))}
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Join learners who finish what they start</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-sm mb-10 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Play size={14} fill="#0c0c0f" color="#0c0c0f" />
            </div>
            <span className="font-display font-semibold text-xl" style={{ color: 'var(--text-primary)' }}>LearnFlow</span>
          </div>

          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login'
              ? 'Sign in to continue your learning journey.'
              : 'Start learning distraction-free, for free.'}
          </p>

          {/* Toggle */}
          <div className="flex rounded-lg p-1 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {(['login', 'signup'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className="flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200"
                style={{
                  background: mode === m ? 'var(--surface-2)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: mode === m ? '1px solid var(--border-2)' : '1px solid transparent',
                }}>
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="input-base"
                style={{ paddingLeft: '42px' }}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="input-base"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)', color: 'var(--error)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', color: 'var(--success)' }}>
                {success}
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              ) : (
                mode === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
            By continuing, you agree to our{' '}
            <span style={{ color: 'var(--text-secondary)' }}>Terms of Service</span> and{' '}
            <span style={{ color: 'var(--text-secondary)' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0c0c0f', minHeight: '100vh' }} />}>
      <LoginForm />
    </Suspense>
  );
}
