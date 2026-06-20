import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Sparkles, Play } from 'lucide-react';

function DevPanel({ onClose, onTriggerStreak }) {
  const [streakValue, setStreakValue] = useState(3);

  const presets = [
    { label: 'Spark', streak: 1 },
    { label: 'Burning', streak: 5 },
    { label: 'Blazing', streak: 10 },
    { label: 'Inferno', streak: 20 },
    { label: 'Legendary', streak: 30 },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-[9990] w-80"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-[#13111C] border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-focus-primary" />
              <span className="text-sm font-bold text-white tracking-wide">Dev Panel</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-focus-primary/20 text-focus-primary font-bold">DEV</span>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Streak Animation Tester */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={14} className="text-focus-secondary" />
              <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Streak Celebration</span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => setStreakValue(p.streak)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ease-ui-out active:scale-95 border ${
                    streakValue === p.streak
                      ? 'bg-white/10 text-white border-white/20'
                      : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {p.label} ({p.streak})
                </button>
              ))}
            </div>

            {/* Custom value + trigger */}
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={streakValue}
                onChange={(e) => setStreakValue(parseInt(e.target.value) || 1)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-focus-primary/50 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTriggerStreak(streakValue)}
                className="bg-focus-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5"
              >
                <Play size={14} fill="currentColor" /> Fire
              </motion.button>
            </div>
          </div>

          {/* Shortcut hint */}
          <div className="text-[10px] text-gray-600 text-center mt-3 pt-3 border-t border-white/5">
            Ctrl+Shift+D to toggle • Only visible to devs
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default DevPanel;
