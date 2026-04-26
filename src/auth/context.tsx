'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User, SupabaseClient } from '@supabase/supabase-js';

// Real Auth Context
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => Promise<void>;
  supabase: SupabaseClient;
  loading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// Create the supabase client a single time at the module level.
const supabase = createClient();

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const logout = async () => {
    await supabase.auth.signOut();
  };
  
  const isAuthenticated = !!user;

  const value = { isAuthenticated, user, logout, supabase, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
