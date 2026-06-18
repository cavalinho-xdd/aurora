import React, { useState, useEffect } from 'react';
import { XSquare, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { playPhaseChange, playTimerEnd } from '../utils/soundService';

function TimerScreen({ minutes, topic, isHardcore, usePomodoro, pomodoroFocus = 25, pomodoroBreak = 5, onComplete, onAbort, onPhaseChange }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  
  const POMODORO_FOCUS_SEC = pomodoroFocus * 60;
  const POMODORO_BREAK_SEC = pomodoroBreak * 60;
  
  const [phase, setPhase] = useState('FOCUS');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(usePomodoro ? Math.min(POMODORO_FOCUS_SEC, minutes * 60) : minutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playTimerEnd();
          if (Notification.permission === "granted") {
            new Notification(t('timerScreen.focusCompleteTitle', 'Focus Complete!'), {
              body: t('timerScreen.focusCompleteBody', 'Time to evaluate your knowledge.'),
            });
          }
          onComplete();
          return 0;
        }
        return prev - 1;
      });

      if (usePomodoro) {
        setPhaseTimeLeft((prevPhaseTime) => {
          if (prevPhaseTime <= 1) {
            setPhase((currentPhase) => {
              const newPhase = currentPhase === 'FOCUS' ? 'BREAK' : 'FOCUS';
              if (onPhaseChange) onPhaseChange(newPhase);
              
              if (timeLeft > 1) {
                playPhaseChange();
                if (Notification.permission === "granted") {
                  const title = newPhase === 'BREAK' ? t('timerScreen.breakTimeTitle', 'Take a Break') : t('timerScreen.focusTimeTitle', 'Back to Focus');
                  const body = newPhase === 'BREAK' ? t('timerScreen.breakTimeBody', 'Great job! Rest for a few minutes.') : t('timerScreen.focusTimeBody', 'Time to lock in.');
                  new Notification(title, { body });
                }
              }

              return newPhase;
            });
            return 0; 
          }
          return prevPhaseTime - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [onComplete, usePomodoro, onPhaseChange, t, timeLeft]);

  useEffect(() => {
    if (usePomodoro && phaseTimeLeft === 0 && timeLeft > 0) {
      const nextDuration = phase === 'FOCUS' ? POMODORO_FOCUS_SEC : POMODORO_BREAK_SEC;
      setPhaseTimeLeft(Math.min(nextDuration, timeLeft));
    }
  }, [phase, phaseTimeLeft, timeLeft, usePomodoro]);

  const displayTime = usePomodoro ? phaseTimeLeft : timeLeft;
  const m = Math.floor(displayTime / 60).toString().padStart(2, '0');
  const s = (displayTime % 60).toString().padStart(2, '0');

  const totalM = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const totalS = (timeLeft % 60).toString().padStart(2, '0');

  const circumference = 2 * Math.PI * 120;
  const progressTime = usePomodoro ? phaseTimeLeft : timeLeft;
  const totalDuration = usePomodoro ? (phase === 'FOCUS' ? POMODORO_FOCUS_SEC : POMODORO_BREAK_SEC) : (minutes * 60);
  const strokeDashoffset = circumference - (Math.min(progressTime, totalDuration) / totalDuration) * circumference;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center">
      {/* Topic */}
      <motion.p 
        className="text-gray-500 text-sm tracking-[0.2em] uppercase mb-12 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {topic}
      </motion.p>
      
      {/* Timer Circle — minimal, no card */}
      <motion.div 
        className="relative w-[280px] h-[280px] flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
          <circle cx="140" cy="140" r="120" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
          <circle 
            cx="140" cy="140" r="120" 
            fill="transparent" 
            stroke="url(#timer-gradient)" 
            strokeWidth="3" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={phase === 'FOCUS' ? '#8B5CF6' : '#10B981'} />
              <stop offset="100%" stopColor={phase === 'FOCUS' ? '#EC4899' : '#34D399'} />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {usePomodoro && (
            <span className={`text-xs font-bold tracking-[0.3em] uppercase mb-2 ${phase === 'FOCUS' ? 'text-focus-primary' : 'text-green-400'}`}>
              {phase === 'FOCUS' ? t('timerScreen.phaseFocus') : t('timerScreen.phaseBreak')}
            </span>
          )}
          <div className="text-7xl font-black tracking-tight text-white leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {m}:{s}
          </div>
          {usePomodoro && (
            <span className="text-gray-600 text-xs mt-3 tracking-widest">{totalM}:{totalS} total</span>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="mt-14 flex flex-col items-center gap-4">
        {isHardcore && (
          <div className="flex items-center gap-2 text-red-400/60 text-xs tracking-[0.2em] uppercase">
            <Shield size={14} /> Hardcore Active
          </div>
        )}
        {!isHardcore && (
          <div className="flex flex-col items-center">
            {showConfirm ? (
              <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-200">
                <p className="text-red-400 text-sm">{t('timerScreen.giveUpConfirm', 'Are you sure you want to give up?')}</p>
                <div className="flex gap-4 mt-2">
                  <button 
                    className="text-gray-400 hover:text-white text-sm px-4 py-1 rounded border border-gray-600 hover:border-gray-400 transition-colors" 
                    onClick={() => setShowConfirm(false)}
                  >
                    {t('timerScreen.cancelGiveUp', 'No, keep going')}
                  </button>
                  <button 
                    className="text-red-500 hover:bg-red-500/10 text-sm px-4 py-1 rounded transition-colors" 
                    onClick={onAbort}
                  >
                    {t('timerScreen.confirmGiveUp', 'Yes, give up')}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="text-gray-600 hover:text-gray-400 text-sm flex items-center gap-2 transition-colors" 
                onClick={() => setShowConfirm(true)}
              >
                <XSquare size={16} /> {t('timerScreen.cancelFocus')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TimerScreen;
