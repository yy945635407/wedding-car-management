
import { AppConfig } from '../types';

const DEFAULT_CONFIG: AppConfig = {
  adminName: 'ylyt',
  weddingTitle: 'ylyt',
  infoMessage: '结亲时间预计 2026.3.21 7:00 左右哦',
  logoUrl: '' // Empty by default, allows placeholder
};

export const ConfigService = {
  async loadConfig(): Promise<AppConfig> {
    try {
      // Use absolute path /config.json which works for both Dev (mapped to public) and Prod (root of dist)
      const response = await fetch(`/config.json?t=${Date.now()}`);
      if (!response.ok) {
        console.warn('Config file not found, using defaults');
        return DEFAULT_CONFIG;
      }
      return await response.json();
    } catch (e) {
      console.warn('Failed to load config.json, using defaults', e);
      return DEFAULT_CONFIG;
    }
  }
};
