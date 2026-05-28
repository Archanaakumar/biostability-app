/**
 * BioStability — Firebase & API Configuration
 *
 * ⚠️  NO REAL KEYS REQUIRED FOR DEVELOPMENT ⚠️
 * The app uses a local AsyncStorage-based mock auth by default.
 *
 * To enable real Firebase:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project → Project Settings → Your apps → Web app
 * 3. Copy the firebaseConfig object and paste it into FIREBASE_CONFIG below
 *
 * To enable real Terra API:
 * 1. Sign up at https://tryterra.co
 * 2. Copy your Dev ID and API key into TERRA_CONFIG below
 */

// TODO: Replace with your Firebase project config
export const FIREBASE_CONFIG = {
  apiKey: 'TODO_YOUR_FIREBASE_API_KEY',
  authDomain: 'TODO_YOUR_PROJECT.firebaseapp.com',
  projectId: 'TODO_YOUR_PROJECT_ID',
  storageBucket: 'TODO_YOUR_PROJECT.appspot.com',
  messagingSenderId: 'TODO_SENDER_ID',
  appId: 'TODO_APP_ID',
};

// TODO: Replace with your Terra API credentials from https://tryterra.co
export const TERRA_CONFIG = {
  devId: 'TODO_YOUR_TERRA_DEV_ID',
  apiKey: 'TODO_YOUR_TERRA_API_KEY',
  widgetUrl: 'https://widget.tryterra.co/auth',
  webhookDestination: 'https://api.biostability.ai/v1/terra-webhook',
};

import Constants from 'expo-constants';

const getBackendUrl = () => {
  let localIp = 'localhost';
  try {
    if (Constants.expoConfig?.hostUri) {
      localIp = Constants.expoConfig.hostUri.split(':').shift();
    }
  } catch (e) {}
  return {
    api: `http://${localIp}:8000/api/v1`,
    ws: `ws://${localIp}:8000/ws`
  };
};

const urls = getBackendUrl();
export const API_BASE_URL = urls.api;
export const WS_BASE_URL = urls.ws;

// Flags — auto-detected from placeholder values
export const IS_FIREBASE_CONFIGURED = !FIREBASE_CONFIG.apiKey.startsWith('TODO_');
export const IS_TERRA_CONFIGURED = !TERRA_CONFIG.devId.startsWith('TODO_');
