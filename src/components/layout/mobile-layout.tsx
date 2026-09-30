import React from 'react';
import { Header } from './header';
import { MobileNav } from './mobile-nav';

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-safe">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      {showNav && <MobileNav />}
    </div>
  );
}
