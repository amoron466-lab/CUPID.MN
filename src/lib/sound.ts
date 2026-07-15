// Tiny Web Audio synth for the two sounds the YES flow needs — no audio
// files required. Lazily creates a single shared AudioContext on first use,
// which also satisfies the browser autoplay gesture requirement since it's
// always first called from a click handler.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  return ctx;
}

// Schedules `fn` once the context is guaranteed to be running. Most browsers
// require resume() to be triggered from within a user-gesture call stack —
// it was being fired here already, but never awaited, so on a cold context
// (suspended right after construction) the oscillators were being scheduled
// against a clock that hadn't started yet and got silently dropped. Awaiting
// the resume before touching currentTime fixes that race.
function withRunningContext(fn: (ac: AudioContext, master: GainNode) => void) {
  const ac = getCtx();
  if (!ac || !master) return;
  if (ac.state === "suspended") {
    void ac.resume().then(() => fn(ac, master!));
  } else {
    fn(ac, master);
  }
}

// A warm, low, cinematic heartbeat thump. A pure sub-40Hz sine reads as
// "not audible" on laptop/phone speakers (most roll off hard below ~100Hz),
// so the body tone sits a bit higher, layered with a soft filtered "knock"
// transient that gives it presence and shape without turning it sharp.
export function playHeartbeatThump() {
  withRunningContext((ac, out) => {
    const now = ac.currentTime;

    // low, round body — the "thud"
    const body = ac.createOscillator();
    const bodyGain = ac.createGain();
    body.type = "sine";
    body.frequency.setValueAtTime(150, now);
    body.frequency.exponentialRampToValueAtTime(62, now + 0.16);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.5, now + 0.018);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    body.connect(bodyGain).connect(out);
    body.start(now);
    body.stop(now + 0.36);

    // soft filtered noise burst — gives the thump a felt, organic "knock"
    // that reads even on speakers that can't reproduce the low body tone
    const bufferSize = Math.floor(ac.sampleRate * 0.05);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ac.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ac.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(220, now);

    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.22, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    noise.connect(noiseFilter).connect(noiseGain).connect(out);
    noise.start(now);
  });
}

// A tiny champagne-gold sparkle chime for when the success message appears.
export function playSparkleChime() {
  withRunningContext((ac, out) => {
    const now = ac.currentTime;

    [1760, 2637, 3520].forEach((freq, i) => {
      const start = now + i * 0.035;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);

      osc.connect(gain).connect(out);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  });
}
