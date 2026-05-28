/**
 * API Service — REST client for the BioStability FastAPI backend.
 * Falls back gracefully to mock data when the backend is unavailable.
 */
import { API_BASE_URL } from './firebaseConfig';
import { mockData } from '../data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMEOUT_MS = 5000;

async function _fetch(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const apiService = {
  /**
   * POST /sync-data
   * Send normalized wearable data to the backend.
   * Returns { success: true, offline: true } silently on network failure.
   */
  async syncData(userId, metrics, sourceDevice = 'Unknown Device') {
    try {
      return await _fetch(`${API_BASE_URL}/sync-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          metrics,
          source_device: sourceDevice,
        }),
      });
    } catch {
      return { success: false, offline: true };
    }
  },

  /**
   * GET /stability-score?user_id=xxx
   * Returns live stability score or falls back to mock data.
   */
  async getStabilityScore(userId) {
    try {
      return await _fetch(`${API_BASE_URL}/stability-score?user_id=${encodeURIComponent(userId)}`);
    } catch {
      return await _mockScoreResponse();
    }
  },

  /**
   * GET /trends?user_id=xxx&days=14
   * Returns historical trend data or falls back to mock data.
   */
  async getTrends(userId, days = 14) {
    try {
      return await _fetch(
        `${API_BASE_URL}/trends?user_id=${encodeURIComponent(userId)}&days=${days}`
      );
    } catch {
      return await _mockTrendsResponse();
    }
  },
};

// ── Mock fallback builders ─────────────────────────────────────────────────────

async function _mockScoreResponse() {
  try {
    const rawData = await AsyncStorage.getItem('@biostability:user_watch_data');
    if (rawData) {
      return JSON.parse(rawData);
    }
  } catch (e) {}

  const d = mockData.todayMetrics;
  return {
    score: d.stabilityScore,
    status: d.stabilityLabel,
    baseline: {
      hrv_ms: d.hrv.baseline,
      rhr_bpm: d.rhr.baseline,
      sleep_hrs: d.sleep.baseline,
      steps_count: d.steps.baseline,
    },
    current_raw: {
      hrv_ms: d.hrv.value,
      rhr_bpm: d.rhr.value,
      sleep_hrs: d.sleep.value,
      steps_count: d.steps.value,
    },
    deviations: {
      hrv_ms: -37.8,
      rhr_bpm: 14.8,
      sleep_hrs: -29.5,
      steps_count: -56.8,
    },
    invisible_drift: true,
    flagged_metrics: ['HRV suppressed 37.8%', 'RHR elevated 14.8%', 'Sleep reduced 29.5%'],
    offline: true,
  };
}

async function _mockTrendsResponse() {
  try {
    const rawData = await AsyncStorage.getItem('@biostability:user_watch_data');
    if (rawData) {
      const parsed = JSON.parse(rawData);
      // Generate clean, healthy historical trends ending with the linked watch's readings
      const trendList = mockData.trendsData.hrv.map((item, i) => {
        const isToday = i === mockData.trendsData.hrv.length - 1;
        return {
          day: item.day,
          actual: isToday ? parsed.current_raw.hrv_ms : 74 + Math.round((Math.random() - 0.5) * 4),
          hrv_ms: isToday ? parsed.current_raw.hrv_ms : 74 + Math.round((Math.random() - 0.5) * 4),
          rhr_bpm: isToday ? parsed.current_raw.rhr_bpm : 61 + Math.round((Math.random() - 0.5) * 3),
          sleep_hrs: isToday ? parsed.current_raw.sleep_hrs : 7.6 + (Math.random() - 0.5) * 0.8,
          steps_count: isToday ? parsed.current_raw.steps_count : 9500 + Math.round((Math.random() - 0.5) * 1500),
          score: isToday ? parsed.score : 92 + Math.round(Math.random() * 6),
          status: 'stable',
        };
      });
      return {
        baseline: { hrv_ms: 74, rhr_bpm: 61, sleep_hrs: 7.8, steps_count: 9500 },
        trends: trendList,
        offline: true,
      };
    }
  } catch (e) {}

  const trendList = mockData.trendsData.hrv.map((item, i) => ({
    day: item.day,
    actual: item.actual,
    hrv_ms: item.actual,
    rhr_bpm: mockData.trendsData.rhr[i]?.actual,
    sleep_hrs: mockData.trendsData.sleep[i]?.actual,
    steps_count: mockData.trendsData.steps[i]?.actual,
    score: mockData.stabilityScoreHistory[i]?.score ?? 75,
    status: mockData.stabilityScoreHistory[i]?.status ?? 'stable',
  }));

  return {
    baseline: { hrv_ms: 74, rhr_bpm: 61, sleep_hrs: 7.8, steps_count: 9500 },
    trends: trendList,
    offline: true,
  };
}
