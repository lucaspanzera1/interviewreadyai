import React from 'react';
import { useLocation } from 'react-router-dom';
import PageTitle from './PageTitle';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon } from '@heroicons/react/24/outline';
import AIVisualization3D from './ui/AIVisualization3D';

/**
 * Página de login com Google OAuth
 */
const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const location = useLocation();

  const handleGoogleLogin = async () => {
    try {
      // Save the location the user came from, if available
      const from = location.state?.from?.pathname || '/';
      sessionStorage.setItem('auth_return_url', from);

      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <PageTitle title="Login - TreinaVagaAI" />
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-950">

        {/* Left Side - Login Form */}
        <div className="flex flex-col justify-center items-center p-8 lg:p-16 bg-white dark:bg-slate-950 relative z-10 transition-colors duration-200">
          <div className="w-full max-w-[380px] space-y-8">
            {/* Logo */}
            <div className="flex flex-col items-start gap-4">
              <div className="h-12 w-12 bg-primary-600 dark:bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20 dark:shadow-primary-500/20">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
                  TreinaVaga<span className="text-primary-600 dark:text-primary-400">AI</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base mt-2 leading-relaxed">
                  A sua plataforma de evolução profissional com IA.
                </p>
              </div>
            </div>

            {/* Login Card area */}
            <div className="mt-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Acessar Plataforma</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Entre para continuar sua jornada.</p>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin border-2 border-slate-200 border-t-slate-600 rounded-full"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        className="text-[#4285F4]"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        className="text-[#34A853]"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        className="text-[#FBBC05]"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        className="text-[#EA4335]"
                      />
                    </svg>
                    Continuar com Google
                  </>
                )}
              </button>

              {/* Terms */}
              <div className="pt-6">
                <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed text-center">
                  Ao continuar, você concorda com nossos{' '}
                  <a href="#" className="text-slate-900 dark:text-slate-300 font-medium hover:underline hover:text-slate-700 dark:hover:text-white transition-colors">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-slate-900 dark:text-slate-300 font-medium hover:underline hover:text-slate-700 dark:hover:text-white transition-colors">
                    Política de Privacidade
                  </a>.
                </p>
              </div>
            </div>

            <div className="absolute bottom-8 left-0 right-0">
              <p className="text-xs text-slate-400 text-center">
                © 2026 TreinaVagaAI v1.0
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - AI Visualization */}
        <div className="hidden lg:block relative bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-purple-50/30 dark:from-primary-900/20 dark:to-slate-900 z-0 transition-colors duration-200">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-30 dark:opacity-20 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          </div>
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <AIVisualization3D />
          </div>

          <div className="absolute bottom-12 left-12 right-12 z-20 pointer-events-none">
            <h2 className="text-3xl font-bold tracking-tight mb-3 heading-gradient">
              Domine sua próxima entrevista
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
              Junte-se a milhares de desenvolvedores praticando com a inteligência artificial da TreinaVaga.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;