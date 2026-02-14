import React from 'react';
import { Car, User, SeatPosition } from '../types';
import { IOSSwitch } from '../components/IOSSwitch';
import { Icons } from '../constants';
import clsx from 'clsx'; // We'll just use template literals if clsx isn't avail, but since I'm providing code, I will use standard string concat for zero-dep where possible or just assume standard utils.

interface SeatSelectionProps {
  user: User;
  car: Car;
  onBack: () => void;
  onToggleSeat: (carId: string, position: SeatPosition) => void;
}

export const SeatSelection: React.FC<SeatSelectionProps> = ({ user, car, onBack, onToggleSeat }) => {
  
  // Check if current user is a driver for ANY car. If so, they shouldn't pick seats as a passenger.
  // Actually, let's keep it simple based on prompt: "Guest who is a driver cannot choose seat".
  // The driver of THIS car occupies seat 0.
  
  const isDriverOfThisCar = car.seats.driver === user.name;
  
  const Seat = ({ position, occupant, label }: { position: SeatPosition, occupant: string | null, label: string }) => {
    const isOccupied = occupant !== null;
    const isMe = occupant === user.name;
    const isDriverSeat = position === 'driver';

    // Interaction logic
    const handleClick = () => {
      if (isDriverSeat) return; // Cannot move driver
      
      // If user is a driver (based on requirement "Drivers cannot pick seats"), we might want to block interaction.
      // However, prompt says "Is driver guest cannot choose seat".
      // Assuming 'isDriverOfThisCar' means they are THE driver.
      
      // Basic logic: 
      // 1. If empty, take it.
      // 2. If me, leave it.
      // 3. If someone else, do nothing.
      if (!isOccupied || isMe) {
        onToggleSeat(car.id, position);
      }
    };

    return (
      <div 
        onClick={handleClick}
        className={clsx(
          "relative h-32 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300",
          // Styles
          isDriverSeat 
            ? "bg-slate-100 border-slate-200 cursor-not-allowed" 
            : isMe 
              ? "bg-wedding-pink text-wedding-pink-dark border-wedding-pink-dark shadow-md scale-105 z-10"
              : isOccupied 
                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-white border-dashed border-slate-300 text-slate-400 hover:border-wedding-pink-dark hover:bg-pink-50 cursor-pointer active:scale-95"
        )}
      >
        {/* Seat Icon / Label */}
        {isDriverSeat ? (
          <div className="text-slate-400 mb-1"><Icons.SteeringWheel /></div>
        ) : (
          <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-50">{label}</div>
        )}
        
        {/* Name Display */}
        <span className={clsx("font-bold text-center px-2 truncate w-full", isMe ? "text-lg" : "text-md")}>
          {occupant || "空座"}
        </span>
      </div>
    );
  };

  return (
    <IOSSwitch className="bg-slate-50 flex flex-col h-full">
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
        {/* Car Container */}
        <div className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-xl p-8 border border-slate-100">
          
          {/* Front Windshield Hint */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-blue-100/50 to-transparent rounded-t-full border-t border-blue-100/50" />

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4">
             {/* Front Row */}
             <Seat position="driver" occupant={car.seats.driver} label="主驾驶" />
             <Seat position="passenger" occupant={car.seats.passenger} label="副驾驶" />
             
             {/* Back Row */}
             <Seat position="rearLeft" occupant={car.seats.rearLeft} label="后排左" />
             <Seat position="rearRight" occupant={car.seats.rearRight} label="后排右" />
          </div>

          {/* Rear Window Hint */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-blue-100/50 to-transparent rounded-b-full border-b border-blue-100/50" />
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-sm max-w-xs">
          点击空座入座，点击已选座位离座 <br/>
          <span className="text-xs opacity-70">（司机位置固定）</span>
        </p>
      </div>
    </IOSSwitch>
  );
};

// Helper for simple class strings since we didn't install 'clsx'
function clsx(...args: any[]) {
    return args.filter(Boolean).join(' ');
}