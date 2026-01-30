import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
}

/**
 * Hook para atualizar o document.title dinamicamente
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

/**
 * Componente utilitário para definir o título da página
 */
export default function PageTitle({ title }: PageTitleProps) {
  usePageTitle(title);
  return null;
}
