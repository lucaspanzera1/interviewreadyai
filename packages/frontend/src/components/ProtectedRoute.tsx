import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  // ...existing code...
}

/**
 * Componente para proteger rotas que requerem autenticação
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  // ...existing code...
}) => {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <Loading fullScreen text="" />;
  }

  // Se não requer autenticação
  if (!requireAuth) {
    // Se não requer auth e usuário está autenticado, redireciona para profile
    if (isAuthenticated && location.pathname === '/login') {
      return <Navigate to="/profile" replace />;
    }
    // Se não requer auth e usuário não está autenticado, mostra o conteúdo
    return <>{children}</>;
  }

  // A partir daqui, requer autenticação

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ...existing code...

  // Se chegou aqui, está autenticado e:
  // - ou é usuário ativo
  // - ou é usuário inativo mas a rota permite inativos
  return <>{children}</>;
};

export default ProtectedRoute;