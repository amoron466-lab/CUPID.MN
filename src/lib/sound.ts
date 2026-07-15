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

// --- HTMLAudioElement asset registry ------------------------------------
//
// The fail sound and background song are owned here, as module-level
// singletons, instead of each component creating its own `new Audio(...)`.
// That matters specifically for iOS Safari: an <audio> element only becomes
// eligible for *programmatic* play() (i.e. one not directly inside a click
// handler's synchronous call stack) after that exact same element instance
// has successfully played once during a real user gesture. If each
// component created its own element, there would be nothing to unlock by
// the time playback is actually needed — the elements playing later
// (after `await`s, animation delays, etc.) would be different instances
// than whatever got "unlocked", so Safari would silently drop them.
let failAudio: HTMLAudioElement | null = null;
let songAudio: HTMLAudioElement | null = null;
let unlocked = false;

// Creates the audio elements (once) and kicks off their network preload.
// Deliberately not called at module load / component mount — the caller
// (unlockAudio, below) only invokes this after the user's first gesture, so
// nothing is fetched before it's clear the visitor is actually engaging.
function ensureAudioElements() {
  if (typeof window === "undefined") return;
  if (!failAudio) {
    failAudio = new Audio("/sounds/fail.mp4");
    failAudio.preload = "auto";
  }
  if (!songAudio) {
    songAudio = new Audio("/sounds/blue.mp4");
    songAudio.preload = "auto";
    songAudio.loop = true;
    songAudio.volume = 0;
  }
}

// Primes a single element for later programmatic playback: play it (muted,
// so priming is inaudible even though real playback elsewhere may use a
// nonzero volume) and immediately pause + rewind once that play call
// resolves. This is the standard WebKit "unlock" trick — the element only
// needs to have played once during a genuine user gesture; every play()
// call after that, even from a callback fired well after the gesture ended
// (a `setTimeout`, an awaited animation, an "ended" listener chain), is
// then allowed.
function primeElement(audio: HTMLAudioElement) {
  const originalVolume = audio.volume;
  audio.load();
  audio.volume = 0;
  const attempt = audio.play();
  if (attempt && typeof attempt.then === "function") {
    attempt
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = originalVolume;
      })
      .catch(() => {
        // Autoplay refused even for the muted priming call — nothing more
        // to do; real playback later will simply also fail on this device,
        // same as it would have without this attempt.
        audio.volume = originalVolume;
      });
  } else {
    audio.volume = originalVolume;
  }
}

// Call this synchronously from the very first user gesture (the Begin
// button, or a fallback first-tap listener) — before any `await`. It must
// run inside that gesture's call stack, not after one, or iOS Safari won't
// count it as user-initiated and every step below becomes a no-op.
//
// Resumes/creates the shared AudioContext (for the heartbeat + sparkle
// synths) and primes the fail-sound element, so it plays reliably however
// much later it's actually triggered (handleNoCaught only calls play() on
// it after several `await`s/animation delays).
//
// The background song is deliberately NOT primed here: its own real play()
// call (in playSong(), fired synchronously in the same Begin click, right
// after this function) already satisfies the gesture requirement on its
// own. Priming it here too would race that real playback — the priming
// play()'s pause-and-rewind callback can resolve *after* playSong() has
// already started it for real, silently killing the song moments after it
// begins.
export function unlockAudio() {
  if (unlocked || typeof window === "undefined") return;
  unlocked = true;

  const ac = getCtx();
  if (ac && ac.state === "suspended") {
    void ac.resume();
  }

  ensureAudioElements();
  if (failAudio) primeElement(failAudio);
}

// Accessors — components read the shared instance instead of creating
// their own. Both also lazily ensure the elements exist, as a fallback in
// case something plays before unlockAudio() has run (it just won't have
// been primed yet, same as before this change).
export function getFailAudio(): HTMLAudioElement | null {
  ensureAudioElements();
  return failAudio;
}

export function getSongAudio(): HTMLAudioElement | null {
  ensureAudioElements();
  return songAudio;
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
