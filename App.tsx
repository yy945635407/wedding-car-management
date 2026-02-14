
import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Car, SeatPosition, User, ViewState, Notification, NotificationType, AppConfig } from './types';
import { StorageService } from './services/storage';
import { ConfigService } from './services/config';
import { LogService } from './services/log';
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
  const [config, setConfig] = useState<AppConfig | null>(null);

  const showToast = (message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        await LogService.fetchIp();
        const [configData, carsData] = await Promise.all([
          ConfigService.loadConfig(),
          StorageService.getCars()
        ]);
        setConfig(configData);
        setCars(carsData);
      } catch (error) {
        console.error("Initialization failed", error);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (!loading) {
      StorageService.saveCars(cars);
    }
  }, [cars, loading]);

  useEffect(() => {
    const sessionUser = localStorage.getItem('wedding_user_session');
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser);
      setUser(parsed);
      setView({ type: 'HOME' });
    }
  }, []);

  const handleLogin = (name: string) => {
    if (!config) return;
    const newUser: User = {
      name,
      isAdmin: name === config.adminName
    };
    setUser(newUser);
    LogService.addLog(name, '登录', '进入系统');
    localStorage.setItem('wedding_user_session', JSON.stringify(newUser));
    setView({ type: 'HOME' });
    showToast(`欢迎, ${name}！`, 'success');
  };

  const handleLogout = () => {
    if (user) LogService.addLog(user.name, '登出', '主动退出登录');
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
    if (user) LogService.addLog(user.name, '添加车辆', `添加了车辆 ${plate}, 司机: ${driverName}`);
    setCars(prev => [...prev, newCar]);
    setView({ type: 'SEAT_SELECTION', carId: newCar.id });
    showToast('婚车添加成功', 'success');
  };

  const handleToggleSeat = (carId: string, position: SeatPosition) => {
    if (!user) return;
    const isDriverOfAnyCar = cars.some(c => c.driverName === user.name);
    
    if (isDriverOfAnyCar && position !== 'driver') {
        showToast("司机不能占用乘客座位！", 'error');
        return;
    }

    setCars(prevCars => {
      const targetCar = prevCars.find(c => c.id === carId);
      if (!targetCar) return prevCars;

      const previousCarState = JSON.parse(JSON.stringify(targetCar));
      const wasInThisSeat = targetCar.seats[position] === user.name;
      
      const cleanCars = prevCars.map(c => ({
        ...c,
        seats: {
          ...c.seats,
          passenger: c.seats.passenger === user.name ? null : c.seats.passenger,
          rearLeft: c.seats.rearLeft === user.name ? null : c.seats.rearLeft,
          rearRight: c.seats.rearRight === user.name ? null : c.seats.rearRight,
        }
      }));

      const newTargetCar = cleanCars.find(c => c.id === carId)!;
      let logMsg = '';

      if (!wasInThisSeat) {
        newTargetCar.seats[position] = user.name;
        const posName = { passenger: '副驾驶', rearLeft: '后排左', rearRight: '后排右' }[position];
        logMsg = `入座了 ${newTargetCar.plate} 的 ${posName}`;
      } else {
        const posName = { passenger: '副驾驶', rearLeft: '后排左', rearRight: '后排右' }[position];
        logMsg = `离开了 ${newTargetCar.plate} 的 ${posName}`;
      }
      
      LogService.addLog(user.name, wasInThisSeat ? '离座' : '选座', logMsg);
      return [...cleanCars];
    });
  };

  const handleDeleteCar = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (user && car) LogService.addLog(user.name, '删除车辆', `删除了车辆 ${car.plate}`);
    setCars(prev => prev.filter(c => c.id !== carId));
    showToast('婚车已删除', 'success');
  };

  const handleReorder = (newOrder: Car[]) => {
    if (user?.isAdmin) {
      LogService.addLog(user.name, '调整排序', '调整了车队顺序');
      setCars(newOrder);
    }
  };

  if (loading || !config) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-wedding-pink-dark">Loading...</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-ios-bg text-slate-900 font-sans selection:bg-wedding-pink selection:text-wedding-pink-dark">
      <ToastContainer notifications={notifications} />
      <AnimatePresence mode="wait">
        {view.type === 'LOGIN' && (
          <Login key="login" onLogin={handleLogin} weddingTitle={config.weddingTitle} logoUrl={config.logoUrl} />
        )}

        {view.type === 'HOME' && user && (
          <Home 
            key="home"
            currentUser={user}
            cars={cars}
            weddingTitle={config.weddingTitle}
            logoUrl={config.logoUrl}
            onLogout={handleLogout}
            onAddCar={() => setView({ type: 'ADD_CAR' })}
            onSelectCar={(id) => setView({ type: 'SEAT_SELECTION', carId: id })}
            onReorderCars={handleReorder}
            onDeleteCar={handleDeleteCar}
            onShowInfo={() => showToast(config.infoMessage, 'pink')}
          />
        )}

        {view.type === 'ADD_CAR' && (
          <AddCar key="add-car" onBack={() => setView({ type: 'HOME' })} onSubmit={handleAddCar} />
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
