'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Search, Plus, Briefcase, User, LogIn } from 'lucide-react';
import { COLORS } from '@/lib/design-tokens';
import { useSupabaseClient } from '@/lib/hooks/useSupabaseClient';

export function BottomNav() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use shared Supabase client to avoid multiple instances
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // First, get current user
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("[BottomNav] Current user:", user?.id);
        setIsAuthenticated(!!user);
      } catch (error) {
        console.warn('[BottomNav] Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[BottomNav] Auth state changed:", event, session?.user?.id);
      
      if (event === "SIGNED_OUT") {
        console.log("[BottomNav] User signed out");
        setIsAuthenticated(false);
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        console.log("[BottomNav] User signed in/updated");
        setIsAuthenticated(!!session?.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // Build nav items based on auth state
  const NAV_ITEMS = isAuthenticated
    ? [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Browse', href: '/browse' },
        { icon: Plus, label: 'Post', href: '/post-job' },
        { icon: Briefcase, label: 'Jobs', href: '/dashboard' },
        { icon: User, label: 'Profile', href: '/profile' },
      ]
    : [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Browse', href: '/browse' },
        { icon: Plus, label: 'Post', href: '/post-job', disabled: true },
        { icon: Briefcase, label: 'Jobs', href: '/dashboard', disabled: true },
        { icon: LogIn, label: 'Sign In', href: '/sign-in' },
      ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40"
      style={{ boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)' }}
    >
      <div className="flex justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isPostBtn = item.label === 'Post';
          const isDisabled = (item as any).disabled || isLoading;
          
          const content = (
            <>
              <div
                className={`relative flex items-center justify-center transition-all ${
                  isPostBtn
                    ? `w-14 h-14 rounded-full text-white shadow-lg`
                    : `w-10 h-10`
                } ${isDisabled ? 'opacity-50' : ''}`}
                style={{
                  backgroundColor: isPostBtn
                    ? COLORS['energy-orange']
                    : isActive && !isDisabled
                    ? `${COLORS['trust-green']}15`
                    : 'transparent',
                }}
              >
                <Icon
                  size={24}
                  color={
                    isPostBtn
                      ? 'white'
                      : isActive && !isDisabled
                      ? COLORS['trust-green']
                      : COLORS['text-muted']
                  }
                />
              </div>
              <span
                className={`text-xs mt-1 font-medium transition-colors ${
                  isActive && !isDisabled
                    ? 'text-[color:var(--trust-green)]'
                    : 'text-gray-600'
                } ${isDisabled ? 'opacity-50' : ''}`}
                style={{
                  color: isActive && !isDisabled ? COLORS['trust-green'] : COLORS['text-muted'],
                }}
              >
                {item.label}
              </span>
            </>
          );

          if (isDisabled && item.label !== 'Home' && item.label !== 'Browse' && item.label !== 'Sign In') {
            return (
              <div
                key={item.href}
                className="flex flex-col items-center justify-center py-3 px-2 flex-1 cursor-not-allowed"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={isDisabled ? '#' : item.href}
              className={`flex flex-col items-center justify-center py-3 px-2 flex-1 transition-all ${
                isPostBtn
                  ? 'relative -top-6'
                  : ''
              } ${isDisabled ? 'cursor-not-allowed pointer-events-none' : ''}`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
