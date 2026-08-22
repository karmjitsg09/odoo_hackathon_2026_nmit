import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Client Components.
 * Uses only public environment variables.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
