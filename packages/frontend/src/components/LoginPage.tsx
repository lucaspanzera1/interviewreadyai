import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageTitle from './PageTitle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AIVisualization3D from './ui/AIVisualization3D';

/**
 * Modern Login Page Redesign
 * Focus: Premium aesthetic, clean typography, immersive visual
 */
const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const { t } = useTranslation('auth');
  const logoSrc = theme.includes('orange') ? '/logo-orange.png' : '/logo.png';

  // State for simple entrance animation
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const from = location.state?.from?.pathname || '/';
      sessionStorage.setItem('auth_return_url', from);
      await login('google');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const from = location.state?.from?.pathname || '/';
      sessionStorage.setItem('auth_return_url', from);
      await login('github');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <PageTitle title={t('pageTitle')} />

      <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 overflow-hidden relative selection:bg-primary-500 selection:text-white">

        {/* Left Side - Login Form & Content */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center px-6 sm:px-12 xl:px-24 z-20 bg-white dark:bg-slate-950 relative">

          {/* Top Navigation - Back Button */}
          <div className="absolute top-8 left-8 sm:left-12">
            <Link
              to="/"
              className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all duration-300"
            >
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </div>
              <span>{t('backToHome')}</span>
            </Link>
          </div>

          <div className={`w-full max-w-md space-y-10 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Header Section */}
            <div className="text-center lg:text-left space-y-4">
              <Link to="/" className="inline-block mb-6 hover:opacity-90 transition-opacity">
                <img src={logoSrc} alt="TreinaVaga" className="h-16 w-auto object-contain mx-auto lg:mx-0" />
              </Link>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('welcomeBack') || 'Bem-vindo'}
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto lg:mx-0 leading-relaxed">
                {t('subtitle') || 'Prepare-se para sua próxima entrevista com o poder da IA.'}
              </p>
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin border-2 border-slate-200 border-t-primary-600 rounded-full" />
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" className="text-[#4285F4]" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" className="text-[#34A853]" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" className="text-[#FBBC05]" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" className="text-[#EA4335]" />
                    </svg>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {t('continueWithGoogle')}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#24292F] hover:bg-[#2b3137] text-white rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin border-2 border-slate-400 border-t-white rounded-full" />
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="font-semibold text-white">
                      {t('continueWithGitHub')}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Terms Footer */}
            <div className="pt-8 text-center lg:text-left border-t border-slate-100 dark:border-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">
                {t('termsAgreement')} <br className="hidden md:block" />
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium hover:underline transition-colors">
                  {t('termsOfUse')}
                </Link>
                {' '}{t('and')}{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium hover:underline transition-colors">
                  {t('privacyPolicy')}
                </Link>.
              </p>
            </div>

          </div>

          <div className="absolute bottom-6 text-xs text-slate-400 font-mono">
            TreinaVaga v{import.meta.env.VITE_APP_VERSION}
          </div>
        </div>

        {/* Right Side - Immersive Visual */}
        <div className="hidden lg:flex w-[55%] xl:w-[60%] relative bg-slate-900 overflow-hidden items-center justify-center">

          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-80 z-0"></div>

          {/* Dynamic Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-600/30 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          {/* 3D Content */}
          <div className="relative z-10 w-full h-full flex items-center justify-center scale-110">
            <AIVisualization3D />
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-16 z-20 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent">
            <div className={`transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-3xl xl:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
                {t('heroTitle') || 'Evolua sua carreira.'}
              </h2>
              <p className="text-slate-300/80 text-lg max-w-xl leading-relaxed">
                {t('heroDescription') || 'Inteligência Artificial avançada para simular entrevistas, corrigir currículos e impulsionar suas conquistas profissionais.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;