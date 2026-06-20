import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { playLevelUp } from '../utils/soundService';

function getFlameConfig(streak, t) {
  if (streak <= 2) return { scale: 0.8, yOffset: 0, intensity: 0.6, label: t ? t('streakCelebration.labels.spark') : 'Spark', particles: 3, coreType: 'none' };
  if (streak <= 5) return { scale: 1.0, yOffset: 0, intensity: 0.8, label: t ? t('streakCelebration.labels.burning') : 'Burning', particles: 6, coreType: 'none' };
  if (streak <= 10) return { scale: 1.2, yOffset: -5, intensity: 1.0, label: t ? t('streakCelebration.labels.blazing') : 'Blazing', particles: 10, coreType: 'none' };
  if (streak <= 20) return { scale: 1.45, yOffset: -15, intensity: 1.2, label: t ? t('streakCelebration.labels.inferno') : 'Inferno', particles: 15, coreType: 'cyan' };
  return { scale: 1.7, yOffset: -25, intensity: 1.5, label: t ? t('streakCelebration.labels.legendary') : 'Legendary', particles: 25, coreType: 'gold' };
}

function FlameSVG({ streak }) {
  const config = getFlameConfig(streak);
  
  return (
    <motion.div
      initial={{ opacity: 0, transform: "scale(0.85) translateY(20px)" }}
      animate={{ opacity: 1, transform: `scale(${config.scale}) translateY(${config.yOffset}px)` }}
      transition={{ duration: 0.8, type: 'spring', bounce: 0.4, delay: 0.1 }}
      className="relative flex items-center justify-center w-40 h-40 origin-bottom"
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
        <defs>
          <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#FBCFE8" />
          </linearGradient>
          <linearGradient id="flameTinyGold" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          <linearGradient id="flameTinyCyan" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#CFFAFE" />
          </linearGradient>
        </defs>

        {/* Outer Flame morphing animation */}
        <motion.path
          fill="url(#flameOuter)"
          animate={{
            d: [
              "M50 10 C50 10 20 45 20 70 C20 86.5 33.5 100 50 100 C66.5 100 80 86.5 80 70 C80 45 50 10 50 10 Z",
              "M45 15 C45 15 18 45 20 70 C20 86.5 33.5 100 50 100 C66.5 100 80 86.5 80 70 C80 45 45 15 45 15 Z",
              "M50 10 C50 10 20 45 20 70 C20 86.5 33.5 100 50 100 C66.5 100 80 86.5 80 70 C80 45 50 10 50 10 Z",
              "M55 15 C55 15 22 45 20 70 C20 86.5 33.5 100 50 100 C66.5 100 80 86.5 80 70 C80 45 55 15 55 15 Z",
              "M50 10 C50 10 20 45 20 70 C20 86.5 33.5 100 50 100 C66.5 100 80 86.5 80 70 C80 45 50 10 50 10 Z",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Inner Flame morphing animation */}
        <motion.path
          fill="url(#flameInner)"
          animate={{
            d: [
              "M50 35 C50 35 35 55 35 70 C35 78.3 41.7 85 50 85 C58.3 85 65 78.3 65 70 C65 55 50 35 50 35 Z",
              "M47 38 C47 38 34 55 35 70 C35 78.3 41.7 85 50 85 C58.3 85 65 78.3 65 70 C65 55 47 38 47 38 Z",
              "M50 35 C50 35 35 55 35 70 C35 78.3 41.7 85 50 85 C58.3 85 65 78.3 65 70 C65 55 50 35 50 35 Z",
              "M53 38 C53 38 36 55 35 70 C35 78.3 41.7 85 50 85 C58.3 85 65 78.3 65 70 C65 55 53 38 53 38 Z",
              "M50 35 C50 35 35 55 35 70 C35 78.3 41.7 85 50 85 C58.3 85 65 78.3 65 70 C65 55 50 35 50 35 Z",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
        />

        {/* Tiny Core morphing animation (only visible if coreType is set) */}
        {config.coreType !== 'none' && (
          <motion.path
            fill={config.coreType === 'gold' ? "url(#flameTinyGold)" : "url(#flameTinyCyan)"}
            animate={{
              d: [
                "M50 48 C50 48 42 62 42 72 C42 76.4 45.6 80 50 80 C54.4 80 58 76.4 58 72 C58 62 50 48 50 48 Z",
                "M48 50 C48 50 41 62 42 72 C42 76.4 45.6 80 50 80 C54.4 80 58 76.4 58 72 C58 62 48 50 48 50 Z",
                "M50 48 C50 48 42 62 42 72 C42 76.4 45.6 80 50 80 C54.4 80 58 76.4 58 72 C58 62 50 48 50 48 Z",
                "M52 50 C52 50 43 62 42 72 C42 76.4 45.6 80 50 80 C54.4 80 58 76.4 58 72 C58 62 52 50 52 50 Z",
                "M50 48 C50 48 42 62 42 72 C42 76.4 45.6 80 50 80 C54.4 80 58 76.4 58 72 C58 62 50 48 50 48 Z",
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        )}

      </svg>

      {/* Particles/Sparks */}
      {Array.from({ length: config.particles }).map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: i % 2 === 0 ? '#F472B6' : '#A78BFA',
            boxShadow: `0 0 8px ${i % 2 === 0 ? '#F472B6' : '#A78BFA'}`,
            bottom: '15%',
            left: `${40 + Math.random() * 20}%`,
          }}
          initial={{ opacity: 0, y: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            y: -60 - Math.random() * 80,
            x: -25 + Math.random() * 50,
            scale: [0, 1.2, 0]
          }}
          transition={{
            duration: 1.5 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}

function StreakCelebration({ streak, onComplete, noApiUsed }) {
  const { t } = useTranslation();
  const config = getFlameConfig(streak, t);
  
  useEffect(() => {
    playLevelUp();
  }, []);
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] flex flex-col items-center justify-center cursor-pointer"
        onClick={onComplete}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Dark overlay */}
        <motion.div 
          className="absolute inset-0 bg-[#0B0A15]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          transition={{ duration: 0.4 }}
        />

        {/* Ambient glow behind flame */}
        <motion.div
          className="absolute w-64 h-64 rounded-full pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, rgba(139, 92, 246, ${0.15 + streak * 0.01}) 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Flame */}
          <FlameSVG streak={streak} />

          {/* Streak number */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-8xl font-black text-white tracking-tighter leading-none mb-2 drop-shadow-md">
              {streak}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-[0.3em] font-medium mb-6">
              {t('streakCelebration.dayStreak')}
            </div>
          </motion.div>

          {/* Rank label */}
          <motion.div
            className="px-5 py-2 rounded-full border border-focus-primary/30 text-focus-primary text-sm font-bold tracking-wider uppercase bg-focus-primary/5 backdrop-blur-md mb-8"
            style={{ 
              boxShadow: `0 0 20px rgba(139, 92, 246, ${config.intensity * 0.2})`,
            }}
            initial={{ opacity: 0, transform: "scale(0.85)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            transition={{ delay: 1.0, duration: 0.5, type: 'spring' }}
          >
            {config.label}
          </motion.div>

          {/* No API Info */}
          {noApiUsed && (
            <motion.div
              className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm mb-6 shadow-xl backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{t('streakCelebration.xpEarned')}</div>
              <div className="text-3xl font-black text-white mb-3">+20 XP</div>
              <div className="text-xs text-orange-400 text-center font-light leading-relaxed">
                {t('streakCelebration.noApiEarnMore')}
              </div>
            </motion.div>
          )}

          {/* Dismiss hint */}
          <motion.p
            className="text-gray-600 text-xs mt-4 tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            {t('streakCelebration.tapToContinue')}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default StreakCelebration;
