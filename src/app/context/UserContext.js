'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/app/supabase';

const UserContext = createContext({
  user: null,
  profile: null,
  role: 'student',
  loading: true,
  refreshUser: async () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        setProfile(null);
        setRole('student');
        return { user: null, profile: null, role: 'student' };
      }

      setUser(authUser);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const userRole = profileData?.role || 'student';
      if (profileData) {
        setProfile(profileData);
        setRole(userRole);
      } else {
        setProfile(null);
        setRole('student');
      }
      return { user: authUser, profile: profileData, role: userRole };
    } catch (err) {
      console.error('Error fetching user context:', err);
      return { user: null, profile: null, role: 'student' };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!isMounted) return;
      await fetchUserData();
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        init();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setRole('student');
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserData]);

  return (
    <UserContext.Provider value={{ user, profile, role, loading, refreshUser: fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
