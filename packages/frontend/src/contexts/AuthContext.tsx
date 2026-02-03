import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, User } from '../lib/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showOnboarding: boolean;
  login: (provider?: 'google' | 'github') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  handleAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { showToast } = useToast();

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          const userData = await apiClient.getUserProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        apiClient.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (provider: 'google' | 'github' = 'google'): Promise<void> => {
    try {
      setIsLoading(true);
      // Redirect to OAuth provider
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/${provider}/login`;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCallback = async (accessToken: string, refreshToken: string): Promise<void> => {
    try {
      setIsLoading(true);
      apiClient.setTokens(accessToken, refreshToken);

      const userData = await apiClient.getUserProfile();
      setUser(userData);

      // Check if user needs to complete onboarding
      if (!userData.hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Auth callback failed:', error);
      apiClient.clearTokens();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (apiClient.isAuthenticated()) {
        const userData = await apiClient.getUserProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout user
      await logout();
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      // Separate basic profile fields from onboarding/profile fields
      const basicFields = ['name'];
      const profileFields = ['careerTime', 'techArea', 'techStack', 'bio', 'location', 'linkedinUrl', 'githubUrl'];

      const basicData: Partial<User> = {};
      const profileData: Partial<User> = {};

      Object.keys(userData).forEach(key => {
        const value = userData[key as keyof User];
        if (value !== undefined) {
          if (basicFields.includes(key)) {
            (basicData as any)[key] = value;
          } else if (profileFields.includes(key)) {
            (profileData as any)[key] = value;
          }
        }
      });

      // Update basic profile if there are basic fields
      let message: string | undefined;
      if (Object.keys(basicData).length > 0) {
        const result = await apiClient.updateUserProfile(basicData);
        message = result.message;
      }

      // Update profile data if there are profile fields
      if (Object.keys(profileData).length > 0) {
        const result = await apiClient.updateUserProfileData(profileData);
        message = result.message || message;
      }

      if (message) {
        showToast(message, 'success');
      }

      // Refresh user data to get the latest
      const updatedUser = await apiClient.getUserProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    setShowOnboarding(false);
    // Refresh user data after onboarding completion
    await refreshUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    showOnboarding,
    login,
    logout,
    refreshUser,
    updateProfile,
    handleAuthCallback,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};