import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

let cachedAdminClient = null;

export function getSupabaseAdmin() {
  if (cachedAdminClient) return cachedAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('[serverAuth] Supabase admin environment variables are missing.');
    throw new Error('CONFIG_MISSING');
  }

  cachedAdminClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cachedAdminClient;
}

/**
 * Verifies caller JWT from Authorization header or cookie,
 * checks their profile in Supabase, and verifies their role.
 *
 * @param {Request} req - Incoming Next.js request
 * @param {string|string[]|null} requiredRole - e.g. 'admin', ['teacher', 'admin'], etc.
 * @returns {Promise<{ user: any, profile: any, adminClient: any, error?: string, status?: number }>}
 */
export async function verifyCaller(req, requiredRole = null) {
  let adminClient;
  try {
    adminClient = getSupabaseAdmin();
  } catch {
    return { error: 'Authentication service temporarily unavailable.', status: 500 };
  }

  let user = null;

  // 1. Authoritative: Bearer token from Authorization header
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data, error: userError } = await adminClient.auth.getUser(token);
      if (!userError && data?.user) {
        user = data.user;
      }
    }
  }

  // 2. Fallback: Session cookie via @supabase/ssr
  if (!user) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const cookieHeader = req.headers.get('cookie') || '';

    if (supabaseUrl && supabaseAnonKey && cookieHeader) {
      try {
        const ssr = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return cookieHeader
                .split(';')
                .map((c) => c.trim().split('='))
                .filter(([k]) => !!k)
                .map(([name, ...v]) => ({
                  name,
                  value: decodeURIComponent(v.join('=')),
                }));
            },
          },
        });
        const { data } = await ssr.auth.getUser();
        if (data?.user) {
          user = data.user;
        }
      } catch {
        // Fallback gracefully
      }
    }
  }

  if (!user) {
    return { error: 'Unauthorized: Authentication required.', status: 401 };
  }

  // 3. Fetch authoritative profile from database
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, role, first_name, surname, name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: 'Forbidden: Account profile not found.', status: 403 };
  }

  // 4. Role check (authoritative from profiles table, supporting array or string)
  if (requiredRole) {
    const userRole = (profile.role || 'student').toLowerCase().trim();
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole.map((r) => r.toLowerCase().trim())
      : [requiredRole.toLowerCase().trim()];

    const isAllowed = userRole === 'admin' || allowedRoles.includes(userRole);
    if (!isAllowed) {
      const requiredRoleLabel = Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole;
      return {
        error: `Forbidden: Action requires role "${requiredRoleLabel}".`,
        status: 403,
      };
    }
  }

  return { user, profile, adminClient };
}
