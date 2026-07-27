/**
 * Supabase Client — BioStability
 *
 * Project URL : https://bbxaxsipeiwcuydgzgdd.supabase.co
 * Tables      : profiles, daily_metrics
 *
 * The URL polyfill is imported at the top unconditionally so Metro bundler
 * (React Native APK) can statically resolve it.
 * On web, react-native-url-polyfill is a no-op because the web bundle uses
 * the browser's native URL — the package does nothing harmful there.
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL  = 'https://bbxaxsipeiwcuydgzgdd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieGF4c2lwZWl3Y3V5ZGd6Z2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODE1NDksImV4cCI6MjA5NTc1NzU0OX0.Ly7xwxj9pnx6p1p8FZHdBndxApxep3SJi2Ce6ezY2lk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    // AsyncStorage for native (APK), undefined = localStorage on web
    storage:            Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken:   true,
    persistSession:     true,
    // Only on web: process auth redirect URLs (email confirm links etc.)
    detectSessionInUrl: Platform.OS === 'web',
  },
});
