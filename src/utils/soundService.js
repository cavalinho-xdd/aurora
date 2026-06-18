/**
 * @file soundService.js
 * @description Lightweight UI sound synthesizer using Web Audio API.
 * Avoids the need for external asset loading by generating sine/square waves.
 */

const getAudioContext = () => {
  if (!window.audioCtx) {
    window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window.audioCtx;
};

export const playTimerEnd = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const playPhaseChange = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // A4

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const playLevelUp = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const notes = [
      { freq: 440, time: 0, dur: 0.1 },      // A4
      { freq: 554.37, time: 0.1, dur: 0.1 }, // C#5
      { freq: 659.25, time: 0.2, dur: 0.1 }, // E5
      { freq: 880, time: 0.3, dur: 0.4 },    // A5
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soften the square wave a bit
      osc.type = 'sine';
      osc.frequency.value = n.freq;

      gain.gain.setValueAtTime(0.3, ctx.currentTime + n.time);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + n.time);
      osc.stop(ctx.currentTime + n.time + n.dur);
    });
  } catch (e) {
    console.error("Audio play failed", e);
  }
};
