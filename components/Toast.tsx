
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';

interface ToastContainerProps {
  notifications: Notification[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications }) => {
  return (
    <div className="fixed top-14 left-0 w-full z-[9999] flex flex-col items-center pointer-events-none gap-3 px-6">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            layout
            className={`
              pointer-events-auto px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl text-sm font-semibold flex items-center gap-3 border
              ${n.type === 'error' ? 'bg-red-500/90 text-white border-white/20' : ''}
              ${n.type === 'success' ? 'bg-emerald-500/95 text-white border-white/20' : ''}
              ${n.type === 'info' ? 'bg-slate-800/90 text-white border-white/10' : ''}
              ${n.type === 'pink' ? 'bg-white/95 text-wedding-pink-dark border-wedding-pink shadow-wedding-pink/20' : ''}
            `}
          >
            <div className="flex-shrink-0">
              {n.type === 'success' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
              {n.type === 'error' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              {n.type === 'info' && (
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              {n.type === 'pink' && (
                 <svg className="w-5 h-5 text-wedding-pink-dark animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              )}
            </div>
            <span className="leading-tight">{n.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
