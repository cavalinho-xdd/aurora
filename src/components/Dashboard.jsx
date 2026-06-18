import React, { useState, useEffect } from 'react';
/**
 * @file Dashboard.jsx
 * @description Primary user overview interface.
 * Displays user statistics, current level, progress towards the next level,
 * and dynamic greeting based on the current time of day.
 */
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

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
      {/* Hero greeting — like the web's big headings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-2">
          {greeting}, <span className="text-gradient">{displayName}</span>.
        </h1>
        <p className="text-lg text-gray-500 font-light">
          {t('dashboard.subtitle', 'Here\'s your progress so far.')}
        </p>
      </motion.div>

      {/* Stats row — flat, no card wrapper, just content breathing on the dark bg */}
      <motion.div 
        className="flex items-end gap-16 mt-12 pb-12 border-b border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Level */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2">{t('dashboard.level')}</p>
          <div className="text-6xl font-black text-white leading-none tracking-tighter">
            {stats.level}
          </div>
        </div>

        {/* Streak */}
        {stats.streak > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2">{t('dashboard.streak')}</p>
            <div className="flex items-end gap-2">
              <div className="text-5xl font-bold text-white leading-none tracking-tighter">{stats.streak}</div>
              <svg width="24" height="28" viewBox="0 0 120 130" className="mb-1 opacity-80">
                <path d="M60,125 C85,125 105,100 105,70 C105,35 65,-5 65,-5 C65,-5 75,30 55,50 C45,60 30,65 25,85 C20,105 40,125 60,125 Z" fill="#8B5CF6" opacity="0.9" />
                <path d="M60,120 C80,120 95,98 95,72 C95,45 65,10 65,10 C65,10 72,38 55,55 C48,62 35,68 32,85 C28,102 45,120 60,120 Z" fill="#EC4899" opacity="0.5" />
              </svg>
            </div>
          </div>
        )}

        {/* XP Progress */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-[0.2em]">{t('dashboard.xp')}</span>
            <span className="text-sm text-gray-400 font-medium">{stats.xp} / {stats.level * 100}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-focus-primary to-focus-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Goals Completed */}
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2">{t('dashboard.completedGoals')}</p>
          <div className="text-5xl font-bold text-white leading-none tracking-tighter">{stats.goalsCompleted}</div>
        </div>
      </motion.div>

      {/* History */}
      {history.length > 0 && (
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-6">{t('dashboard.recentSessions', 'Recent Sessions')}</p>
          <div className="flex flex-col gap-3">
            {history.map((session) => (
              <div key={session.id} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl px-5 py-4 backdrop-blur-md hover:bg-white/10 transition-colors">
                <div>
                  <h4 className="text-white font-medium">{session.topic || 'General Focus'}</h4>
                  <p className="text-xs text-gray-400 mt-1">{new Date(session.date).toLocaleDateString()} • {session.minutes} {t('dashboard.minutes', 'min')}</p>
                </div>
                <div className="text-focus-primary font-bold">
                  +{session.xpGained} XP
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;
