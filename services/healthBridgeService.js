/**
 * Health Bridge Service
 *
 * On Android APK: delegates to googleFitService which reads REAL data
 * from Google Fit (your Noise watch → NoiseFit app → Google Fit → here).
 *
 * Falls back to realistic simulation when Google Fit is unavailable.
 */
import { googleFitService } from './googleFitService';

class HealthBridgeService {

  async isAuthorized() {
    return await googleFitService.isAuthorized();
  }

  /**
   * Grant permission — triggers Google account picker on Android APK.
   * User selects the Google account linked to NoiseFit.
   */
  async grantPermission(userId) {
    return await googleFitService.grantPermission(userId);
  }

  /**
   * Sync watch data — reads REAL steps, heart rate and sleep from Google Fit.
   * Your Noise watch must be syncing to NoiseFit app with Google Fit enabled (already done ✅).
   */
  async syncWatchDataDirectly(userId, watchName = 'Noise ColorFit Pro') {
    return await googleFitService.syncWatchData(userId, watchName);
  }

  async revokePermission() {
    return await googleFitService.revokePermission();
  }
}

export const healthBridge = new HealthBridgeService();
