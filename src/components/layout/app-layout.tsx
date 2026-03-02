'use client';

import { Header } from './header';
import { BottomNav } from './bottom-nav';
import { DebugDisplay } from '@/components/debug/debug-display';
import { DebugStatus } from '@/components/debug/debug-status';
import { COLORS } from '@/lib/design-tokens';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: COLORS['bg-light'], minHeight: '100vh' }}>
      <Header />
      <DebugStatus />
      <main className="pb-24 md:pb-0">
        {children}
      </main>
      <BottomNav />
      <DebugDisplay />
    </div>
  );
}
