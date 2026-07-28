/**
 * Health Bridge Service
 *
 * Delegates to Health Connect (Android 14+) for REAL data from your Noise watch.
 * Data flow: Noise Watch → (Bluetooth) → NoiseFit App → Health Connect → This service
 *
 * Google Fit is deprecated. Health Connect is the modern standard.
 */
import { healthConnectService } from './healthConnectService';

class HealthBridgeService {

  async isAuthorized() {
    return await healthConnectService.isAuthorized();
  }

  /**
   * Grant permission — opens Health Connect native permission dialog.
   * User grants access to Steps, Heart Rate, Sleep, HRV.
   */
  async grantPermission(userId) {
    return await healthConnectService.grantPermission(userId);
  }

  /**
   * Sync watch data — reads REAL data from Health Connect.
   * Your Noise watch must be syncing to NoiseFit app with Health Connect enabled.
   */
  async syncWatchDataDirectly(userId, watchName = 'Noise ColorFit Pro') {
    return await healthConnectService.syncWatchData(userId, watchName);
  }

  async revokePermission() {
    return await healthConnectService.revokePermission();
  }
}

export const healthBridge = new HealthBridgeService();
