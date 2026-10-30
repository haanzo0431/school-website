'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/app/supabase';

let inFlightPromise = null;
let memoryUser = null;
let memoryProfile = null;
let memoryRole = null;

function inferRole(user, profile) {
  if (profile?.role && ['admin', 'teacher', 'parent', 'student'].includes(profile.role)) {
    return profile.role;
  }
  const email = (user?.email || '').toLowerCase().trim();
  if (email.startsWith('admin') || email.startsWith('a-') || email === 'admin@xonqa.school') {
    return 'admin';
  }
  if (email.startsWith('t-')) return 'teacher';
  if (email.startsWith('p-')) return 'parent';
  if (email.startsWith('s-')) return 'student';
  return 'student';
}

const UserContext = createContext({
  user: null,
  profile: null,
  role: 'student',
  loading: true,
  refreshUser: async () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(memoryUser);
  const [profile, setProfile] = useState(memoryProfile);
  const [role, setRole] = useState(memoryRole || 'student');
  const [loading, setLoading] = useState(!memoryUser);
  const isMountedRef = useRef(true);

  const fetchUserData = useCallback(async (force = false) => {
    // If a request is already in-flight, reuse it
    if (inFlightPromise && !force) {
      return inFlightPromise;
    }

    inFlightPromise = (async () => {
      try {
        // Fast local session check first (0ms if session cached in client)
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user || null;

        if (!authUser) {
          memoryUser = null;
          memoryProfile = null;
          memoryRole = 'student';
          if (isMountedRef.current) {
            setUser(null);
            setProfile(null);
            setRole('student');
          }
          return { user: null, profile: null, role: 'student' };
        }

        memoryUser = authUser;
        const initialInferred = inferRole(authUser, memoryProfile);
        if (isMountedRef.current) {
          setUser(authUser);
          setRole(initialInferred);
        }

        // Fetch user profile from database
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        const userRole = inferRole(authUser, profileData);
        memoryProfile = profileData;
        memoryRole = userRole;

        if (isMountedRef.current) {
          setProfile(profileData || null);
          setRole(userRole);
        }

        return { user: authUser, profile: profileData, role: userRole };
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        return { user: null, profile: null, role: 'student' };
      } finally {
        inFlightPromise = null;
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return inFlightPromise;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Run fetchUserData once on mount
    fetchUserData();

    // Listen to auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        memoryUser = null;
        memoryProfile = null;
        memoryRole = 'student';
        setUser(null);
        setProfile(null);
        setRole('student');
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Only trigger a re-fetch if user ID changed or profile missing
        if (!memoryUser || memoryUser.id !== session.user.id || !memoryProfile) {
          fetchUserData(true);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserData]);

  return (
    <UserContext.Provider value={{ user, profile, role, loading, refreshUser: () => fetchUserData(true) }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
