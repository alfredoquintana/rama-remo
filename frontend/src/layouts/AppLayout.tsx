import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { AppSidebar } from '../components/AppSidebar';

export function AppLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1081px)');

    const handleLayoutChange = (matches: boolean) => {
      if (matches) {
        setIsMobileNavOpen(false);
      }
    };

    handleLayoutChange(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      handleLayoutChange(event.matches);
    };

    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  return (
    <div className="app-shell">
      <AppHeader
        isMobileNavOpen={isMobileNavOpen}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
      />
      <div className="app-body">
        <AppSidebar
          isMobileOpen={isMobileNavOpen}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
        />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
