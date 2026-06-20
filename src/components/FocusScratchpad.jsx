import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, X } from 'lucide-react';

function FocusScratchpad({ value, onChange }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // If there's already text, maybe keep it open by default? 
  // Let's just keep it closed by default for maximum minimalism, unless they click it.

  return (
    <div className="w-full flex flex-col items-center mt-12 mb-8">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="toggle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm tracking-wide"
          >
            <PenLine size={16} />
            {t('scratchpad.open', 'Scratchpad')}
          </motion.button>
        ) : (
          <motion.div
            key="scratchpad"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
            className="w-full max-w-md relative"
          >
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                {t('scratchpad.title', 'Scratchpad')}
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 transition-colors resize-none min-h-[160px] text-sm leading-relaxed"
              placeholder={t('scratchpad.placeholder', 'Dump distracting thoughts here...')}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FocusScratchpad;
