import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, retryCount = 0): Promise<User | null> => {
    try {
      console.log(`[Auth] Fetching user profile for: ${userId} (attempt ${retryCount + 1})`);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Error fetching user profile:', error);
        
        // Si el perfil no existe, intentar crearlo
        if (error.code === 'PGRST116' && retryCount === 0) {
          console.log('[Auth] Profile not found, attempting to create...');
          await createUserProfile(userId);
          return await fetchUserProfile(userId, 1);
        }
        
        // Si es error de política, crear perfil básico
        if (error.message?.includes('policy') && retryCount === 0) {
          console.log('[Auth] Policy error, creating basic profile...');
          const basicProfile = await createBasicProfile(userId);
          return basicProfile;
        }
        
        return null;
      }

      console.log('[Auth] User profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('[Auth] Exception fetching user profile:', error);
      return null;
    }
  };

  const createBasicProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const userName = authUser.user_metadata?.full_name || 
                       authUser.user_metadata?.fullName || 
                       authUser.email?.split('@')[0] || 
                       'Usuario';

      const isAdmin = authUser.email?.includes('admin') || 
                      authUser.email?.includes('support');

      const basicProfile: User = {
        id: userId,
        email: authUser.email || '',
        full_name: userName,
        role: isAdmin ? 'admin' : 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[Auth] Created basic profile:', basicProfile);
      return basicProfile;
    } catch (error) {
      console.error('[Auth] Error creating basic profile:', error);
      return null;
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const userName = authUser.user_metadata?.full_name || 
                       authUser.user_metadata?.fullName || 
                       authUser.email?.split('@')[0];

      const isAdmin = authUser.email?.includes('admin') || 
                      authUser.email?.includes('support');

      await supabase.from('users').insert([{
        id: userId,
        email: authUser.email,
        full_name: userName,
        role: isAdmin ? 'admin' : 'user'
      }]);

      console.log('[Auth] User profile created successfully');
    } catch (error) {
      console.error('[Auth] Error creating user profile:', error);
    }
  };

  const refreshProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await fetchUserProfile(authUser.id);
      setUser(profile);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing auth context...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log('[Auth] Found existing session for:', session.user.email);
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('[Auth] Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[Auth] User signed in:', session.user.email);
        setLoading(true);
        const profile = await fetchUserProfile(session.user.id);
        if (mounted) {
          setUser(profile);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out');
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[Auth] Attempting sign in for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Sign in error:', error);
        return { error };
      }

      console.log('[Auth] Sign in successful');
      // El listener onAuthStateChange manejará la obtención del perfil
      return { error: null };
    } catch (error) {
      console.error('[Auth] Sign in exception:', error);
      return { error: error as Error };
    } finally {
      // No setear loading false aquí, el listener lo hará
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('[Auth] Attempting sign up for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            fullName: fullName
          }
        }
      });

      if (error) {
        console.error('[Auth] Sign up error:', error);
        return { error };
      }

      console.log('[Auth] Sign up successful');
      return { error: null };
    } catch (error) {
      console.error('[Auth] Sign up exception:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('[Auth] Signing out...');
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}