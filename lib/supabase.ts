import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not configured. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env.local file'
  );
}

// Create client with fallback to dummy values to prevent runtime errors
export const supabase = createClient(
  SUPABASE_URL || 'https://dummy.supabase.co',
  SUPABASE_ANON_KEY || 'dummy-key'
);

// Export type helpers
export type Database = any; // Update with your Supabase schema types
