import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'icon';
  className?: string;
}

const languages = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'inline', className = '' }) => {
  const { i18n } = useTranslation();

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'pt-BR' ? 'en' : 'pt-BR';
    i18n.changeLanguage(nextLang);
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
      className={`w-full flex items-center px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors ${className}`}
      title={currentLang.label}
    >
      <LanguageIcon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium pl-3">{currentLang.flag} {currentLang.label}</span>
    </button>
  );
};

export default LanguageSwitcher;
