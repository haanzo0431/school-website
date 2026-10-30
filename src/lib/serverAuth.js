import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing.');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Verifies the caller JWT from Authorization header or cookie,
 * checks their profile in Supabase, and verifies their role.
 *
 * @param {Request} req - Incoming Next.js request
 * @param {string|null} requiredRole - e.g. 'admin', 'teacher', 'student'
 * @returns {Promise<{ user: any, profile: any, adminClient: any, error?: string, status?: number }>}
 */
export async function verifyCaller(req, requiredRole = null) {
  let adminClient;
  try {
    adminClient = getSupabaseAdmin();
  } catch (err) {
    return { error: err.message, status: 500 };
  }

  let user = null;

  // 1. Extract Bearer token from Authorization header
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

  // 2. If token not in header, attempt to verify from session cookies via @supabase/ssr
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
        // Fallback to next step
      }
    }
  }

  // 3. Fallback: manual cookie token extraction
  if (!user) {
    const cookieHeader = req.headers.get('cookie') || '';
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader
          .split(';')
          .map((c) => c.trim().split('='))
          .filter(([k]) => !!k)
          .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
      );

      for (const [key, value] of Object.entries(cookies)) {
        if (key.includes('-auth-token') || key.endsWith('access-token')) {
          let token = null;
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed[0]) {
              token = parsed[0];
            } else if (parsed?.access_token) {
              token = parsed.access_token;
            }
          } catch {
            if (value && value.length > 30 && !value.startsWith('base64-')) {
              token = value;
            }
          }
          if (token) {
            const { data } = await adminClient.auth.getUser(token);
            if (data?.user) {
              user = data.user;
              break;
            }
          }
        }
      }
    }
  }

  if (!user) {
    return { error: 'Unauthorized: Authentication token is required.', status: 401 };
  }

  // 4. Fetch authoritative profile from database
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: 'Unauthorized: User profile does not exist.', status: 403 };
  }

  // 5. Role check (authoritative from profiles table)
  if (requiredRole) {
    const role = profile.role || 'student';
    const isAllowed = role === requiredRole || role === 'admin';
    if (!isAllowed) {
      return {
        error: `Forbidden: Action requires role "${requiredRole}". Your role is "${role}".`,
        status: 403,
      };
    }
  }

  return { user, profile, adminClient };
}
