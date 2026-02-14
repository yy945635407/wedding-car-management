
import { Car } from '../types';

const API_URL = '/api/cars';

export const StorageService = {
  /**
   * 从后端 API 获取公共车队数据
   */
  async getCars(): Promise<Car[]> {
    try {
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API 获取失败，尝试加载静态备用数据:', error);
      try {
        const fallback = await fetch('cars.json').then(res => res.json());
        return fallback;
      } catch (e) {
        return [];
      }
    }
  },

  /**
   * 将数据保存至服务器
   */
  async saveCars(cars: Car[]): Promise<boolean> {
    if (!cars || cars.length === 0) return true;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cars)
      });
      
      return response.ok;
    } catch (error) {
      console.error('保存至云端失败:', error);
      return false;
    }
  }
};
