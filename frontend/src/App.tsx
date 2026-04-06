import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Supervisor from './pages/Supervisor';
import Patrullero from './pages/Patrullero';
import type { UserRole } from './types';
import './index.css';

/** Ruta protegida por rol */
function RoleRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <span className="spinner spinner-lg" />
        <p>Cargando…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to={getHomeRoute(profile?.role)} replace />;
  }

  return <>{children}</>;
}

/** Ruta pública (solo si NO está autenticado) */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <span className="spinner spinner-lg" />
        <p>Cargando…</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getHomeRoute(profile?.role)} replace />;
  }

  return <>{children}</>;
}

/** Determina la ruta principal según el rol */
function getHomeRoute(role?: UserRole | null): string {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'PATRULLERO': return '/patrulla';
    case 'OPERADOR':
    default: return '/';
  }
}

/** Componente que redirige al home según el rol */
function RoleRedirect() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <span className="spinner spinner-lg" />
        <p>Cargando…</p>
      </div>
    );
  }

  return <Navigate to={getHomeRoute(profile?.role)} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          {/* Operador */}
          <Route
            path="/"
            element={
              <RoleRoute allowedRoles={['OPERADOR']}>
                <Dashboard />
              </RoleRoute>
            }
          />
          {/* Administrador */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <Admin />
              </RoleRoute>
            }
          />
          {/* Supervisor - Vista de supervisión para OPERADOR y ADMIN */}
          <Route
            path="/supervisor"
            element={
              <RoleRoute allowedRoles={['OPERADOR', 'ADMIN']}>
                <Supervisor />
              </RoleRoute>
            }
          />
          {/* Patrullero */}
          <Route
            path="/patrulla"
            element={
              <RoleRoute allowedRoles={['PATRULLERO']}>
                <Patrullero />
              </RoleRoute>
            }
          />
          {/* Comodín: redirige según rol */}
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
