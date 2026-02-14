
import { AppConfig } from '../types';

/**
 * 默认配置项
 * 如果 config.json 加载失败，将回退到此配置
 */
const DEFAULT_CONFIG: AppConfig = {
  adminName: 'ylyt',
  weddingTitle: 'ylyt',
  infoMessage: '结亲时间预计 2026.3.21 7:00 左右哦',
  logoUrl: '' 
};

export const ConfigService = {
  /**
   * 加载配置文件
   * 开发环境下：读取 /public/config.json
   * 生产环境下：读取构建产物根目录下的 /config.json
   */
  async loadConfig(): Promise<AppConfig> {
    try {
      // 增加 cache: 'no-store' 强制浏览器不缓存此请求
      const response = await fetch(`/config.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.warn('未找到 config.json 配置文件，将使用默认配置');
        return DEFAULT_CONFIG;
      }
      
      const config = await response.json();
      // 验证必要字段，防止空的 JSON 导致崩溃
      return {
        ...DEFAULT_CONFIG,
        ...config
      };
    } catch (e) {
      console.error('解析 config.json 失败，请检查文件格式是否为标准的 JSON', e);
      return DEFAULT_CONFIG;
    }
  }
};
