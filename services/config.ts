
import { AppConfig } from '../types';

/**
 * 默认配置项
 */
const DEFAULT_CONFIG: AppConfig = {
  adminName: 'ylyt',
  weddingTitle: 'ylyt',
  infoMessage: '结亲时间预计 2026.3.21 7:00 左右哦',
  logoUrl: 'ylyt.png' 
};

// 使用单次页面加载时固定的时间戳，确保在应用运行期间 URL 稳定，减少闪烁
const sessionTimestamp = Date.now();

export const ConfigService = {
  /**
   * 加载配置文件
   */
  async loadConfig(): Promise<AppConfig> {
    try {
      const response = await fetch(`config.json?t=${sessionTimestamp}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) return DEFAULT_CONFIG;
      const config = await response.json();
      return { ...DEFAULT_CONFIG, ...config };
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  },

  /**
   * 生成带稳定版本号的图片 URL
   */
  getLogoUrlWithCacheBuster(url: string): string {
    if (!url || url.startsWith('data:')) return url;
    const separator = url.includes('?') ? '&' : '?';
    // 使用 session 级别的时间戳，保证在此次页面访问期间 URL 是唯一的但稳定的
    return `${url}${separator}v=${sessionTimestamp}`;
  }
};
