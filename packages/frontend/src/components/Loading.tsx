import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

/**
 * Componente de loading com diferentes tamanhos e opções
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Carregando...',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const Spinner = () => (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="mx-auto mb-4">
            <Spinner />
          </div>
          <p className={`text-slate-600 dark:text-slate-400 font-medium ${textSizeClasses[size]}`}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto mb-4">
          <Spinner />
        </div>
        <p className={`text-slate-600 dark:text-slate-400 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      </div>
    </div>
  );
};

export default Loading;