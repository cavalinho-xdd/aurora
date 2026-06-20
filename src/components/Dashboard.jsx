import React, { useState, useEffect } from 'react';
/**
 * @file Dashboard.jsx
 * @description Primary user overview interface.
 * Displays user statistics, current level, progress towards the next level,
 * and dynamic greeting based on the current time of day.
 */
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Flame, Clock } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/** Animated counter that counts up from 0 to target */
function CountUp({ target, duration = 1.2, delay = 0.4 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    const startTime = Date.now();
    const delayMs = delay * 1000;
    
    const animate = () => {
      const elapsed = Date.now() - startTime - delayMs;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay]);

  return count;
}

function formatFocusTime(minutes) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function Dashboard({ stats, userName, userId }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchHistory = async () => {
      try {
        const q = query(collection(db, `users/${userId}/history`), orderBy('date', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const docs = [];
        querySnapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
        setHistory(docs);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, [userId]);

  const progressPercent = (stats.xp / (stats.level * 100)) * 100;

  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = t('dashboard.goodMorning', 'Good morning');
  else if (hour < 18) greeting = t('dashboard.goodAfternoon', 'Good afternoon');
  else greeting = t('dashboard.goodEvening', 'Good evening');

  const displayName = userName || 'Focuser';

  return (
    <div>
      {/* Hero greeting — clean, no gradient text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-2">
          {greeting}, <span className="text-focus-primary">{displayName}</span>.
        </h1>
        <p className="text-lg text-gray-400 font-light">
          {t('dashboard.subtitle', 'Here\'s your progress so far.')}
        </p>
      </motion.div>

      {/* Stats row — flat, typographic hierarchy, no card wrappers */}
      <motion.div 
        className="flex items-end gap-16 mt-12 pb-12 border-b border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Level */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">{t('dashboard.level')}</p>
          <div className="text-6xl font-black text-white leading-none tracking-tighter font-mono">
            <CountUp target={stats.level} duration={0.8} delay={0.3} />
          </div>
        </div>

        {/* Streak */}
        {stats.streak > 0 && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">{t('dashboard.streak')}</p>
            <div className="flex items-end gap-2">
              <div className="text-5xl font-bold text-white leading-none tracking-tighter font-mono">
                <CountUp target={stats.streak} duration={0.8} delay={0.4} />
              </div>
              <Flame size={22} className="mb-1 text-focus-primary opacity-80" />
            </div>
          </div>
        )}

        {/* XP Progress */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs text-gray-500 font-medium">{t('dashboard.xp')}</span>
            <span className="text-sm text-gray-400 font-medium font-mono">{stats.xp} / {stats.level * 100}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-focus-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Goals Completed */}
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium mb-2">{t('dashboard.completedGoals')}</p>
          <div className="text-5xl font-bold text-white leading-none tracking-tighter font-mono">
            <CountUp target={stats.goalsCompleted} duration={1} delay={0.5} />
          </div>
        </div>

        {/* Total Focus Time */}
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium mb-2">{t('dashboard.totalFocusTime', 'Focus time')}</p>
          <div className="flex items-end gap-2 justify-end">
            <Clock size={16} className="mb-1 text-gray-500" />
            <div className="text-2xl font-bold text-gray-300 leading-none tracking-tight font-mono">
              {formatFocusTime(stats.totalFocusMinutes)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* History */}
      {history.length > 0 ? (
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-6">{t('dashboard.recentSessions', 'Recent sessions')}</p>
          <div className="flex flex-col gap-3">
            {history.map((session, i) => (
              <motion.div 
                key={session.id} 
                className="flex justify-between items-center glass-surface rounded-xl px-5 py-4 hover:bg-white/[0.06] transition-colors duration-150"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <div>
                  <h4 className="text-white font-medium">{session.topic || 'General Focus'}</h4>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{new Date(session.date).toLocaleDateString()} · {session.minutes} {t('dashboard.minutes', 'min')}</p>
                </div>
                <div className="text-focus-primary font-bold font-mono">
                  +{session.xpGained} XP
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="mt-12 flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Clock size={20} className="text-gray-600" />
          </div>
          <p className="text-gray-500 text-sm">{t('dashboard.noHistory', 'No sessions yet. Start your first focus to track progress.')}</p>
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;
