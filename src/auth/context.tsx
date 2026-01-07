
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

// Real Auth Context
interface AuthState {
  isAuthenticated: boolean;
  user: User | null | undefined; // Allow undefined for initial state
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined); // Start with undefined
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase.auth]);


  const logout = async () => {
    await supabase.auth.signOut();
  };
  
  const isAuthenticated = user !== null && user !== undefined;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
