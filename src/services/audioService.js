/**
 * Áudio Nativo via Web Audio API
 * Sintetiza um som de carrilhão/gongo digital límpido e agradável
 * Não requer arquivos externos e funciona 100% offline.
 */
export function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Primeiro tom: 587.33 Hz (Ré 5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 1.2);

    // Segundo tom (mais agudo): 880 Hz (Lá 5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);

    gain2.gain.setValueAtTime(0.001, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.5, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.15);
    osc2.stop(now + 1.8);
  } catch (err) {
    console.warn('Áudio bloqueado pelo navegador até haver interação do usuário:', err);
  }
}
