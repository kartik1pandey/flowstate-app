'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '@/lib/api-client-new';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          // Try to fetch fresh profile from backend
          try {
            const profileData = await authAPI.getProfile();
            setUser(profileData.user);
          } catch (profileError) {
            console.error('Failed to fetch profile, using cached user:', profileError);
            // Fallback to cached user if backend is unavailable
            const currentUser = authAPI.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await authAPI.signin({ email, password });
    setUser(response.user);
  };

  const signOut = () => {
    authAPI.signout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
