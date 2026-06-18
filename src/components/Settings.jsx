import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
/**
 * @file Settings.jsx
 * @description Application configuration interface.
 * Handles user preferences including Gemini API keys, language selection,
 * process blacklisting for the Hardcore blocker, and performance modes.
 */
import { Save, Shield, Key, Globe, ChevronDown, Check, CheckCircle2, Activity, X, Search, BatteryMedium } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';

function Settings({ settings, onSave }) {
  const { t, i18n } = useTranslation();
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [blacklistRaw, setBlacklistRaw] = useState((settings.blacklist || []).join('\n'));
  const [blockedWebsitesRaw, setBlockedWebsitesRaw] = useState((settings.blockedWebsites || []).join('\n'));
  const [lowGraphicsMode, setLowGraphicsMode] = useState(settings.lowGraphicsMode || false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedProcesses, setScannedProcesses] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const procs = await window.api.scanner.getProcesses();
      setScannedProcesses(procs);
      setSelectedProcesses(new Set());
      setSearchQuery('');
      setShowScannerModal(true);
    } catch (e) {
      console.error(e);
    }
    setIsScanning(false);
  };

  const toggleProcess = (proc) => {
    const newSelected = new Set(selectedProcesses);
    if (newSelected.has(proc)) {
      newSelected.delete(proc);
    } else {
      newSelected.add(proc);
    }
    setSelectedProcesses(newSelected);
  };

  const handleApplyScanner = () => {
    const currentList = blacklistRaw.split('\n').map(s => s.trim()).filter(Boolean);
    const toAdd = Array.from(selectedProcesses).filter(p => !currentList.includes(p));
    const newList = [...currentList, ...toAdd];
    setBlacklistRaw(newList.join('\n'));
    setShowScannerModal(false);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('appLang', lang);
    setIsLangOpen(false);
  };

  const handleSave = () => {
    const list = blacklistRaw.split('\n').map(s => s.trim()).filter(Boolean);
    const websitesList = blockedWebsitesRaw.split('\n').map(s => s.trim()).filter(Boolean);
    onSave({ apiKey, blacklist: list, blockedWebsites: websitesList, lowGraphicsMode });
    
    // UI-UX Pro Max: Inline reassurance
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl w-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{t('settings.title')}</h1>
        <p className="text-gray-500 font-light text-lg mb-10">Configure your focus experience.</p>
      </motion.div>

      {/* Language */}
      <motion.div 
        className="mb-8 pb-8 border-b border-white/5 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <label className="flex items-center gap-2 mb-3 text-sm text-gray-500 font-medium tracking-wide">
          <Globe size={16} /> {t('settings.language')}
        </label>
        <div className="relative">
          <button 
            type="button"
            className="w-full flex justify-between items-center bg-white/5 border border-white/10 px-5 py-3.5 rounded-xl text-white hover:bg-white/[0.07] transition-colors focus:outline-none"
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            {i18n.language === 'cs' ? t('settings.czech') : t('settings.english')}
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isLangOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0B0A15] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
              >
                {['en', 'cs'].map(lang => (
                  <div 
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-5 py-3.5 flex justify-between items-center cursor-pointer transition-colors ${
                      i18n.language === lang ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {lang === 'en' ? t('settings.english') : t('settings.czech')}
                    {i18n.language === lang && <Check size={14} className="text-focus-primary" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* API Key */}
      <motion.div 
        className="mb-8 pb-8 border-b border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <label className="flex items-center gap-2 mb-3 text-sm text-gray-500 font-medium tracking-wide">
          <Key size={16} /> {t('settings.apiKey')}
        </label>
        <input 
          type="password" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)} 
          placeholder="AIzaSy..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-focus-primary/50 transition-colors"
        />
        <p className="text-xs text-gray-600 mt-2">{t('settings.keyDisclaimer')}</p>
      </motion.div>

      {/* Blacklist */}
      <motion.div 
        className="mb-8 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <label className="flex items-center gap-2 mb-3 text-sm text-gray-500 font-medium tracking-wide">
          <Shield size={16} /> {t('settings.blacklistLabel')}
        </label>
        <textarea 
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-focus-primary/50 transition-colors resize-none min-h-[160px]"
          value={blacklistRaw}
          onChange={(e) => setBlacklistRaw(e.target.value)}
          placeholder={`steam\ndiscord\nspotify`}
        />
        <div className="flex justify-between items-start mt-4">
          <p className="text-xs text-gray-600 max-w-[60%]">{t('settings.blacklistDisclaimer')}</p>
          <button 
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            onClick={handleScan} 
            disabled={isScanning} 
          >
            <Activity size={14} /> {isScanning ? t('settings.scanning') : t('settings.scanApps')}
          </button>
        </div>
      </motion.div>

      {/* Blocked Websites */}
      <motion.div 
        className="mb-8 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        <label className="flex items-center gap-2 mb-3 text-sm text-gray-500 font-medium tracking-wide">
          <Globe size={16} /> {t('settings.blockedWebsitesLabel', 'Blocked Websites (Chrome Extension)')}
        </label>
        <textarea 
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-focus-primary/50 transition-colors resize-none min-h-[160px]"
          value={blockedWebsitesRaw}
          onChange={(e) => setBlockedWebsitesRaw(e.target.value)}
          placeholder={`youtube.com\ntiktok.com\ninstagram.com`}
        />
        <div className="flex justify-between items-start mt-4">
          <p className="text-xs text-gray-600 max-w-[80%]">{t('settings.blockedWebsitesDisclaimer', 'These domains will be blocked in your browser via the Aurora Chrome extension during any focus session.')}</p>
        </div>
      </motion.div>

      {/* Low Graphics Mode */}
      <motion.div 
        className="mb-8 pb-8 border-b border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm text-gray-500 font-medium tracking-wide">
            <BatteryMedium size={16} /> {t('settings.lowGraphics')}
          </label>
          <ToggleSwitch checked={lowGraphicsMode} onChange={setLowGraphicsMode} />
        </div>
        <p className="text-xs text-gray-600 max-w-[80%]">{t('settings.lowGraphicsDesc')}</p>
      </motion.div>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <button 
          type="button"
          onClick={handleSave}
          className={`w-full text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 ease-ui-out active:scale-95 flex items-center justify-center gap-2 ${
            isSaved 
              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 pointer-events-none' 
              : 'bg-focus-primary hover:bg-focus-secondary shadow-glow-primary hover:shadow-glow-secondary-lg'
          }`}
        >
          {isSaved ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key="saved"
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={18} /> {t('settings.saved', 'Uloženo!')}
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key="save"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center gap-2"
              >
                <Save size={18} /> {t('settings.saveSettings')}
              </motion.div>
            </AnimatePresence>
          )}
        </button>

        <button 
          type="button"
          onClick={() => {
            if (window.api && window.api.shell) {
              window.api.shell.openExternal("https://forms.gle/WbAz2Aat8qNAaPnTA");
            }
          }}
          className="w-full mt-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold py-3 px-8 rounded-xl transition-colors duration-150 ease-ui-out active:scale-95"
        >
          {t('settings.reportBug')}
        </button>
      </motion.div>

      {/* Scanner Modal */}
      {createPortal(
        <AnimatePresence>
          {showScannerModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex justify-center items-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="bg-[#0B0A15]/95 border border-white/10 rounded-3xl p-6 w-full max-w-lg flex flex-col max-h-[85vh] shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h3 className="text-xl font-bold">{t('settings.scanTitle')}</h3>
                  <button type="button" onClick={() => setShowScannerModal(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="relative mb-4 shrink-0">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={i18n.language === 'cs' ? 'Hledat aplikaci...' : 'Search apps...'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-focus-primary/50 transition-colors"
                  />
                </div>
                
                <div className="overflow-y-auto flex-1 min-h-0 flex flex-col gap-1 mb-6 custom-scrollbar">
                  {scannedProcesses.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase())).map(proc => (
                    <label key={proc} className="flex items-center gap-3 py-2.5 px-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedProcesses.has(proc)} 
                        onChange={() => toggleProcess(proc)} 
                        className="w-4 h-4 accent-focus-primary cursor-pointer shrink-0 rounded"
                      />
                      <span className="text-sm font-mono text-gray-300 break-all">{proc}</span>
                    </label>
                  ))}
                  {scannedProcesses.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <p className="text-gray-600 text-center py-8 text-sm">Nic nenalezeno.</p>
                  )}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-focus-primary text-white font-bold py-3 px-6 rounded-full transition-colors shrink-0" 
                  onClick={handleApplyScanner}
                >
                  {t('settings.apply')} ({selectedProcesses.size})
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default Settings;
