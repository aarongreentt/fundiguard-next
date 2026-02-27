'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Globe, LogOut } from 'lucide-react';
import { useState, useMemo } from 'react';
import { COLORS, SHADOWS } from '@/lib/design-tokens';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Safely initialize Supabase client
  const supabase = useMemo(() => {
    try {
      const client = createSupabaseBrowserClient();
      return client;
    } catch (error) {
      console.warn('Supabase initialization error:', error);
      return null;
    }
  }, []);

  const handleLogout = async () => {
    if (!supabase) {
      console.warn('Supabase not configured, cannot logout');
      return;
    }
    await supabase.auth.signOut();
    router.push('/');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200" style={{ boxShadow: SHADOWS.sm }}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hidden md:flex">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: COLORS['trust-green'] }}
          >
            F
          </div>
          <span style={{ color: COLORS['text-dark'] }}>FundiGuard</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center flex-1 ml-8">
          <Link
            href="/browse"
            className="text-sm font-medium transition-colors hover:text-green-600"
            style={{
              color: isActive('/browse') ? COLORS['trust-green'] : COLORS['text-dark'],
            }}
          >
            Browse
          </Link>
          <Link
            href="/post-job"
            className="text-sm font-medium transition-colors hover:text-orange-600"
            style={{
              color: isActive('/post-job') ? COLORS['energy-orange'] : COLORS['text-dark'],
            }}
          >
            Post a Job
          </Link>
          <Link
            href="/insurance"
            className="text-sm font-medium transition-colors"
            style={{
              color: isActive('/insurance') ? COLORS['trust-green'] : COLORS['text-dark'],
            }}
          >
            Insurance
          </Link>
          <Link
            href="/"
            className="text-sm font-medium transition-colors"
            style={{
              color: isActive('/') ? COLORS['trust-green'] : COLORS['text-dark'],
            }}
          >
            For Fundis
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <Search size={18} color={COLORS['text-muted']} />
            <input
              type="text"
              placeholder="Search jobs..."
              className="bg-transparent text-sm outline-none w-48"
              style={{ color: COLORS['text-dark'] }}
            />
          </div>

          {/* Language */}
          <button className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Globe size={20} color={COLORS['text-muted']} />
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: COLORS['energy-orange'] }}
              >
                U
              </div>
            </button>

            {/* Profile Dropdown */}
            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50"
                style={{ boxShadow: SHADOWS.lg }}
              >
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: COLORS['text-dark'] }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-t border-gray-200"
                  style={{ color: COLORS['text-dark'] }}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={!supabase}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-t border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: COLORS['danger'] }}
                >
                  <LogOut size={16} />
                  {supabase ? 'Sign Out' : 'Sign Out (Offline)'}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} color={COLORS['text-dark']} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <nav className="flex flex-col p-4 gap-3">
            <Link href="/browse" className="px-4 py-2 hover:bg-white rounded-lg transition-colors" style={{ color: COLORS['text-dark'] }}>
              Browse Jobs
            </Link>
            <Link href="/post-job" className="px-4 py-2 hover:bg-white rounded-lg transition-colors" style={{ color: COLORS['text-dark'] }}>
              Post a Job
            </Link>
            <Link href="/insurance" className="px-4 py-2 hover:bg-white rounded-lg transition-colors" style={{ color: COLORS['text-dark'] }}>
              Insurance
            </Link>
            <Link href="/" className="px-4 py-2 hover:bg-white rounded-lg transition-colors" style={{ color: COLORS['text-dark'] }}>
              For Fundis
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
