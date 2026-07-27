/**
 * Supabase Client — BioStability
 *
 * Project URL : https://bbxaxsipeiwcuydgzgdd.supabase.co
 * Tables      : profiles, daily_metrics
 *
 * NOTE: The URL polyfill MUST only be imported on native (iOS/Android).
 * On web (Vercel), the browser already has a native URL class.
 * Importing the polyfill on web can silently break Supabase fetch internals.
 */
import { Platform } from 'react-native';

// Only apply polyfill on native — browsers have URL built-in
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL  = 'https://bbxaxsipeiwcuydgzgdd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieGF4c2lwZWl3Y3V5ZGd6Z2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODE1NDksImV4cCI6MjA5NTc1NzU0OX0.Ly7xwxj9pnx6p1p8FZHdBndxApxep3SJi2Ce6ezY2lk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:           Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken:  true,
    persistSession:    true,
    detectSessionInUrl: Platform.OS === 'web', // handles email redirect links on web
  },
});
