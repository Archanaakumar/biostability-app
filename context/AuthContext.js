/**
 * AuthContext — Local mock authentication using AsyncStorage
 *
 * Provides full Login/Signup/Logout flow without requiring Firebase keys.
 * Stores user credentials and session locally on the device.
 *
 * To upgrade to real Firebase Auth later:
 *   1. Update FIREBASE_CONFIG in services/firebaseConfig.js
 *   2. Replace login/signup/logout below with Firebase SDK calls:
 *      import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const SESSION_KEY = '@biostability:session';
const USERS_DB_KEY = '@biostability:users';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app boot
  useEffect(() => {
    // Clear active session on app startup to guarantee the login screen opens first as requested
    const init = async () => {
      try {
        await AsyncStorage.removeItem(SESSION_KEY);
        // Pre-seed Dr. Archanaa profile
        const raw = await AsyncStorage.getItem(USERS_DB_KEY);
        const users = raw ? JSON.parse(raw) : {};
        const email = 'archanaa@gmail.com';
        if (!users[email]) {
          users[email] = {
            uid: 'uid_archanaa_123',
            name: 'Dr. Archanaa',
            email: email,
            createdAt: new Date().toISOString(),
            _pw: '123456'
          };
          await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        }

        // Auto-upgrade and refresh cached watch data to clear old generic data
        const rawWatch = await AsyncStorage.getItem('@biostability:user_watch_data');
        if (rawWatch) {
          const parsed = JSON.parse(rawWatch);
          if (parsed.watch_name !== 'Pulse Go Buzz' || parsed.current_raw?.steps_count === 0 || parsed.battery !== '26%') {
            const freshWatch = {
              score: 96.0,
              status: 'Optimal',
              baseline: { hrv_ms: 74, rhr_bpm: 61, sleep_hrs: 7.8, steps_count: 9500 },
              current_raw: { hrv_ms: 78.0, rhr_bpm: 60.0, sleep_hrs: 7.6, steps_count: 4850 },
              deviations: { hrv_ms: 5.4, rhr_bpm: -1.6, sleep_hrs: -2.5, steps_count: -48.9 },
              invisible_drift: false,
              flagged_metrics: [],
              offline: false,
              battery: '26%',
              watch_name: 'Pulse Go Buzz',
              sync_method: 'local_health_bridge',
              last_synced_at: new Date().toISOString()
            };
            await AsyncStorage.setItem('@biostability:user_watch_data', JSON.stringify(freshWatch));
            
            // Sync up the FastAPI backend dynamically on boot
            try {
              const { apiService } = require('../services/apiService');
              await apiService.syncData(
                'uid_archanaa_123',
                { hrv: 78.0, rhr: 60.0, sleep: 7.6, steps: 4850, battery: '26%' },
                'Health Connect (Pulse Go Buzz)'
              );
            } catch (err) {}
          }
        }
      } catch (e) {}
      setLoading(false);
    };
    init();
  }, []);

  /**
   * Create a new account.
   * Validates inputs, checks for duplicate email, persists user.
   */
  const signup = async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) throw new Error('Full name is required.');
    if (!cleanEmail.includes('@')) throw new Error('Enter a valid email address.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    const raw = await AsyncStorage.getItem(USERS_DB_KEY);
    const users = raw ? JSON.parse(raw) : {};

    if (users[cleanEmail]) {
      throw new Error('An account with this email already exists. Try logging in.');
    }

    const newUser = {
      uid: `uid_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
    };

    users[cleanEmail] = { ...newUser, _pw: password };
    await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  /**
   * Sign in with email and password.
   */
  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) throw new Error('Email and password are required.');

    const raw = await AsyncStorage.getItem(USERS_DB_KEY);
    const users = raw ? JSON.parse(raw) : {};
    const stored = users[cleanEmail];

    if (!stored || stored._pw !== password) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const { _pw, ...userData } = stored;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  /**
   * Sign out and clear session.
   */
  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  /**
   * Update profile fields (name, etc.) for the current user.
   */
  const updateProfile = async (updates) => {
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));

    // Sync to users DB
    const raw = await AsyncStorage.getItem(USERS_DB_KEY);
    if (raw) {
      const users = JSON.parse(raw);
      if (users[user.email]) {
        users[user.email] = { ...users[user.email], ...updates };
        await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      }
    }
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
