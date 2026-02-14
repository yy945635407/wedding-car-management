import React, { useState } from 'react';
import { IOSSwitch } from '../components/IOSSwitch';
import { Icons } from '../constants';

interface AddCarProps {
  onBack: () => void;
  onSubmit: (plate: string, driver: string) => void;
}

export const AddCar: React.FC<AddCarProps> = ({ onBack, onSubmit }) => {
  const [plate, setPlate] = useState('');
  const [driver, setDriver] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plate && driver) {
      onSubmit(plate, driver);
    }
  };

  return (
    <IOSSwitch className="bg-slate-50 flex flex-col">
      <div className="px-6 pt-12 pb-4 flex items-center bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600">
          <Icons.ArrowLeft />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-slate-800 mr-8">添加新婚车</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">车牌号</label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="例如：京A·88888"
              className="w-full text-xl font-bold py-2 border-b border-gray-100 focus:border-wedding-pink-dark focus:outline-none placeholder:font-normal placeholder:text-slate-300 transition-colors"
              autoFocus
            />
          </div>
          <div>
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">司机姓名</label>
             <input
              type="text"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              placeholder="例如：王叔"
              className="w-full text-xl font-bold py-2 border-b border-gray-100 focus:border-wedding-pink-dark focus:outline-none placeholder:font-normal placeholder:text-slate-300 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!plate || !driver}
          className="w-full py-4 rounded-xl bg-wedding-pink-dark text-white font-bold text-lg shadow-lg shadow-wedding-pink-dark/30 active:scale-95 transition-all disabled:opacity-50"
        >
          确认并去选座
        </button>
      </form>
    </IOSSwitch>
  );
};