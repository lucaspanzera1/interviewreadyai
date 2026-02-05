import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Users as UsersIconLucide } from 'lucide-react';
import { SearchModalProps, SearchCategory } from '../types/navigation';

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const categories: SearchCategory[] = [
    {
      id: 'all',
      name: 'Tudo',
      icon: MagnifyingGlassIcon,
      path: '/search',
      description: 'Pesquisar em todo o conteúdo'
    },
    {
      id: 'my-quizzes',
      name: 'Meus Quizzes',
      icon: DocumentTextIcon,
      path: '/my-quizzes',
      description: 'Pesquisar nos seus quizzes'
    },
    {
      id: 'explore',
      name: 'Explorar',
      icon: AcademicCapIcon,
      path: '/free-quizzes',
      description: 'Pesquisar quizzes gratuitos'
    },
    {
      id: 'community',
      name: 'Comunidade',
      icon: UsersIconLucide,
      path: '/search',
      description: 'Pesquisar na comunidade'
    }
  ];

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const category = categories.find(c => c.id === selectedCategory);
    if (category) {
      // Navigate with search query as parameter
      const searchParams = new URLSearchParams();
      searchParams.set('q', query);
      if (selectedCategory !== 'all') {
        searchParams.set('category', selectedCategory);
      }
      
      navigate(`${category.path}?${searchParams.toString()}`);
      onClose();
      setQuery('');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleQuickNavigation = (category: SearchCategory) => {
    navigate(category.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 ease-out animate-in slide-in-from-top-4 fade-in-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pesquisa Rápida
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite sua pesquisa..."
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Pesquisar em:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                        : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${
                      isSelected
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-400'
                    }`} />
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        isSelected
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {category.name}
                      </div>
                      <div className={`text-xs ${
                        isSelected
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-slate-500 dark:text-slate-500'
                      }`}>
                        {category.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          {!query && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Navegação rápida:
              </label>
              <div className="space-y-1">
                {categories.slice(1).map((category) => {
                  const Icon = category.icon;
                  
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleQuickNavigation(category)}
                      className="w-full flex items-center p-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 mr-3 text-slate-400" />
                      Ir para {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-4">
              <span>Pressione <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">Enter</kbd> para pesquisar</span>
            </div>
            <span>Pressione <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">Esc</kbd> para fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;