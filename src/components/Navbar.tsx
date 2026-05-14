'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Play, LogOut, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface NavbarProps {
  userEmail?: string;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Play size={10} fill="#0c0c0f" color="#0c0c0f" />
          </div>
          <span className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>LearnFlow</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/dashboard"
            className="px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{
              color: pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: pathname === '/dashboard' ? 'var(--surface)' : 'transparent',
            }}>
            <span className="flex items-center gap-1.5"><LayoutDashboard size={13} /> Dashboard</span>
          </Link>
        </div>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)', background: menuOpen ? 'var(--surface)' : 'transparent' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(201,168,76,0.3)' }}>
              {userEmail?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block max-w-[140px] truncate" style={{ color: 'var(--text-secondary)' }}>
              {userEmail}
            </span>
            <ChevronDown size={13} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-lg py-1 z-50"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}
              onMouseLeave={() => setMenuOpen(false)}>
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Signed in as</p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
              </div>
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors hover:opacity-80"
                style={{ color: 'var(--error)' }}>
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
