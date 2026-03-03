'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Globe, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { COLORS, SHADOWS } from '@/lib/design-tokens';
import { useSupabaseClient } from '@/lib/hooks/useSupabaseClient';
import { useRouter } from 'next/navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Use shared Supabase client to avoid multiple instances
  const supabase = useSupabaseClient();

  // Check authentication status on mount and listen for changes
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // First, get the current user
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("[Header] Current user:", user?.id);
        setIsAuthenticated(!!user);
        setIsLoading(false);
      } catch (error) {
        console.warn('[Header] Error checking auth:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Header] Auth state changed:", event, session?.user?.id);
      
      if (event === "SIGNED_OUT") {
        console.log("[Header] User signed out");
        setIsAuthenticated(false);
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        console.log("[Header] User signed in/updated");
        setIsAuthenticated(!!session?.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    if (!supabase) {
      console.warn('Supabase not configured, cannot logout');
      return;
    }
    await supabase.auth.signOut();
    setIsAuthenticated(false);
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
            href="/chat"
            className="text-sm font-medium transition-colors hover:text-blue-600"
            style={{
              color: isActive('/chat') ? COLORS['trust-green'] : COLORS['text-dark'],
            }}
          >
            Messages
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
            {isLoading ? (
              // Loading state - show skeleton
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: COLORS['bg-light'] }}
              />
            ) : isAuthenticated ? (
              // Authenticated - show profile menu
              <>
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
              </>
            ) : (
              // Not authenticated - show sign in button
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: COLORS['trust-green'] }}
              >
                Sign In
              </Link>
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
            <Link href="/chat" className="px-4 py-2 hover:bg-white rounded-lg transition-colors" style={{ color: COLORS['text-dark'] }}>
              Messages
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
