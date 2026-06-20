import React, { useState, useEffect } from 'react';
/**
 * @file UpdateNotification.jsx
 * @description OTA (Over-The-Air) update listener component.
 * Integrates with electron-updater IPC messages to display download progress
 * and prompt users to restart once an update is fully staged.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UpdateNotification() {
  const { t } = useTranslation();
  const [status, setStatus] = useState('hidden');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.api && window.api.updater) {
      window.api.updater.onAvailable(() => {
        setStatus('downloading');
        setProgress(0);
      });

      window.api.updater.onProgress((progressObj) => {
        setStatus('downloading');
        setProgress(Math.round(progressObj.percent));
      });

      window.api.updater.onDownloaded(() => {
        setStatus('ready');
      });

      if (window.api.updater.onError) {
        window.api.updater.onError((err) => {
          console.error("Updater error IPC:", err);
          setStatus('error');
        });
      }
    }
  }, []);

  if (status === 'hidden') return null;

  const handleInstall = () => {
    if (window.api && window.api.updater) {
      window.api.updater.installUpdate();
    }
  };

  const handleDismiss = () => {
    setStatus('hidden');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="fixed bottom-6 right-6 z-[100] w-80 bg-[#0B0A15]/95 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col"
      >
        {status === 'downloading' && (
          <>
            <div className="flex items-center gap-3 mb-3 text-white">
              <Download size={18} className="text-focus-primary animate-pulse" />
              <span className="font-semibold text-sm">{t('updater.downloading', 'Stahování aktualizace...')}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-focus-primary to-focus-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <div className="text-xs text-gray-500 text-right mt-1.5">{progress}%</div>
          </>
        )}

        {status === 'ready' && (
          <>
            <div className="flex items-start justify-between mb-3 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-focus-primary/20 flex items-center justify-center text-focus-primary">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <span className="font-semibold text-sm block">{t('updater.readyTitle', 'Aktualizace připravena!')}</span>
                  <span className="text-xs text-gray-400">{t('updater.readyDesc', 'Nová verze je připravena k instalaci.')}</span>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-gray-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={handleInstall}
                className="flex-1 py-2.5 rounded-xl bg-focus-primary hover:bg-focus-primary/80 text-white font-bold transition-colors duration-150 ease-ui-out active:scale-95 text-sm"
              >
                {t('updater.installNow', 'Restartovat')}
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex items-start justify-between mb-3 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <X size={16} />
                </div>
                <div>
                  <span className="font-semibold text-sm block">{t('errors.system.updaterErrorTitle')}</span>
                  <span className="text-xs text-gray-400">{t('errors.system.updaterErrorDesc')}</span>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-gray-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={handleDismiss}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors duration-150 ease-ui-out active:scale-95 text-sm"
              >
                {t('goalPlanner.cancel')}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
