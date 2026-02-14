import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppData, Car, SeatPosition, User, ViewState, Notification, NotificationType } from './types';
import { StorageService } from './services/storage';
import { ADMIN_NAME, WEDDING_DATE_INFO } from './constants';
import { Login } from './views/Login';
import { Home } from './views/Home';
import { AddCar } from './views/AddCar';
import { SeatSelection } from './views/SeatSelection';
import { ToastContainer } from './components/Toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>({ type: 'LOGIN' });
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Notification Helper
  const showToast = (message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000); // Slightly longer for readability
  };

  // Load cars on mount
  useEffect(() => {
    StorageService.getCars().then(data => {
      setCars(data);
      setLoading(false);
    });
  }, []);

  // Save cars on change
  useEffect(() => {
    if (!loading) {
      StorageService.saveCars(cars);
    }
  }, [cars, loading]);

  // Session check
  useEffect(() => {
    const sessionUser = localStorage.getItem('wedding_user_session');
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser);
      setUser(parsed);
      setView({ type: 'HOME' });
    }
  }, []);

  const handleLogin = (name: string) => {
    const newUser: User = {
      name,
      isAdmin: name === ADMIN_NAME
    };
    setUser(newUser);
    localStorage.setItem('wedding_user_session', JSON.stringify(newUser));
    setView({ type: 'HOME' });
    showToast(`欢迎, ${name}！`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('wedding_user_session');
    setUser(null);
    setView({ type: 'LOGIN' });
    showToast('已退出登录', 'info');
  };

  const handleAddCar = (plate: string, driverName: string) => {
    const newCar: Car = {
      id: `car-${Date.now()}`,
      plate,
      driverName,
      seats: {
        driver: driverName,
        passenger: null,
        rearLeft: null,
        rearRight: null
      }
    };
    setCars(prev => [...prev, newCar]);
    setView({ type: 'SEAT_SELECTION', carId: newCar.id });
    showToast('婚车添加成功', 'success');
  };

  const handleToggleSeat = (carId: string, position: SeatPosition) => {
    if (!user) return;

    // Check if user is a driver of ANY car (cannot sit as passenger if they are a driver guest)
    const isDriverOfAnyCar = cars.some(c => c.driverName === user.name);
    
    // We determine "Is Driver" if their name matches any car's driverName.
    // However, if they are the driver of *this* car, they are already in the driver seat (seat 0).
    // The SeatSelection view prevents clicking the driver seat.
    // So we just need to prevent them from picking other seats if they are a driver elsewhere.
    if (isDriverOfAnyCar && position !== 'driver') {
        showToast("司机不能占用乘客座位！", 'error');
        return;
    }

    setCars(prevCars => {
      // 1. Remove user from ANY other seat in ANY car
      const cleanCars = prevCars.map(c => ({
        ...c,
        seats: {
          driver: c.seats.driver, // Driver seat is permanent to the car definition usually, but let's assume it's fixed
          passenger: c.seats.passenger === user.name ? null : c.seats.passenger,
          rearLeft: c.seats.rearLeft === user.name ? null : c.seats.rearLeft,
          rearRight: c.seats.rearRight === user.name ? null : c.seats.rearRight,
        }
      }));

      // 2. If the user clicked a seat they were already in (implied by Logic 1, they are now removed), 
      // we check if the INTENTION was to toggle off.
      // Logic 1 removed them. Logic 2: Put them in the new spot unless it was the same spot.
      
      const targetCarIndex = cleanCars.findIndex(c => c.id === carId);
      if (targetCarIndex === -1) return prevCars;

      const targetCar = cleanCars[targetCarIndex];
      const previousCar = prevCars.find(c => c.id === carId);
      const wasInThisSeat = previousCar?.seats[position] === user.name;

      if (!wasInThisSeat) {
        // Assign to new seat
        if (position === 'passenger') targetCar.seats.passenger = user.name;
        if (position === 'rearLeft') targetCar.seats.rearLeft = user.name;
        if (position === 'rearRight') targetCar.seats.rearRight = user.name;
      } else {
        // Just removed
      }
      
      return [...cleanCars];
    });
  };

  const handleDeleteCar = (carId: string) => {
    setCars(prev => prev.filter(c => c.id !== carId));
    showToast('婚车已删除', 'success');
  };

  const handleReorder = (newOrder: Car[]) => {
    // Only admin can trigger this via UI, but safe to check
    if (user?.isAdmin) {
      setCars(newOrder);
    }
  };

  // --- Render ---

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-wedding-pink-dark">Loading...</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-ios-bg text-slate-900 font-sans selection:bg-wedding-pink selection:text-wedding-pink-dark">
      <ToastContainer notifications={notifications} />
      <AnimatePresence mode="wait">
        
        {view.type === 'LOGIN' && (
          <Login key="login" onLogin={handleLogin} />
        )}

        {view.type === 'HOME' && user && (
          <Home 
            key="home"
            currentUser={user}
            cars={cars}
            onLogout={handleLogout}
            onAddCar={() => setView({ type: 'ADD_CAR' })}
            onSelectCar={(id) => setView({ type: 'SEAT_SELECTION', carId: id })}
            onReorderCars={handleReorder}
            onDeleteCar={handleDeleteCar}
            onShowInfo={() => showToast(WEDDING_DATE_INFO, 'pink')}
          />
        )}

        {view.type === 'ADD_CAR' && (
          <AddCar 
            key="add-car"
            onBack={() => setView({ type: 'HOME' })}
            onSubmit={handleAddCar}
          />
        )}

        {view.type === 'SEAT_SELECTION' && user && (
          <SeatSelection 
            key="seats"
            user={user}
            car={cars.find(c => c.id === view.carId)!}
            onBack={() => setView({ type: 'HOME' })}
            onToggleSeat={handleToggleSeat}
          />
        )}

      </AnimatePresence>
    </div>
  );
};

export default App;