
import { AppConfig } from '../types';

/**
 * 默认配置项
 * 如果 config.json 加载失败，将回退到此配置
 */
const DEFAULT_CONFIG: AppConfig = {
  adminName: 'ylyt',
  weddingTitle: 'ylyt',
  infoMessage: '结亲时间预计 2026.3.21 7:00 左右哦',
  logoUrl: 'ylyt.png' 
};

export const ConfigService = {
  /**
   * 加载配置文件
   */
  async loadConfig(): Promise<AppConfig> {
    try {
      // 尝试加载当前目录下的 config.json
      const response = await fetch(`config.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.warn('未找到 config.json 配置文件，使用代码内置默认配置');
        return DEFAULT_CONFIG;
      }
      
      const config = await response.json();
      
      return {
        ...DEFAULT_CONFIG,
        ...config
      };
    } catch (e) {
      console.error('解析 config.json 失败', e);
      return DEFAULT_CONFIG;
    }
  },

  /**
   * 给图片链接添加时间戳防止缓存
   */
  getLogoUrlWithCacheBuster(url: string): string {
    if (!url) return '';
    // 如果是 data:uri 或者已经包含版本号则不处理
    if (url.startsWith('data:')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${Date.now()}`;
  }
};
