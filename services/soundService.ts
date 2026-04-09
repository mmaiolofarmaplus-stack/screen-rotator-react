// Create a shared AudioContext
// We use a lazy initialization pattern because AudioContext is not allowed to start without user interaction
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const initAudio = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(e => console.error("Could not resume audio context", e));
  }
};

export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    initAudio();
    const now = ctx.currentTime;

    // --- CASH REGISTER "KA-CHING" ---
    // Two high-pitched sine waves played in quick succession to simulate coins/register.
    
    // Tone 1: "Ka" (Lower metallic ping)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.type = 'sine'; // Pure sine sounds like clean metal/coins
    osc1.frequency.setValueAtTime(1500, now);
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.01); // Fast attack
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Fast decay

    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: "Ching" (Higher, slightly delayed, longer sustain)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2500, now + 0.08); // 80ms delay
    
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.09); 
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8); // Longer ring

    osc2.start(now + 0.08);
    osc2.stop(now + 0.8);

  } catch (e) {
    console.error("Error generating sound", e);
  }
};

export const playCelebrationSound = () => {
  try {
    // Reproducir el archivo mp3 alojado en la carpeta /public
    const audio = new Audio('/aplausos_2.mp3');
    audio.play().catch(e => console.error("Error reproduciendo aplausos_2.mp3", e));
  } catch (e) {
    console.error("Error generating celebration sound", e);
  }
};