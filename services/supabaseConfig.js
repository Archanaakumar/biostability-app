/**
 * Supabase Client — BioStability
 *
 * Project URL : https://bbxaxsipeiwcuydgzgdd.supabase.co
 * Tables      : profiles, daily_metrics
 *
 * NOTE: The URL polyfill MUST be the very first import — before @supabase/supabase-js.
 * Without this, React Native APKs throw "Network request failed" because the global
 * URL class is missing and Supabase's fetch internals break silently.
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL  = 'https://bbxaxsipeiwcuydgzgdd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieGF4c2lwZWl3Y3V5ZGd6Z2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODE1NDksImV4cCI6MjA5NTc1NzU0OX0.Ly7xwxj9pnx6p1p8FZHdBndxApxep3SJi2Ce6ezY2lk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined, // fallback to localStorage on web
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web', // true for web redirects, false for native
  },
});
