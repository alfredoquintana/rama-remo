import type { PropsWithChildren } from 'react';
import { AppHeader } from '../components/AppHeader';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">{children}</main>
    </div>
  );
}
