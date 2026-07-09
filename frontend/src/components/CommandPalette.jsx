import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Search, Home, Code2, Shield, LogIn } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function CommandPalette({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleAction = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const actions = [
    { name: 'Home / Landing', icon: Home, path: '/' },
    { name: 'Problem Set', icon: Code2, path: '/problems' },
    ...(!isAuthenticated ? [
      { name: 'Sign In', icon: LogIn, path: '/login' },
      { name: 'Sign Up', icon: LogIn, path: '/signup' }
    ] : []),
    ...(isAuthenticated && user?.role === 'admin' ? [
      { name: 'Admin Dashboard', icon: Shield, path: '/admin' }
    ] : [])
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="flex items-center px-4 border-b border-white/10">
              <Search size={20} className="text-gray-400" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Type a command or search..." 
                className="w-full bg-transparent border-none py-4 px-3 text-white focus:outline-none placeholder-gray-500"
              />
            </div>
            
            <div className="p-2 max-h-[300px] overflow-y-auto">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 uppercase tracking-wider">
                Navigation
              </div>
              {actions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAction(action.path)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <Icon size={18} className="text-gray-400" />
                    {action.name}
                  </button>
                )
              })}
            </div>
            
            <div className="bg-black/50 px-4 py-3 text-xs text-gray-500 flex justify-between items-center border-t border-white/5">
              <span>Use <kbd className="bg-white/10 px-1.5 py-0.5 rounded">↑</kbd> <kbd className="bg-white/10 px-1.5 py-0.5 rounded">↓</kbd> to navigate</span>
              <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded">esc</kbd> to close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
