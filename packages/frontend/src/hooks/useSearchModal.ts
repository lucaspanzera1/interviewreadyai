import { useState, useEffect } from 'react';

/**
 * Custom hook for managing global search modal state
 * Handles keyboard shortcuts and provides search functionality
 */
export const useSearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Global keyboard shortcut for search (/)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Check if user is not typing in an input, textarea, or contenteditable element
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === 'INPUT' || 
                     activeElement?.tagName === 'TEXTAREA' || 
                     activeElement?.getAttribute('contenteditable') === 'true';
      
      if (event.key === '/' && !isTyping && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
      
      // Close on Escape
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen]);

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => setIsOpen(false);

  return {
    isSearchOpen: isOpen,
    openSearch,
    closeSearch
  };
};