import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Creates an elevated Supabase client with the Service Role key.
 * 
 * CRITICAL SECURITY NOTICE:
 * - This function MUST ONLY be called in trusted server-side environments (Server Actions, Route Handlers).
 * - NEVER import or execute this on client components.
 * - NEVER expose SUPABASE_SERVICE_ROLE_KEY via NEXT_PUBLIC_ variables.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY VIOLATION: createAdminClient cannot be executed on the client-side!');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin client initialization.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
