// Types for navigation items
export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  activeIcon: React.ComponentType<any>;
  action?: () => void;
  badge?: string;
}

// Types for search categories
export interface SearchCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  description: string;
}

// Search modal props
export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}