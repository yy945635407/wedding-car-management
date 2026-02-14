import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h3 className="text-center font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="p-6 text-center text-gray-700">
              {children}
            </div>
            <button 
              onClick={onClose}
              className="w-full py-3 text-blue-500 font-semibold border-t border-gray-200/50 active:bg-gray-100 transition-colors"
            >
              OK
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
