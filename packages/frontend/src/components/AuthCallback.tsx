import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';

/**
 * Componente para processar callback do Google OAuth
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleAuthCallback } = useAuth();
  const { showToast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autenticação...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Autenticação cancelada ou falhou');
          showToast('Erro na autenticação: ' + error, 'error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!accessToken || !refreshToken) {
          setStatus('error');
          setMessage('Tokens de autenticação não encontrados');
          showToast('Erro nos tokens de autenticação', 'error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        setMessage('Validando credenciais...');
        await handleAuthCallback(accessToken, refreshToken);

        // Get user data after authentication
        const userData = await apiClient.getUserProfile();

        setStatus('success');

        if (userData.active) {
          showToast('Login realizado com sucesso!', 'success');

          // Check for return URL
          const returnUrl = sessionStorage.getItem('auth_return_url');
          sessionStorage.removeItem('auth_return_url');

          // Navigate immediately or with small delay
          navigate(returnUrl || '/');
        } else {
          setMessage('Conta aguardando ativação');
          showToast('Sua conta está aguardando ativação', 'info');
          setTimeout(() => navigate('/'), 2000); // Keep delay for inactive message
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Erro ao processar autenticação');
        showToast('Erro ao processar autenticação', 'error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, handleAuthCallback, navigate, showToast]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center animate-fade-in">
        {status === 'loading' && (
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400 mx-auto"></div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto mb-4 flex justify-center">
              <XCircleIcon className="h-16 w-16 text-red-500" />
            </div>
            <p className="text-lg text-slate-700 dark:text-slate-300">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Voltar ao Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;