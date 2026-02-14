
import React from 'react';
import { motion } from 'framer-motion';
import { Car, User, SeatPosition } from '../types';
import { IOSSwitch } from '../components/IOSSwitch';
import { Icons } from '../constants';

interface SeatSelectionProps {
  user: User;
  car: Car;
  onBack: () => void;
  onToggleSeat: (carId: string, position: SeatPosition) => void;
}

export const SeatSelection: React.FC<SeatSelectionProps> = ({ user, car, onBack, onToggleSeat }) => {
  
  const Seat = ({ position, occupant, label }: { position: SeatPosition, occupant: string | null, label: string }) => {
    const isOccupied = occupant !== null;
    const isMe = occupant === user.name;
    const isDriverSeat = position === 'driver';

    const handleClick = () => {
      if (isDriverSeat) return; 
      if (!isOccupied || isMe) {
        onToggleSeat(car.id, position);
      }
    };

    return (
      <div 
        onClick={handleClick}
        className={clsx(
          "relative h-32 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300",
          isDriverSeat 
            ? "bg-slate-100 border-slate-200 cursor-not-allowed" 
            : isMe 
              ? "bg-wedding-pink text-wedding-pink-dark border-wedding-pink-dark shadow-md scale-105 z-10"
              : isOccupied 
                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-white border-dashed border-slate-300 text-slate-400 hover:border-wedding-pink-dark hover:bg-pink-50 cursor-pointer active:scale-95"
        )}
      >
        {isDriverSeat ? (
          <div className="text-slate-400 mb-1"><Icons.SteeringWheel /></div>
        ) : (
          <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-50">{label}</div>
        )}
        
        <span className={clsx("font-bold text-center px-2 truncate w-full", isMe ? "text-lg" : "text-md")}>
          {occupant || "空座"}
        </span>
      </div>
    );
  };

  return (
    <IOSSwitch className="bg-slate-50 overflow-hidden">
      {/* Swipe Container */}
      <motion.div 
        className="flex flex-col h-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        onDragEnd={(e, info) => {
          // If dragged more than 150px to the right, go back
          if (info.offset.x > 150) {
            onBack();
          }
        }}
      >
        <div className="px-6 pt-12 pb-4 flex items-center bg-white sticky top-0 z-10 shadow-sm">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600">
            <Icons.ArrowLeft />
          </button>
          <div className="flex-1 text-center mr-8">
             <h1 className="text-lg font-bold text-slate-800">{car.plate}</h1>
             <p className="text-xs text-slate-500">请选择您的座位</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[500px]">
          <div className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-xl p-8 border border-slate-100">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-blue-100/50 to-transparent rounded-t-full border-t border-blue-100/50" />
            <div className="grid grid-cols-2 gap-4">
               <Seat position="driver" occupant={car.seats.driver} label="主驾驶" />
               <Seat position="passenger" occupant={car.seats.passenger} label="副驾驶" />
               <Seat position="rearLeft" occupant={car.seats.rearLeft} label="后排左" />
               <Seat position="rearRight" occupant={car.seats.rearRight} label="后排右" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-blue-100/50 to-transparent rounded-b-full border-b border-blue-100/50" />
          </div>
          
          <p className="mt-8 text-center text-slate-400 text-sm max-w-xs">
            向右滑动可返回列表 <br/>
            点击空座入座，点击自己头像离座
          </p>
        </div>
      </motion.div>
    </IOSSwitch>
  );
};

function clsx(...args: any[]) {
    return args.filter(Boolean).join(' ');
}
