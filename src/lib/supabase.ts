import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configuration from environment
console.log('🔧 [Supabase] Initializing with:');
console.log('📍 URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
console.log('🔑 Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 30) + '...' : 'NOT SET');

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL not set in environment variables');
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY not set in environment variables');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
);