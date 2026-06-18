import React, { useState, useEffect } from 'react';
/**
 * @file App.jsx
 * @description Core Application State Machine.
 * Manages the transition between major application phases (IDLE -> FOCUS -> QUIZ)
 * and synchronizes local Electron storage with the remote Firebase Firestore database.
 * Also handles offline fallbacks and "No API" modes for graceful degradation.
 */
import { Settings as SettingsIcon, Trophy, LogOut, LayoutDashboard, AlertCircle, WifiOff, ListTodo } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import GoalPlanner from './components/GoalPlanner';
import FocusBacklog from './components/FocusBacklog';
import TimerScreen from './components/TimerScreen';
import QuizScreen from './components/QuizScreen';
import Settings from './components/Settings';
import AuthScreen from './components/AuthScreen';
import SocialScreen from './components/SocialScreen';
import SplashScreen from './components/SplashScreen';
import SoftAurora from './components/SoftAurora';
import StreakCelebration from './components/StreakCelebration';
import DevPanel from './components/DevPanel';
import UpdateNotification from './components/UpdateNotification';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [needsNickname, setNeedsNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');

  const [phase, setPhase] = useState('IDLE');
  const [userData, setUserData] = useState(null);
  const [currentGoal, setCurrentGoal] = useState({ topic: '', minutes: 25, hardcore: false, taskId: null });
  const [quizData, setQuizData] = useState(null);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [noApiUsed, setNoApiUsed] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isDev, setIsDev] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          let stats = { xp: 0, level: 1, goalsCompleted: 0, streak: 0, lastFocusDate: null, totalFocusMinutes: 0 };
          if (docSnap.exists()) {
            const data = docSnap.data();
            const storedStreak = data.streak || 0;
            const storedLastDate = data.lastFocusDate || null;
            
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            let validStreak = storedStreak;
            if (storedLastDate && storedLastDate !== today && storedLastDate !== yesterday) {
              validStreak = 0;
            }

            stats = { 
              xp: data.xp || 0, 
              level: data.level || 1, 
              goalsCompleted: data.goalsCompleted || 0,
              streak: validStreak,
              lastFocusDate: storedLastDate,
              totalFocusMinutes: data.totalFocusMinutes || 0
            };

            if (data.role === 'dev' || data.role === 'admin') {
              setIsDev(true);
            }

            if (user.emailVerified && data.isVerified !== true) {
              try {
                await updateDoc(docRef, { isVerified: true });
              } catch (e) {
                console.error("Failed to sync isVerified status:", e);
              }
            }
          } else {
            if (user.providerData.some(p => p.providerId === 'google.com')) {
              setNeedsNickname(true);
            }
          }
          
          let localSettings = { apiKey: '', blacklist: ['discord', 'steam'], blockedWebsites: ['youtube.com', 'tiktok.com', 'instagram.com'], lowGraphicsMode: false };
          if (window.api && window.api.storage) {
            const stored = await window.api.storage.load();
            if (stored && stored.settings) localSettings = stored.settings;
          }
          
          setUserData({ stats, settings: localSettings });
        } catch(e) {
          console.error("Error loading user data", e);
          setUserData({ 
            stats: { xp: 0, level: 1, goalsCompleted: 0, streak: 0, lastFocusDate: null, totalFocusMinutes: 0 }, 
            settings: { apiKey: '', blacklist: ['discord', 'steam'], blockedWebsites: ['youtube.com', 'tiktok.com', 'instagram.com'], lowGraphicsMode: false },
            error: e.message
          });
        }
      } else {
        setUserData(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleSaveNickname = async () => {
    if (!tempNickname.trim()) return;
    try {
      const q = query(collection(db, "users"), where("displayNameLower", "==", tempNickname.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        alert(t('socialScreen.nameTaken', 'Tato přezdívka je už zabraná. Vyberte si prosím jinou.'));
        return;
      }

      await updateProfile(currentUser, { displayName: tempNickname.trim() });
      await setDoc(doc(db, "users", currentUser.uid), {
        displayName: tempNickname.trim(),
        displayNameLower: tempNickname.trim().toLowerCase(),
        email: currentUser.email,
        xp: 0,
        level: 1,
        goalsCompleted: 0,
        friends: [],
        isVerified: true
      });
      setNeedsNickname(false);
      setUserData({
        ...userData,
        stats: { xp: 0, level: 1, goalsCompleted: 0, streak: 0, lastFocusDate: null, totalFocusMinutes: 0 }
      });
    } catch(e) {
      console.error(e);
      alert("Error saving nickname. Try again.");
    }
  };

  const handleSaveSettings = (newSettings) => {
    const newData = { ...userData, settings: newSettings };
    setUserData(newData);
    if (window.api && window.api.storage) {
      window.api.storage.save(newData); 
    }
  };

  const handleStartFocus = (goal) => {
    setCurrentGoal(goal);
    setPhase('FOCUS');
    
    if (window.api && window.api.blocker) {
      window.api.blocker.start(userData.settings.blacklist, goal.hardcore, userData.settings.blockedWebsites);
    }

    if (window.api && window.api.gemini && userData.settings.apiKey) {
      window.api.gemini.generate(goal.topic, userData.settings.apiKey, i18n.language, goal.filePath)
        .then(res => {
          if (res && res.questions) setQuizData(res.questions);
          else setQuizData(null);
        })
        .catch(err => {
          console.error("AI Fallback triggered: generation failed", err);
          setQuizData(null);
        });
    } else {
      setQuizData(null);
    }
  };

  const handleFocusComplete = async () => {
    if (window.api && window.api.blocker) window.api.blocker.stop();
    
    if (!userData.settings.apiKey || !quizData || quizData.length === 0) {
      handleQuizSubmit(2, null, true);
    } else {
      setPhase('QUIZ');
    }
  };

  const handleFocusAbort = () => {
    if (window.api && window.api.blocker) window.api.blocker.stop();
    setPhase('IDLE');
  };

  const handleQuizSubmit = async (score, feedback, noApi = false) => {
    const xpGained = noApi ? 20 : Math.round((score / 10) * 50) + 10;
    const newStats = { ...userData.stats };
    newStats.xp += xpGained;
    newStats.goalsCompleted += 1;
    newStats.totalFocusMinutes = (newStats.totalFocusMinutes || 0) + (currentGoal.minutes || 0);
    
    if (newStats.xp >= newStats.level * 100) {
      newStats.xp -= newStats.level * 100;
      newStats.level += 1;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = 1;
    
    if (userData.stats.lastFocusDate === today) {
      newStreak = userData.stats.streak || 1;
    } else if (userData.stats.lastFocusDate === yesterday) {
      newStreak = (userData.stats.streak || 0) + 1;
    }

    newStats.streak = newStreak;
    newStats.lastFocusDate = today;

    if (newStreak >= 7) newStats.xp += 15;
    else if (newStreak >= 3) newStats.xp += 5;
    
    setUserData({ ...userData, stats: newStats });
    setCurrentStreak(newStreak);
    setPhase('IDLE');

    if (userData.stats.lastFocusDate !== today || noApi) {
      setNoApiUsed(noApi);
      setShowStreakCelebration(true);
    }

    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          xp: newStats.xp,
          level: newStats.level,
          goalsCompleted: newStats.goalsCompleted,
          streak: newStreak,
          lastFocusDate: today,
          totalFocusMinutes: newStats.totalFocusMinutes
        });

        // Mark task as completed if this was a backlog task
        if (currentGoal.taskId) {
          const taskRef = doc(db, `users/${currentUser.uid}/tasks`, currentGoal.taskId);
          await updateDoc(taskRef, { completed: true });
        }

        // Save session history
        try {
          const historyRef = collection(db, `users/${currentUser.uid}/history`);
          await addDoc(historyRef, {
            topic: currentGoal.topic,
            minutes: currentGoal.minutes,
            xpGained: xpGained,
            date: new Date().toISOString()
          });
        } catch (err) {
          console.error("Failed to save session history:", err);
        }
      } catch(e) {
        console.error("Error saving XP or task to firestore", e);
      }
    }
  };

  /**
   * Listens for Ctrl+Shift+D keyboard combination to toggle the developer overlay.
   */
  useEffect(() => {
    if (!isDev) return;
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDevPanel(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDev]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (showStreakCelebration) {
    return <StreakCelebration 
      streak={currentStreak} 
      onComplete={() => setShowStreakCelebration(false)} 
      noApiUsed={noApiUsed}
    />;
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      >
        {(!userData?.settings?.lowGraphicsMode) && (
          <>
            <div className="absolute inset-0 opacity-70">
              <SoftAurora 
                speed={0.6}
                scale={1.5}
                brightness={0.8}
                color1="#8B5CF6"
                color2="#EC4899"
                noiseFrequency={2.5}
                noiseAmplitude={1}
                bandHeight={0.5}
                bandSpread={1}
                octaveDecay={0.1}
                layerOffset={0}
                colorSpeed={1}
                enableMouseInteraction={true}
                mouseInfluence={0.25}
              />
            </div>
            <div className="ambient-blob-1" />
            <div className="ambient-blob-2" />
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4 pointer-events-none"
          >
            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-200 px-6 py-2.5 rounded-full shadow-glow-red flex items-center gap-3 text-sm font-medium pointer-events-auto">
              <WifiOff size={16} className="text-red-400" />
              <span>{t('errors.system.offlineTitle')} — {t('errors.system.offlineDesc')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {authLoading && (
        <div className="h-screen w-screen flex items-center justify-center text-gray-500 relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-focus-primary border-t-transparent animate-spin" />
            <span className="text-sm tracking-widest uppercase">{t('app.verifying')}</span>
          </motion.div>
        </div>
      )}

      {!authLoading && !currentUser && (
        <div className="h-screen w-screen flex items-center justify-center relative z-10">
          <AuthScreen />
        </div>
      )}

      {!authLoading && currentUser && !currentUser.emailVerified && (
        <div className="h-screen w-screen flex flex-col items-center justify-center relative z-10 text-white">
          <div className="max-w-md w-full bg-[#0B0A15]/95 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center mx-4">
            <div className="w-16 h-16 rounded-full bg-focus-primary/20 flex items-center justify-center mb-6 text-focus-primary shadow-glow-primary-sm">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-3">{t('authScreen.verifyEmailTitle')}</h2>
            <p className="text-gray-400 font-light mb-8 leading-relaxed">
              {t('authScreen.verifyEmailDesc')}
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={async () => {
                  try {
                    const { sendEmailVerification } = await import('firebase/auth');
                    await sendEmailVerification(auth.currentUser);
                    alert(t('authScreen.emailResent'));
                  } catch(e) {
                    console.error(e);
                  }
                }}
                className="w-full py-4 rounded-xl bg-focus-primary hover:bg-focus-secondary text-white font-bold transition-colors shadow-glow-primary active:scale-95 duration-150 ease-ui-out"
              >
                {t('authScreen.resendEmail')}
              </button>
              <button 
                onClick={async () => {
                  await auth.currentUser.reload();
                  if (auth.currentUser.emailVerified) {
                    window.location.reload();
                  } else {
                    alert("Stále neověřeno. Zkuste to znovu za pár vteřin.");
                  }
                }}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors border border-white/5 active:scale-95 duration-150 ease-ui-out"
              >
                {t('authScreen.refreshStatus')}
              </button>
              <button 
                onClick={() => signOut(auth)}
                className="w-full mt-4 py-3 text-sm text-gray-500 hover:text-white transition-colors"
              >
                {t('app.logout', 'Odhlásit se')}
              </button>
            </div>
          </div>
        </div>
      )}

      {!authLoading && currentUser && currentUser.emailVerified && needsNickname && (
        <div className="h-screen w-screen flex flex-col items-center justify-center relative z-10 text-white">
          <div className="max-w-md w-full bg-[#0B0A15]/95 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center mx-4">
             <h2 className="text-2xl font-bold tracking-tight mb-3">Welcome to Aurora!</h2>
             <p className="text-gray-400 font-light mb-8 leading-relaxed">
               Please choose a nickname to appear on the leaderboards.
             </p>
             <input 
               value={tempNickname} 
               onChange={e => setTempNickname(e.target.value)} 
               placeholder="Nickname" 
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-focus-primary/50 transition-colors mb-4"
             />
             <button onClick={handleSaveNickname} className="w-full py-4 rounded-xl bg-focus-primary hover:bg-focus-secondary text-white font-bold transition-colors shadow-glow-primary active:scale-95 duration-150 ease-ui-out">
               Start focusing
             </button>
          </div>
        </div>
      )}

      {!authLoading && currentUser && currentUser.emailVerified && !needsNickname && !userData && (
        <div className="h-screen w-screen flex items-center justify-center text-gray-500 relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-focus-primary border-t-transparent animate-spin" />
            <span className="text-sm tracking-widest uppercase">{t('app.loadingProfile')}</span>
          </motion.div>
        </div>
      )}

      {!authLoading && currentUser && currentUser.emailVerified && !needsNickname && userData && (
        <div className="flex h-screen w-screen overflow-hidden text-white bg-transparent relative z-10">
          {userData.error && (
            <div className="absolute top-4 right-4 z-50 bg-red-500/10 text-red-300 p-3 rounded-full border border-red-500/20 text-sm backdrop-blur-md">
              {t('app.dbError', { error: userData.error })}
            </div>
          )}

          {/* Sidebar — ultra minimal, semi-transparent */}
          <div className="w-56 bg-black/20 backdrop-blur-2xl flex flex-col py-8 px-4 z-20 border-r border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12 px-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-focus-primary to-focus-secondary shadow-glow-primary-sm"></div>
              <span className="text-xl font-bold tracking-tight text-white">aurora</span>
            </div>

            {/* Nav Items */}
            <div className="flex flex-col gap-1 flex-1">
              {[
                { id: 'IDLE', icon: LayoutDashboard, label: t('app.dashboard'), match: ['IDLE', 'FOCUS', 'QUIZ'] },
                { id: 'BACKLOG', icon: ListTodo, label: t('app.tasks', 'Tasks'), match: ['BACKLOG'] },
                { id: 'SOCIAL', icon: Trophy, label: t('app.community'), match: ['SOCIAL'] },
                { id: 'SETTINGS', icon: SettingsIcon, label: t('app.settings'), match: ['SETTINGS'] },
              ].map(item => {
                const isActive = item.match.includes(phase);
                return (
                  <button 
                    key={item.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ease-ui-out text-sm font-medium w-full text-left active:scale-[0.98] ${
                      isActive 
                        ? 'text-white bg-white/10' 
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`} 
                    onClick={() => setPhase(item.id)}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-focus-primary shadow-glow-primary-sm" />}
                  </button>
                );
              })}
            </div>

            {/* Bottom: Level + Logout */}
            <div className="border-t border-white/5 pt-4 mt-4">
              {/* XP Mini Progress */}
              <div className="px-3 mb-1">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{t('app.level')} <span className="text-white font-bold">{userData.stats.level}</span></span>
                  <span className="text-gray-600">{userData.stats.xp}/{userData.stats.level * 100} XP</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-focus-primary to-focus-secondary transition-all duration-500 ease-out"
                    style={{ width: `${(userData.stats.xp / (userData.stats.level * 100)) * 100}%` }}
                  />
                </div>
              </div>

              <button 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ease-ui-out text-sm font-medium text-gray-500 hover:text-gray-300 hover:bg-white/5 w-full text-left mt-2 active:scale-[0.98]" 
                onClick={() => signOut(auth)}
              >
                <LogOut size={18} /> {t('app.logout')}
              </button>
            </div>
          </div>

          {/* Main Content — open, breathing, no glass cards wrapping content */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10">
            <div className="max-w-5xl w-full mx-auto flex flex-col flex-1 px-12 py-10">
              <AnimatePresence mode="wait">
                {phase === 'IDLE' && (
                  <motion.div
                    key="IDLE"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-16"
                  >
                    <Dashboard stats={userData.stats} userName={currentUser.displayName} userId={currentUser.uid} />
                    <GoalPlanner onStart={handleStartFocus} apiKeyMissing={!userData.settings.apiKey} />
                  </motion.div>
                )}

                {phase === 'BACKLOG' && (
                  <motion.div
                    key="BACKLOG"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col flex-1"
                  >
                    <FocusBacklog onStartFocus={handleStartFocus} />
                  </motion.div>
                )}

                {phase === 'SOCIAL' && (
                  <motion.div
                    key="SOCIAL"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col flex-1"
                  >
                    <SocialScreen />
                  </motion.div>
                )}

                {phase === 'FOCUS' && (
                  <motion.div
                    key="FOCUS"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                    transition={{ duration: 0.5, type: 'spring', bounce: 0.15 }}
                    className="flex-1 flex items-center justify-center"
                  >
                    <TimerScreen 
                      minutes={currentGoal.minutes} 
                      topic={currentGoal.topic} 
                      isHardcore={currentGoal.hardcore}
                      usePomodoro={currentGoal.usePomodoro}
                      pomodoroFocus={currentGoal.pomodoroFocus}
                      pomodoroBreak={currentGoal.pomodoroBreak}
                      onComplete={handleFocusComplete} 
                      onAbort={handleFocusAbort} 
                      onPhaseChange={(newPhase) => {
                        if (newPhase === 'PAUSE') {
                          if (window.api && window.api.blocker) window.api.blocker.stop();
                        } else if (newPhase === 'FOCUS') {
                          if (window.api && window.api.blocker) window.api.blocker.start(userData.settings.blacklist, currentGoal.hardcore);
                        }
                      }}
                    />
                  </motion.div>
                )}

                {phase === 'QUIZ' && (
                  <motion.div
                    key="QUIZ"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <QuizScreen 
                      quizData={quizData} 
                      apiKey={userData.settings.apiKey}
                      onSubmit={handleQuizSubmit} 
                    />
                  </motion.div>
                )}

                {phase === 'SETTINGS' && (
                  <motion.div
                    key="SETTINGS"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Settings 
                      settings={userData.settings} 
                      onSave={(newSettings) => handleSaveSettings(newSettings)} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Dev Panel — only for dev/admin users */}
      {isDev && showDevPanel && (
        <DevPanel 
          onClose={() => setShowDevPanel(false)}
          onTriggerStreak={(val) => {
            setCurrentStreak(val);
            setShowStreakCelebration(true);
            setShowDevPanel(false);
          }}
        />
      )}

      {/* Auto-updater Notification Overlay */}
      <UpdateNotification />
    </>
  );
}

export default App;
