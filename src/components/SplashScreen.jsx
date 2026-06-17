import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SoftAurora from './SoftAurora';

function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete(), 1000); 
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-[9999] bg-[#0B0A15] overflow-hidden flex items-center justify-center"
          exit={{ opacity: 0, filter: 'blur(20px)' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {/* Background Aurora matching the web app */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 z-0"
            >
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
                enableMouseInteraction={false}
              />
            </motion.div>

            {/* Krycí vrstva pro feathered mask (odkrývá Auroru jako čáru) - zkopírováno z webu */}
            <motion.div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{
                width: "200vw",
                left: "-150px", 
                background: "linear-gradient(to right, transparent 0px, transparent 50px, #0B0A15 250px, #0B0A15 100%)"
              }}
              initial={{ x: "0vw" }}
              animate={{ x: "100vw" }}
              transition={{
                duration: 3.0,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="relative z-20 text-center flex flex-col items-center">
            {/* Animated Logo & Text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] shadow-[0_0_30px_rgba(139,92,246,0.6)]"></div>
              <h1 className="text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                aurora
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 0.6, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, delay: 1.2, ease: 'easeOut' }}
              className="text-white text-2xl mt-8 italic tracking-wider font-light"
            >
              "Light up your mind."
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
