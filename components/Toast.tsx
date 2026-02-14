import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';

interface ToastContainerProps {
  notifications: Notification[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications }) => {
  return (
    <div className="fixed top-12 left-0 w-full z-[100] flex flex-col items-center pointer-events-none gap-2 px-4">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            layout
            className={`
              pointer-events-auto px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md text-sm font-medium flex items-center gap-2 border
              ${n.type === 'error' ? 'bg-red-500/90 text-white shadow-red-500/20 border-transparent' : ''}
              ${n.type === 'success' ? 'bg-emerald-500/90 text-white shadow-emerald-500/20 border-transparent' : ''}
              ${n.type === 'info' ? 'bg-slate-800/80 text-white shadow-slate-900/20 border-transparent' : ''}
              ${n.type === 'pink' ? 'bg-[#FFE4E9]/95 text-slate-800 shadow-pink-200/50 border-pink-200' : ''}
            `}
          >
            {n.type === 'success' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            )}
            {n.type === 'error' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            {n.type === 'info' && (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {n.type === 'pink' && (
               <svg className="w-4 h-4 text-wedding-pink-dark" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            )}
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};