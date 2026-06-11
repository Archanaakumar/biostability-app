/**
 * Terra API WebSocket Service
 *
 * Connects to the BioStability backend WebSocket for real-time health data.
 * When the backend is offline, operates silently without crashing.
 *
 * TODO: When TERRA_API_KEY is set in backend/.env, the backend will
 * pipe real Terra wearable data through this same WebSocket connection.
 */
import { WS_BASE_URL } from './firebaseConfig';

class TerraWebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectCount = 0;
    this.maxReconnects = 5;
    this.baseDelay = 2000; // ms
    this._onData = null;
    this._onStatus = null;
    this._userId = null;
  }

  /**
   * Connect to the Terra WebSocket bridge.
   * @param {string} userId
   * @param {function} onData - Called with normalized biomarker object on each update
   * @param {function} onStatus - Called with status string: 'connected'|'disconnected'|'error'|'unavailable'
   */
  connect(userId, onData, onStatus) {
    // Skip WebSocket entirely when no backend is configured (Expo Go mode)
    if (!WS_BASE_URL) {
      onStatus?.('unavailable');
      return;
    }
    this._userId = userId;
    this._onData = onData;
    this._onStatus = onStatus;
    this._open();
  }

  disconnect() {
    this.reconnectCount = this.maxReconnects; // Stop reconnect loop
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  _open() {
    try {
      this.ws = new WebSocket(`${WS_BASE_URL}/terra/${this._userId}`);

      this.ws.onopen = () => {
        this.reconnectCount = 0;
        this._onStatus?.('connected');
      };

      this.ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'biomarker_update' && msg.data) {
            this._onData?.(msg.data);
          }
        } catch { /* ignore malformed messages */ }
      };

      this.ws.onclose = () => {
        this._onStatus?.('disconnected');
        this._scheduleReconnect();
      };

      this.ws.onerror = () => {
        this._onStatus?.('error');
      };
    } catch {
      this._onStatus?.('unavailable');
    }
  }

  _scheduleReconnect() {
    if (this.reconnectCount >= this.maxReconnects) return;
    const delay = this.baseDelay * Math.pow(2, this.reconnectCount);
    this.reconnectCount++;
    setTimeout(() => this._open(), delay);
  }
}

// Singleton — shared across all screens
export const terraService = new TerraWebSocketService();
