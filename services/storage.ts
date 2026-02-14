import { Car } from '../types';

const STORAGE_KEY = 'wedding_fleet_data';

// Initial Mock Data
const INITIAL_DATA: Car[] = [
  {
    id: 'car-1',
    plate: '京A·88888',
    driverName: '王叔',
    seats: { driver: '王叔', passenger: null, rearLeft: null, rearRight: null }
  },
  {
    id: 'car-2',
    plate: '京A·66666',
    driverName: '李哥',
    seats: { driver: '李哥', passenger: '小明', rearLeft: null, rearRight: null }
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const StorageService = {
  async getCars(): Promise<Car[]> {
    await delay(300); // Simulate network
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(raw);
  },

  async saveCars(cars: Car[]): Promise<void> {
    await delay(100); // Simulate network
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
  },
  
  // In a real implementation with a JSON file on server:
  // getCars would be: fetch('/api/data.json').then(res => res.json())
  // saveCars would be: fetch('/api/save', { method: 'POST', body: JSON.stringify(cars) })
};
