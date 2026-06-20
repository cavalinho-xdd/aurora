import React from 'react';
import { motion } from 'framer-motion';

export default function ToggleSwitch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-ui-out focus:outline-none ${
        checked ? 'bg-focus-primary' : 'bg-white/10'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/20'}`}
    >
      <motion.span
        layout
        initial={false}
        animate={{
          x: checked ? 22 : 2,
        }}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`inline-block h-5 w-5 rounded-full shadow-md transform ${
          checked ? 'bg-white' : 'bg-gray-400'
        }`}
      />
    </button>
  );
}
