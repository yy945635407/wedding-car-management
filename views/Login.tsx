import React, { useState } from 'react';
import { Icons } from '../constants';
import { IOSSwitch } from '../components/IOSSwitch';

interface LoginProps {
  onLogin: (name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <IOSSwitch className="flex flex-col items-center justify-center bg-gradient-to-br from-wedding-pink to-wedding-blue px-6">
      <div className="w-full max-w-sm bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
        <div className="flex justify-center mb-6 text-wedding-pink-dark">
           {/* Wedding Icon */}
           <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2.5V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h0"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">欢迎参加婚礼</h1>
        <p className="text-center text-slate-500 mb-8 text-sm">请输入您的名字加入婚车车队</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="您的名字"
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:outline-none focus:ring-2 focus:ring-wedding-pink-dark/50 text-center text-lg placeholder:text-slate-400"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-wedding-pink-dark text-white font-semibold text-lg shadow-lg shadow-wedding-pink-dark/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            进入系统
          </button>
        </form>
      </div>
    </IOSSwitch>
  );
};