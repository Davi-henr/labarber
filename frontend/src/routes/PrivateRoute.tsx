import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PrivateRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.precisa_redefinir_senha && location.pathname !== '/redefinir-senha') {
    return <Navigate to="/redefinir-senha" replace />;
  }

  if (!user?.precisa_redefinir_senha && location.pathname === '/redefinir-senha') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
