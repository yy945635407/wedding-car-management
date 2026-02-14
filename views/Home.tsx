
import React, { useState, useMemo } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { Car, User } from '../types';
import { Icons } from '../constants';
import { IOSSwitch } from '../components/IOSSwitch';
import { LogService } from '../services/log';
import { ConfigService } from '../services/config';

interface HomeProps {
  currentUser: User;
  cars: Car[];
  weddingTitle: string;
  logoUrl: string;
  onLogout: () => void;
  onAddCar: () => void;
  onSelectCar: (carId: string) => void;
  onReorderCars: (newOrder: Car[]) => void;
  onDeleteCar: (carId: string) => void;
  onShowInfo: () => void;
}

export const Home: React.FC<HomeProps> = ({ 
  currentUser, 
  cars, 
  weddingTitle,
  logoUrl,
  onLogout, 
  onAddCar, 
  onSelectCar, 
  onReorderCars,
  onDeleteCar,
  onShowInfo
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [imgError, setImgError] = useState(false);

  // 为 Logo 增加时间戳参数，强制浏览器刷新缓存
  const finalLogoUrl = useMemo(() => {
    return ConfigService.getLogoUrlWithCacheBuster(logoUrl);
  }, [logoUrl]);

  const totalSeats = cars.length * 4;
  const occupiedCount = cars.reduce((acc, car) => {
    let count = 0;
    if (car.seats.driver) count++;
    if (car.seats.passenger) count++;
    if (car.seats.rearLeft) count++;
    if (car.seats.rearRight) count++;
    return acc + count;
  }, 0);
  
  const remainingSeats = totalSeats - occupiedCount;

  return (
    <IOSSwitch className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <header className="px-6 pt-12 pb-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {logoUrl && !imgError ? (
              <img 
                src={finalLogoUrl} 
                alt="Wedding Logo" 
                onError={() => setImgError(true)}
                className="w-8 h-8 rounded-full object-cover border border-wedding-pink-dark/20 shadow-sm"
              />
            ) : (
              <div className="text-wedding-pink-dark">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
              </div>
            )}
            <h1 className="text-xl font-bold text-slate-800">{weddingTitle}的婚车车队</h1>
          </div>
          <div className="flex items-center gap-1">
            {currentUser.isAdmin && (
              <button 
                onClick={() => LogService.exportLogs()}
                className="p-2 rounded-full text-wedding-blue-dark hover:bg-wedding-blue/30 transition-all mr-1"
                title="导出系统日志"
              >
                <Icons.Download />
              </button>
            )}
            <button 
              onClick={onShowInfo}
              className="p-2 rounded-full text-wedding-pink-dark/70 hover:text-wedding-pink-dark hover:bg-wedding-pink/10 transition-all"
              aria-label="Info"
            >
              <Icons.Info />
            </button>
          </div>
        </div>
        
        <div className="flex gap-4">
           <div className="flex-1 bg-gradient-to-br from-wedding-pink to-pink-50 rounded-2xl p-5 shadow-md border border-pink-100 flex flex-col items-center justify-center">
             <div className="text-wedding-pink-dark text-xs font-bold uppercase tracking-wider mb-2">婚车总数</div>
             <div className="text-4xl font-extrabold text-slate-800">{cars.length} <span className="text-base font-medium text-slate-500">辆</span></div>
           </div>
           <div className="flex-1 bg-gradient-to-br from-wedding-blue to-blue-50 rounded-2xl p-5 shadow-md border border-blue-100 flex flex-col items-center justify-center">
             <div className="text-wedding-blue-dark text-xs font-bold uppercase tracking-wider mb-2">剩余座位</div>
             <div className="text-4xl font-extrabold text-slate-800">{remainingSeats} <span className="text-base font-medium text-slate-500">个</span></div>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-hidden overflow-x-auto flex items-center px-6 py-8 no-scrollbar touch-pan-x">
        <Reorder.Group 
          axis="x" 
          values={cars} 
          onReorder={onReorderCars} 
          className="flex items-center gap-2 h-full"
        >
          {cars.map((car, index) => {
            let carOccupied = 0;
            if (car.seats.driver) carOccupied++;
            if (car.seats.passenger) carOccupied++;
            if (car.seats.rearLeft) carOccupied++;
            if (car.seats.rearRight) carOccupied++;

            return (
              <React.Fragment key={car.id}>
                <Reorder.Item
                  value={car}
                  dragListener={currentUser.isAdmin}
                  className="relative group flex-shrink-0"
                  whileDrag={{ scale: 1.05, zIndex: 50 }}
                  drag 
                  onDragStart={() => currentUser.isAdmin && setIsDragging(true)}
                  onDrag={(e, info) => {
                    if (!currentUser.isAdmin) return;
                    const threshold = window.innerHeight - 150;
                    if (info.point.y > threshold) {
                      if (!isOverTrash) setIsOverTrash(true);
                    } else {
                      if (isOverTrash) setIsOverTrash(false);
                    }
                  }}
                  onDragEnd={(e, info) => {
                    if (!currentUser.isAdmin) return;
                    setIsDragging(false);
                    setIsOverTrash(false);
                    const trashThreshold = window.innerHeight - 150;
                    if (info.point.y > trashThreshold) {
                        onDeleteCar(car.id);
                    }
                  }}
                >
                  <div 
                    onClick={() => onSelectCar(car.id)}
                    className="w-64 h-80 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col items-center justify-between p-6 active:scale-95 transition-transform duration-200 cursor-pointer overflow-hidden relative"
                  >
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-wedding-pink/30 to-transparent" />
                    <div className="z-10 text-center w-full mt-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm font-bold text-slate-400 mb-3 border border-slate-100 text-sm">
                        #{index + 1}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">{car.plate}</h3>
                      <p className="text-sm text-slate-500 mt-1">司机: {car.driverName}</p>
                    </div>
                    <div className="z-10 text-wedding-pink-dark opacity-80 my-2">
                      <svg width="100" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                    </div>
                    <div className="z-10 w-full">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">入座率</span>
                        <span className="text-2xl font-bold text-slate-700">{carOccupied}<span className="text-lg text-slate-400 font-normal">/4</span></span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-wedding-pink-dark rounded-full transition-all duration-500" 
                          style={{ width: `${(carOccupied / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
                {index < cars.length - 1 && (
                  <div className="w-8 h-1 bg-wedding-pink rounded-full flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
          {cars.length > 0 && <div className="w-8 h-1 bg-wedding-pink rounded-full flex-shrink-0" />}
          <button 
            onClick={onAddCar}
            className="w-16 h-80 flex-shrink-0 flex items-center justify-center rounded-[2rem] border-2 border-dashed border-wedding-pink-dark/30 text-wedding-pink-dark hover:bg-wedding-pink/10 transition-colors active:scale-95"
          >
            <Icons.Plus />
          </button>
        </Reorder.Group>
      </div>

      <AnimatePresence>
        {isDragging && currentUser.isAdmin ? (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0, scale: isOverTrash ? 1.05 : 1, backgroundColor: isOverTrash ? "rgba(239, 68, 68, 0.95)" : "rgba(239, 68, 68, 0.85)" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 w-full h-36 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white pb-6 safe-area-bottom shadow-lg"
          >
            <motion.div 
               animate={{ scale: isOverTrash ? 1.3 : [1, 1.2, 1] }} 
               transition={isOverTrash ? { duration: 0.2 } : { repeat: Infinity, duration: 1.5 }}
               className="mb-2"
            >
               <Icons.Trash />
            </motion.div>
            <span className="font-bold text-lg tracking-widest">{isOverTrash ? "松手即可删除" : "拖至此处删除"}</span>
          </motion.div>
        ) : (
          <div className="p-6 bg-white/50 backdrop-blur-sm safe-area-bottom">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-4 text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              <Icons.LogOut />
              <span>退出登录</span>
            </button>
          </div>
        )}
      </AnimatePresence>
    </IOSSwitch>
  );
};
