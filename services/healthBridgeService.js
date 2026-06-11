/**
 * Health Bridge Service — Expo Go Compatible Version
 *
 * Simulates realistic smartwatch data that changes based on real time of day.
 * No native modules used — works 100% in Expo Go.
 *
 * In a production APK build, replace the simulation functions below
 * with real react-native-health (iOS) or react-native-health-connect (Android) calls.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';
import { supabase } from './supabaseConfig';


// ── Realistic data generators ────────────────────────────────────────────────

function getRealisticSteps() {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const hourlyBase = [
    0, 0, 0, 0, 0, 0,
    200, 600, 1100, 1800,
    2400, 3100, 3700, 4300,
    4850, 5400, 5900, 6400,
    7000, 7500, 8100, 8600,
    9000, 9300,
  ];
  const base = hourlyBase[Math.min(hour, 23)] || 4850;
  const minuteBoost = Math.round((minute / 60) * 500);
  const jitter = Math.round((Math.random() - 0.5) * 120);
  return Math.max(0, base + minuteBoost + jitter);
}

function getRealisticBattery() {
  const hour = new Date().getHours();
  const base = Math.round(85 - (Math.max(0, hour - 6) / 17) * 65);
  return `${Math.max(10, Math.min(95, base))}%`;
}

function getRealisticHRV() {
  return Math.round(72 + (Math.random() - 0.5) * 14);
}

function getRealisticRHR() {
  return Math.round(61 + (Math.random() - 0.5) * 6);
}

// ── Service class ─────────────────────────────────────────────────────────────

class HealthBridgeService {
  constructor() {
    this.permissionsKey = '@biostability:health_bridge_auth';
    this.watchDataKey = '@biostability:user_watch_data';
  }

  async isAuthorized() {
    try {
      return (await AsyncStorage.getItem(this.permissionsKey)) === 'granted';
    } catch {
      return false;
    }
  }

  async grantPermission(userId) {
    await AsyncStorage.setItem(this.permissionsKey, 'granted');
    return await this.syncWatchDataDirectly(userId);
  }

  async syncWatchDataDirectly(userId, watchName = 'Noise ColorFit Pro') {
    const steps    = getRealisticSteps();
    const battery  = getRealisticBattery();
    const hrv      = getRealisticHRV();
    const rhr      = getRealisticRHR();
    const sleep    = parseFloat((7.2 + (Math.random() - 0.5) * 1.2).toFixed(1));
    const score    = parseFloat((Math.min(99, 75 + (steps / 9500) * 20 + (Math.random() - 0.5) * 4)).toFixed(1));

    const watchData = {
      score,
      status: steps > 6000 ? 'Optimal' : 'Calibrating',
      baseline: { hrv_ms: 74, rhr_bpm: 61, sleep_hrs: 7.8, steps_count: 9500 },
      current_raw: { hrv_ms: hrv, rhr_bpm: rhr, sleep_hrs: sleep, steps_count: steps },
      deviations: {
        hrv_ms:      parseFloat(((hrv  - 74)   / 74   * 100).toFixed(1)),
        rhr_bpm:     parseFloat(((rhr  - 61)   / 61   * 100).toFixed(1)),
        sleep_hrs:   parseFloat(((sleep - 7.8) / 7.8  * 100).toFixed(1)),
        steps_count: parseFloat(((steps - 9500)/ 9500 * 100).toFixed(1)),
      },
      invisible_drift: false,
      flagged_metrics: [],
      offline: true,
      battery,
      watch_name: watchName,
      is_native_hardware_sync: false,
      sync_method: 'local_health_bridge',
      last_synced_at: new Date().toISOString(),
    };

    // Try backend sync — silently ignored if offline
    try {
      await apiService.syncData(userId, { hrv, rhr, sleep, steps, battery }, `Health Bridge (${watchName})`);
    } catch (_) {}

    await AsyncStorage.setItem(this.watchDataKey, JSON.stringify(watchData));

    // ── Persist to Supabase daily_metrics (cloud record) ──────────────────
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase.from('daily_metrics').insert({
          user_id:         session.user.id,
          steps_count:     steps,
          sleep_hrs:       sleep,
          hrv_ms:          hrv,
          rhr_bpm:         rhr,
          battery:         battery,
          stability_score: score,
          status:          watchData.status,
        });
        if (error) {
          console.error('Supabase Daily Metrics Insert Error:', error);
        }
      }
    } catch (err) {
      console.error('Supabase Daily Metrics Catch Error:', err);
    }

    return watchData;
  }

  async revokePermission() {
    await AsyncStorage.removeItem(this.permissionsKey);
    await AsyncStorage.removeItem(this.watchDataKey);
  }
}

export const healthBridge = new HealthBridgeService();
