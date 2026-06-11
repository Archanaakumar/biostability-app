/**
 * AuthContext — Supabase Auth Integration
 *
 * Replaces the local AsyncStorage mock with real Supabase authentication.
 * User sessions persist across app restarts and device reinstalls.
 *
 * Tables used:
 *   auth.users     — managed by Supabase automatically
 *   public.profiles — name, age, gender, hasSetupCompleted
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Helper: load profile row from Supabase and merge into user object ──────
  const fetchProfile = async (supabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const profile = (!error && data) ? data : {};

      return {
        uid:              supabaseUser.id,
        email:            supabaseUser.email,
        name:             profile.name  || '',
        age:              profile.age   || '',
        gender:           profile.gender || '',
        hasSetupCompleted: profile.has_setup_completed || false,
      };
    } catch (_) {
      return {
        uid:   supabaseUser.id,
        email: supabaseUser.email,
        name:  '',
        age:   '',
        gender: '',
        hasSetupCompleted: false,
      };
    }
  };

  // ── Boot: restore session from Supabase ───────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const fullUser = await fetchProfile(session.user);
          setUser(fullUser);
        }
      } catch (_) {}
      setLoading(false);
    };

    init();

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const fullUser = await fetchProfile(session.user);
          setUser(fullUser);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const signup = async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName  = name.trim();

    if (!cleanName)                         throw new Error('Full name is required.');
    if (!cleanEmail.includes('@'))           throw new Error('Enter a valid email address.');
    if (password.length < 6)                throw new Error('Password must be at least 6 characters.');

    const { data, error } = await supabase.auth.signUp({
      email:    cleanEmail,
      password: password,
    });

    if (error) throw new Error(error.message);

    const supabaseUser = data.user;

    // Create profile row immediately
    await supabase.from('profiles').upsert({
      id:                 supabaseUser.id,
      name:               cleanName,
      age:                '',
      gender:             '',
      has_setup_completed: false,
    });

    const fullUser = {
      uid:              supabaseUser.id,
      email:            cleanEmail,
      name:             cleanName,
      age:              '',
      gender:           '',
      hasSetupCompleted: false,
    };
    setUser(fullUser);
    return fullUser;
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) throw new Error('Email and password are required.');

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    cleanEmail,
      password: password,
    });

    if (error) throw new Error('Invalid email or password. Please check your credentials.');

    const fullUser = await fetchProfile(data.user);
    setUser(fullUser);
    return fullUser;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    // Clear local watch cache too
    await AsyncStorage.removeItem('@biostability:user_watch_data');
    await AsyncStorage.removeItem('@biostability:health_bridge_auth');
    setUser(null);
  };

  // ── Update Profile (name, age, gender, hasSetupCompleted) ─────────────────
  const updateProfile = async (updates) => {
    if (!user?.uid) return;

    // Map camelCase to snake_case for Supabase column names
    const dbUpdates = {};
    if (updates.name              !== undefined) dbUpdates.name                = updates.name;
    if (updates.age               !== undefined) dbUpdates.age                 = updates.age;
    if (updates.gender            !== undefined) dbUpdates.gender              = updates.gender;
    if (updates.hasSetupCompleted !== undefined) dbUpdates.has_setup_completed = updates.hasSetupCompleted;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.uid, ...dbUpdates });

    if (error) {
      console.error('Supabase Profiles Upsert Error:', error);
      throw new Error(error.message);
    }

    const updated = { ...user, ...updates };
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be called inside <AuthProvider>');
  return ctx;
}
