import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    toggleCollapsed: () => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from localStorage
    const [isCollapsed, setIsCollapsedState] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed');
            return saved === 'true';
        }
        return false;
    });

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Persist to localStorage when isCollapsed changes
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }, [isCollapsed]);

    const setIsCollapsed = (collapsed: boolean) => {
        setIsCollapsedState(collapsed);
    };

    const toggleCollapsed = () => {
        setIsCollapsedState((prev) => !prev);
    };

    return (
        <SidebarContext.Provider value={{
            isCollapsed,
            setIsCollapsed,
            toggleCollapsed,
            isMobileOpen,
            setIsMobileOpen
        }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = (): SidebarContextType => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
