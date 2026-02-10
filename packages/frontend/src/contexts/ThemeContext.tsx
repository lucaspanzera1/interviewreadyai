import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system' | 'dark-orange' | 'light-orange';


interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

// Função para desabilitar transições temporariamente
const disableTransitionsTemporarily = () => {
    const css = document.createElement('style');
    css.type = 'text/css';
    css.appendChild(
        document.createTextNode(
            `*, *::before, *::after { 
        -webkit-transition: none !important; 
        -moz-transition: none !important; 
        -o-transition: none !important; 
        -ms-transition: none !important; 
        transition: none !important; 
      }`
        )
    );
    document.head.appendChild(css);

    // Force reflow
    (() => window.getComputedStyle(document.body))();

    // Re-enable transitions after a frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.head.removeChild(css);
        });
    });
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme') as Theme;
            return saved || 'system';
        }
        return 'system';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
        if (theme === 'system') return getSystemTheme();
        if (theme === 'dark-orange') return 'dark';
        if (theme === 'light-orange') return 'light';
        return theme as 'light' | 'dark';
    });

    const applyTheme = useCallback((newTheme: Theme, instant: boolean = true) => {
        const root = window.document.documentElement;

        // Desabilitar transições para mudança instantânea
        if (instant) {
            disableTransitionsTemporarily();
        }

        // Remove old classes
        root.classList.remove('light', 'dark', 'theme-orange');

        let resolved: 'light' | 'dark';

        if (newTheme === 'system') {
            resolved = getSystemTheme();
        } else if (newTheme === 'dark-orange') {
            resolved = 'dark';
            root.classList.add('theme-orange');
        } else if (newTheme === 'light-orange') {
            resolved = 'light';
            root.classList.add('theme-orange');
        } else {
            resolved = newTheme as 'light' | 'dark';
        }

        setResolvedTheme(resolved);

        // Add new class
        root.classList.add(resolved);

        // Save to localStorage
        localStorage.setItem('theme', newTheme);
    }, []);

    useEffect(() => {
        applyTheme(theme, false); // Don't disable transitions on initial load
    }, []);

    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            disableTransitionsTemporarily();
            setResolvedTheme(e.matches ? 'dark' : 'light');
            document.documentElement.classList.remove('light', 'dark', 'theme-orange');
            document.documentElement.classList.add(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme, true);
    };

    const toggleTheme = () => {
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setThemeState(newTheme);
        applyTheme(newTheme, true);
    };

    const cycleTheme = () => {
        let newTheme: Theme;
        // Cycle: system -> dark -> light -> dark-orange -> light-orange -> system
        if (theme === 'system') newTheme = 'dark';
        else if (theme === 'dark') newTheme = 'light';
        else if (theme === 'light') newTheme = 'dark-orange';
        else if (theme === 'dark-orange') newTheme = 'light-orange';
        else newTheme = 'system';

        setThemeState(newTheme);
        applyTheme(newTheme, true);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, cycleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
