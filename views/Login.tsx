
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IOSSwitch } from '../components/IOSSwitch';
import { ConfigService } from '../services/config';

interface LoginProps {
  onLogin: (name: string) => void;
  weddingTitle: string;
  logoUrl: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, weddingTitle, logoUrl }) => {
  const [name, setName] = useState('');
  const [imgError, setImgError] = useState(false);

  // 为 Logo 增加时间戳，防止浏览器缓存旧的 404 结果
  const finalLogoUrl = useMemo(() => {
    return ConfigService.getLogoUrlWithCacheBuster(logoUrl);
  }, [logoUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  // 默认 SVG 图标
  const DefaultLogo = () => (
    <div className="text-wedding-pink-dark bg-white p-4 rounded-full shadow-lg border-2 border-wedding-pink">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2.5V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h0"/></svg>
    </div>
  );

  return (
    <IOSSwitch className="flex flex-col items-center justify-center bg-gradient-to-br from-wedding-pink to-wedding-blue px-6">
      <div className="w-full max-w-sm bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-6"
        >
          {logoUrl && !imgError ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-wedding-pink-dark/20 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
              <img 
                src={finalLogoUrl} 
                alt="Logo" 
                onError={() => {
                  console.error('Logo 加载失败，路径可能不正确:', logoUrl);
                  setImgError(true);
                }}
                className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white relative z-10"
              />
            </div>
          ) : (
            <DefaultLogo />
          )}
        </motion.div>
        
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">欢迎参加{weddingTitle}的婚礼</h1>
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
