import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { AppSidebar } from '../components/AppSidebar';

export function AppLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-body">
        <AppSidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
