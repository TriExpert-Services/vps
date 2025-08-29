import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    console.log('🔄 AuthProvider: Checking initial session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📝 Initial session check:', session?.user?.email || 'No session');
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user);
      } else {
        console.log('❌ No initial session found');
        setLoading(false);
      }
    });

    // Listen for auth changes
    console.log('🎧 AuthProvider: Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email || 'No user');
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, authUser?: any) => {
    try {
      console.log('👤 Fetching user profile for:', userId, authUser?.email);
      
      // Verificar conexión con Supabase primero
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Database connection failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user profile:', error.code, error.message);
        
        // Si el perfil no existe, crear uno automáticamente
        if (error.code === 'PGRST116' && authUser) {
          console.log('🔨 Profile not found, creating one...');
          const created = await createUserProfile(authUser);
          if (created) {
            console.log('✅ Profile created successfully, retrying fetch...');
            return fetchUserProfile(userId, authUser);
          }
          return;
        }
        
        // Para otros errores, seguir adelante sin perfil
        console.warn('⚠️ Continuing without profile due to error:', error.message);
        const fallbackUser = {
          id: userId,
          email: authUser?.email || 'unknown@email.com',
          full_name: authUser?.user_metadata?.full_name || authUser?.email || 'Unknown User',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('👤 Using fallback user profile:', fallbackUser);
        setUser(fallbackUser);
      } else {
        console.log('✅ User profile fetched successfully:', data.email, data.role);
        setUser(data);
      }
    } catch (error) {
      console.error('❌ Unexpected error in fetchUserProfile:', error);
      // En caso de error inesperado, crear usuario básico y continuar
      const emergencyUser = {
        id: userId,
        email: authUser?.email || 'unknown@email.com', 
        full_name: authUser?.user_metadata?.full_name || authUser?.email || 'Unknown User',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('🚨 Emergency user profile created:', emergencyUser);
      setUser(emergencyUser);
    } finally {
      console.log('✅ fetchUserProfile completed, setting loading to false');
      setLoading(false);
    }
  };

  const createUserProfile = async (authUser: any) => {
    try {
      console.log('🔨 Creating user profile for:', authUser.email);
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email,
            role: (authUser.email?.includes('admin') || authUser.email?.includes('support')) ? 'admin' : 'user'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ User profile created:', data.email, data.role);
      setUser(data);
      return true;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      // No llamar fetchUserProfile recursivamente
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
      } else {
        console.log('✅ Sign in successful for:', email);
      }
      
      return { error };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('📝 Attempting signup:', { email, fullName });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Deshabilitar redirect para evitar problemas
          data: {
            full_name: fullName,
            fullName: fullName // Ambos por compatibilidad
          }
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }
      console.log('✅ Signup successful:', data);

      // Si el usuario se creó pero hay warning de email, aún es éxito
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created but email not confirmed - this is OK for now');
      } else if (data.user) {
        console.log('User created successfully, trigger should create profile');
      }

      return { error: null };
    } catch (error) {
      console.error('SignUp error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    console.log('✅ Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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