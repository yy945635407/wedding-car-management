
import React, { useEffect, useState, useCallback } from 'react';
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

  // 使用 useCallback 保证引用稳定
  const showToast = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000); // 稍微延长显示时间
  }, []);

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
        
        // 自动恢复会话
        const sessionUser = localStorage.getItem('wedding_user_session');
        if (sessionUser) {
          const parsed = JSON.parse(sessionUser);
          setUser(parsed);
          setView({ type: 'HOME' });
        }
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
    showToast('已安全退出登录', 'info');
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
    showToast('婚车添加成功，请分配座位', 'success');
  };

  const handleToggleSeat = (carId: string, position: SeatPosition) => {
    if (!user) return;
    const isDriverOfAnyCar = cars.some(c => c.driverName === user.name);
    
    if (isDriverOfAnyCar && position !== 'driver') {
        showToast("司机请专注于驾驶哦，不要占用乘客位~", 'error');
        return;
    }

    setCars(prevCars => {
      const targetCar = prevCars.find(c => c.id === carId);
      if (!targetCar) return prevCars;

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
      const posName = { passenger: '副驾驶', rearLeft: '后排左', rearRight: '后排右' }[position];

      if (!wasInThisSeat) {
        newTargetCar.seats[position] = user.name;
        showToast(`成功入座 ${newTargetCar.plate} 的 ${posName}`, 'success');
        LogService.addLog(user.name, '选座', `入座了 ${newTargetCar.plate} 的 ${posName}`);
      } else {
        showToast(`已从 ${newTargetCar.plate} 离座`, 'info');
        LogService.addLog(user.name, '离座', `离开了 ${newTargetCar.plate} 的 ${posName}`);
      }
      
      return [...cleanCars];
    });
  };

  const handleDeleteCar = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (user && car) LogService.addLog(user.name, '删除车辆', `删除了车辆 ${car.plate}`);
    setCars(prev => prev.filter(c => c.id !== carId));
    showToast('车辆已成功从车队移除', 'success');
  };

  const handleReorder = (newOrder: Car[]) => {
    if (user?.isAdmin) {
      setCars(newOrder);
    }
  };

  if (loading || !config) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-wedding-pink border-t-wedding-pink-dark rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">正在筹备车队...</p>
      </div>
    );
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
