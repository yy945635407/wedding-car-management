
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  
  const isFirstLoad = useRef(true);

  const showToast = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
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
        
        const sessionUser = localStorage.getItem('wedding_user_session');
        if (sessionUser) {
          setUser(JSON.parse(sessionUser));
          setView({ type: 'HOME' });
        }
      } catch (error) {
        showToast("无法获取云端数据，请确认后端已启动", "error");
      } finally {
        setLoading(false);
        isFirstLoad.current = false;
      }
    };
    initApp();
  }, [showToast]);

  // 监听数据变化并同步至后端
  useEffect(() => {
    if (!loading && !isFirstLoad.current) {
      StorageService.saveCars(cars).then(isSynced => {
        if (isSynced) {
          console.log("云端数据同步成功");
        } else {
          showToast("数据保存至云端失败", "error");
        }
      });
    }
  }, [cars, loading, showToast]);

  const handleLogin = (name: string) => {
    if (!config) return;
    const newUser: User = { name, isAdmin: name === config.adminName };
    setUser(newUser);
    LogService.addLog(name, '登录', '进入系统');
    localStorage.setItem('wedding_user_session', JSON.stringify(newUser));
    setView({ type: 'HOME' });
    showToast(`欢迎, ${name}！已连接云端数据库`, 'success');
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
      seats: { driver: driverName, passenger: null, rearLeft: null, rearRight: null }
    };
    if (user) LogService.addLog(user.name, '添加车辆', `添加了车辆 ${plate}`);
    setCars(prev => [...prev, newCar]);
    setView({ type: 'SEAT_SELECTION', carId: newCar.id });
    showToast('车辆已成功加入云端车队', 'success');
  };

  const handleToggleSeat = (carId: string, position: SeatPosition) => {
    if (!user) return;
    const isDriverOfAnyCar = cars.some(c => c.driverName === user.name);
    if (isDriverOfAnyCar && position !== 'driver') {
        showToast("司机请专注于驾驶哦~", 'error');
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
        showToast(`入座成功：${newTargetCar.plate}`, 'success');
      } else {
        showToast(`已离座`, 'info');
      }
      return [...cleanCars];
    });
  };

  const handleDeleteCar = (carId: string) => {
    setCars(prev => prev.filter(c => c.id !== carId));
    showToast('车辆已从云端移除', 'success');
  };

  if (loading || !config) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-wedding-pink border-t-wedding-pink-dark rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">正在连接云端数据库...</p>
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
            onReorderCars={(newOrder) => user.isAdmin && setCars(newOrder)}
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
