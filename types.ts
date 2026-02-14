
export interface User {
  name: string;
  isAdmin: boolean;
}

export type SeatPosition = 'driver' | 'passenger' | 'rearLeft' | 'rearRight';

export interface Seats {
  driver: string; // The assigned driver's name
  passenger: string | null;
  rearLeft: string | null;
  rearRight: string | null;
}

export interface Car {
  id: string;
  plate: string;
  driverName: string;
  seats: Seats;
}

export interface AppData {
  cars: Car[];
}

export interface AppConfig {
  adminName: string;
  weddingTitle: string;
  infoMessage: string;
}

export type ViewState = 
  | { type: 'LOGIN' }
  | { type: 'HOME' }
  | { type: 'ADD_CAR' }
  | { type: 'SEAT_SELECTION'; carId: string };

export type NotificationType = 'success' | 'error' | 'info' | 'pink';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}
