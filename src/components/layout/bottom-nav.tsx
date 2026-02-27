'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, Briefcase, User } from 'lucide-react';
import { COLORS } from '@/lib/design-tokens';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Browse', href: '/browse' },
  { icon: Plus, label: 'Post', href: '/post-job' },
  { icon: Briefcase, label: 'Jobs', href: '/dashboard' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export function BottomNav() {
  const pathname = usePathname();

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
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-2 flex-1 transition-all ${
                isPostBtn
                  ? 'relative -top-6'
                  : ''
              }`}
            >
              <div
                className={`relative flex items-center justify-center transition-all ${
                  isPostBtn
                    ? `w-14 h-14 rounded-full text-white shadow-lg`
                    : `w-10 h-10`
                }`}
                style={{
                  backgroundColor: isPostBtn
                    ? COLORS['energy-orange']
                    : isActive
                    ? `${COLORS['trust-green']}15`
                    : 'transparent',
                }}
              >
                <Icon
                  size={24}
                  color={
                    isPostBtn
                      ? 'white'
                      : isActive
                      ? COLORS['trust-green']
                      : COLORS['text-muted']
                  }
                />
              </div>
              <span
                className={`text-xs mt-1 font-medium transition-colors ${
                  isActive
                    ? 'text-[color:var(--trust-green)]'
                    : 'text-gray-600'
                }`}
                style={{
                  color: isActive ? COLORS['trust-green'] : COLORS['text-muted'],
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
