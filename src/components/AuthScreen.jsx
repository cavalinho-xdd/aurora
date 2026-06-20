import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, deleteUser, sendEmailVerification, sendPasswordResetEmail, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { UserPlus, LogIn, AlertCircle, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * @component AuthScreen
 * @description Authentication user interface.
 * Handles traditional email/password registration, login, and manages the 
 * deep-linking OAuth flow for Google Sign-In via IPC listeners.
 */
function AuthScreen() {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [resetSent, setResetSent] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (window.api && window.api.auth) {
      window.api.auth.onGoogleAuth(async (token) => {
        try {
          setLoading(true);
          const credential = GoogleAuthProvider.credential(token);
          await signInWithCredential(auth, credential);
        } catch (err) {
          console.error("Deep link auth error:", err);
          setError(t('authScreen.connectionError') + " (Google)");
          setLoading(false);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setFieldErrors({ email: true });
      setError(t('goalPlanner.requiredField'));
      return;
    }
    try {
      setLoading(true);
      setError('');
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      console.error(err);
      setError(err.message || t('authScreen.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (isRegister && !displayName.trim()) errors.displayName = true;
    if (!email.trim()) errors.email = true;
    if (!password.trim()) errors.password = true;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!displayName) throw new Error(t('authScreen.nicknameRequired'));
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", displayName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          await deleteUser(user);
          throw new Error(t('authScreen.nicknameInUse'));
        }
        
        await updateProfile(user, { displayName });
        
        await setDoc(doc(db, "users", user.uid), {
          displayName,
          email,
          xp: 0,
          level: 1,
          goalsCompleted: 0,
          friends: [],
          isVerified: false
        });

        await sendEmailVerification(user);

      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      switch(err.code) {
        case 'auth/email-already-in-use': setError(t('authScreen.emailInUse')); break;
        case 'auth/invalid-credential': setError(t('authScreen.invalidCreds')); break;
        case 'auth/weak-password': setError(t('errors.auth.weakPassword')); break;
        case 'auth/user-not-found': setError(t('errors.auth.userNotFound')); break;
        case 'auth/wrong-password': setError(t('errors.auth.wrongPassword')); break;
        case 'auth/network-request-failed': setError(t('errors.auth.networkRequestFailed')); break;
        case 'auth/too-many-requests': setError(t('errors.auth.tooManyRequests')); break;
        case 'auth/invalid-email': setError(t('errors.auth.invalidEmail')); break;
        default: setError(t('errors.auth.default') + " " + (err.message || "")); break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="max-w-sm w-full mx-4" 
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Branding */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-4 h-4 rounded-full bg-focus-primary" />
        <span className="text-2xl font-bold tracking-tight">aurora</span>
      </div>

      <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
        {isRegister ? t('authScreen.createAccount', 'Create account') : t('authScreen.welcomeBack', 'Welcome back')}
      </h2>
      <p className="text-gray-500 font-light mb-10">
        {isRegister ? t('authScreen.registerSubtitle', 'Start earning your focus.') : t('authScreen.loginSubtitle', 'Pick up where you left off.')}
      </p>
      
      {error && (
        <div className="text-red-400/80 text-sm mb-6 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
          <span>{error}</span>
        </div>
      )}

      {resetSent && (
        <div className="text-green-400/80 text-sm mb-6 flex items-start gap-2 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
          <span>{t('authScreen.resetLinkSent')}</span>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {isRegister && (
          <div>
            <label className="block mb-2 text-sm text-gray-500 font-medium">{t('authScreen.nickname')}</label>
            <div className="relative">
              <input 
                type="text" value={displayName} 
                onChange={(e) => { setDisplayName(e.target.value); setFieldErrors(prev => ({...prev, displayName: false})) }} 
                placeholder="Procrastinator123" 
                className={`w-full bg-white/5 border ${fieldErrors.displayName ? 'border-red-500' : 'border-white/10 focus:border-focus-primary/50'} rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary/50 transition-colors`}
              />
              {fieldErrors.displayName && (
                <div className="absolute -top-10 left-0 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 z-[var(--z-tooltip)]">
                  <AlertCircle size={12} /> {t('goalPlanner.requiredField')}
                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                </div>
              )}
            </div>
          </div>
        )}
        <div>
          <label className="block mb-2 text-sm text-gray-500 font-medium">{t('authScreen.email')}</label>
          <div className="relative">
            <input 
              type="email" value={email} 
              onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({...prev, email: false})) }} 
              placeholder="aurora@example.com" 
              className={`w-full bg-white/5 border ${fieldErrors.email ? 'border-red-500' : 'border-white/10 focus:border-focus-primary/50'} rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary/50 transition-colors`}
            />
            {fieldErrors.email && (
              <div className="absolute -top-10 left-0 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 z-[var(--z-tooltip)]">
                <AlertCircle size={12} /> {t('goalPlanner.requiredField')}
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-500 font-medium">{t('authScreen.password')}</label>
          <div className="relative">
            <input 
              type="password" value={password} 
              onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({...prev, password: false})) }} 
              placeholder="••••••••" minLength="6" 
              className={`w-full bg-white/5 border ${fieldErrors.password ? 'border-red-500' : 'border-white/10 focus:border-focus-primary/50'} rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary/50 transition-colors`}
            />
            {fieldErrors.password && (
              <div className="absolute -top-10 left-0 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 z-[var(--z-tooltip)]">
                <AlertCircle size={12} /> {t('goalPlanner.requiredField')}
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
              </div>
            )}
          </div>
          
          {!isRegister && (
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                onClick={handleResetPassword}
                disabled={loading}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {t('authScreen.forgotPassword')}
              </button>
            </div>
          )}
        </div>

        <motion.button 
          type="submit" disabled={loading || isOffline}
          whileHover={!isOffline ? { scale: 1.02 } : {}}
          whileTap={!isOffline ? { scale: 0.98 } : {}}
          className={`mt-4 text-white font-bold py-4 px-6 rounded-full transition-colors duration-150 ease-ui-out active:scale-95 flex justify-center items-center gap-2 ${
            isOffline 
              ? 'bg-gray-600 cursor-not-allowed opacity-50' 
              : 'bg-focus-primary shadow-glow-cta hover:shadow-glow-cta-hover disabled:opacity-50 disabled:hover:shadow-none'
          }`}
        >
          {isOffline ? <WifiOff size={18} /> : (isRegister ? <UserPlus size={18} /> : <LogIn size={18} />)}
          {isOffline ? t('errors.system.offlineTitle') : (loading ? t('authScreen.processing') : (isRegister ? t('authScreen.createAccount') : t('authScreen.login')))}
        </motion.button>

        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.api && window.api.shell) {
              window.api.shell.openExternal(`${import.meta.env.VITE_WEB_APP_URL}/auth`);
            }
          }}
          disabled={loading || isOffline}
          className={`w-full bg-white text-black font-bold py-3.5 px-6 rounded-xl transition duration-150 ease-ui-out active:scale-95 flex justify-center items-center gap-3 ${
            isOffline ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </form>

      <div className="text-center mt-8">
        <button 
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? t('authScreen.hasAccount') : t('authScreen.noAccount')}
        </button>
      </div>
    </motion.div>
  );
}

export default AuthScreen;
