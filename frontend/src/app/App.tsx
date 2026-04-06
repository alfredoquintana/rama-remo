import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
import { AccessPage } from '../pages/AccessPage';
import { AnnualPlanCreatePage } from '../pages/AnnualPlanCreatePage';
import { AnnualPlanDetailPage } from '../pages/AnnualPlanDetailPage';
import { AnnualPlanEditPage } from '../pages/AnnualPlanEditPage';
import { AnnualPlansListPage } from '../pages/AnnualPlansListPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { MeetingCreatePage } from '../pages/MeetingCreatePage';
import { MeetingDetailPage } from '../pages/MeetingDetailPage';
import { MeetingEditPage } from '../pages/MeetingEditPage';
import { MeetingsListPage } from '../pages/MeetingsListPage';
import { UserCreatePage } from '../pages/UserCreatePage';
import { UserEditPage } from '../pages/UserEditPage';
import { UsersListPage } from '../pages/UsersListPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/mi-acceso" element={<AccessPage />} />
              <Route path="/usuarios" element={<UsersListPage />} />
              <Route path="/usuarios/nuevo" element={<UserCreatePage />} />
              <Route path="/usuarios/:id/editar" element={<UserEditPage />} />
              <Route path="/planificacion" element={<AnnualPlansListPage />} />
              <Route path="/planificacion/nuevo" element={<AnnualPlanCreatePage />} />
              <Route path="/planificacion/:id" element={<AnnualPlanDetailPage />} />
              <Route path="/planificacion/:id/editar" element={<AnnualPlanEditPage />} />
              <Route path="/reuniones" element={<MeetingsListPage />} />
              <Route path="/reuniones/nueva" element={<MeetingCreatePage />} />
              <Route path="/reuniones/:id" element={<MeetingDetailPage />} />
              <Route path="/reuniones/:id/editar" element={<MeetingEditPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
