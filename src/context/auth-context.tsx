
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  companyName?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage (simulating persistent auth for demo)
    const storedUser = localStorage.getItem('tailor-checker-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This is a mock implementation - would use real auth in production
      // For demo purposes, we're simulating a successful login
      const demoUser: User = {
        id: '1',
        name: 'Demo User',
        email: email,
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=8344ff&color=fff',
        companyName: 'Acme Design',
        role: 'admin'
      };
      
      setUser(demoUser);
      localStorage.setItem('tailor-checker-user', JSON.stringify(demoUser));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // This is a mock implementation - would use real auth in production
      const demoUser: User = {
        id: '1',
        name: name,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=8344ff&color=fff`,
        role: 'admin'
      };
      
      setUser(demoUser);
      localStorage.setItem('tailor-checker-user', JSON.stringify(demoUser));
      navigate('/brand-setup');
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Mock Google login
      const demoUser: User = {
        id: '1',
        name: 'Google User',
        email: 'google.user@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=8344ff&color=fff',
        role: 'admin'
      };
      
      setUser(demoUser);
      localStorage.setItem('tailor-checker-user', JSON.stringify(demoUser));
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tailor-checker-user');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signUp,
        loginWithGoogle
      }}
    >
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
