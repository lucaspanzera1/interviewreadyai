import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'icon';
  className?: string;
  isCollapsed?: boolean;
}

const languages = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'inline', className = '', isCollapsed = false }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const toggleLanguage = async () => {
    const nextLang = i18n.language === 'pt-BR' ? 'en' : 'pt-BR';
    i18n.changeLanguage(nextLang);

    // Persist language preference to backend if user is authenticated
    if (user) {
      try {
        await apiClient.updateLanguage(nextLang);
      } catch (e) {
        // Silently fail — frontend language still changes
        console.error('Failed to persist language preference:', e);
      }
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleLanguage}
        className={`p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-800 transition-all duration-200 ${className}`}
        title={currentLang.label}
      >
        <LanguageIcon className="h-5 w-5" />
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center w-full px-4 py-2.5 text-sm rounded-xl transition-colors text-slate-700 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-slate-700 dark:hover:text-primary-400 ${className}`}
      >
        <LanguageIcon className="h-4 w-4 mr-3 text-slate-400" />
        {currentLang.flag} {currentLang.label}
      </button>
    );
  }

  // inline variant (for sidebar)
  return (
    <button
      onClick={toggleLanguage}
      className={`w-full flex items-center py-2 rounded-md transition-all duration-200 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${className}`}
      title={currentLang.label}
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        <span className="text-base leading-none filter grayscale-[0.2] hover:grayscale-0 transition-all">
          {currentLang.flag}
        </span>
      </div>
      <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
        <span className="text-sm font-medium pl-3 block text-left text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{currentLang.label}</span>
      </div>
    </button>
  );
};

export default LanguageSwitcher;
