export type RadioSfxKind =
  | 'prev'
  | 'next'
  | 'power_on'
  | 'power_off'
  | 'dial'
  | 'glass_tap'
  | 'jacket_open'
  | 'ui_page'
  | 'ui_click'
  | 'quiz_correct'
  | 'quiz_wrong';

// Switch-on click (~45ms) followed by 1.0s (90%), 3.0s (5%), or 5.0s (5%) of Noise 3 or Noise 4 scratch crackle
export const RADIO_POWER_WARMUP_MS = 1045;

const BASE = import.meta.env.BASE_URL;
const POWER_ON_NOISE_URLS = [
  `${BASE}assets/sfx/radio_noise_3.mp3`,
  `${BASE}assets/sfx/radio_noise_4.mp3`,
] as const;
const DIAL_SFX_URL = `${BASE}assets/sfx/radio_dial_snap.wav`;

const SWITCH_CLICK_LEAD_SEC = 0.045;
const DEFAULT_SCRATCH_NOISE_DURATION_SEC = 1.0;

export function rollPowerOnNoiseDurationSec(): 1 | 3 | 5 {
  const roll = Math.random();
  if (roll < 0.05) return 5;
  if (roll < 0.10) return 3;
  return 1;
}

let sharedAudioCtx: AudioContext | null = null;
let cachedNoiseBuffer: AudioBuffer | null = null;

const rawNoisePromises: Array<Promise<ArrayBuffer | null> | null> = [null, null];
const rawNoiseBuffers: Array<ArrayBuffer | null> = [null, null];
const decodedNoiseBuffers: Array<AudioBuffer | null> = [null, null];

let rawDialPromise: Promise<ArrayBuffer | null> | null = null;
let rawDialBuffer: ArrayBuffer | null = null;
let decodedDialBuffer: AudioBuffer | null = null;

let activeNoiseSource: AudioBufferSourceNode | null = null;
let activeNoiseAudio: HTMLAudioElement | null = null;
let activeNoiseFallbackTimer: number | null = null;
let activeDialSource: AudioBufferSourceNode | null = null;
let activeDialAudio: HTMLAudioElement | null = null;
let powerOnSessionId = 0;
let buttonSfxEnabled = true;

export function setRadioButtonSfxEnabled(enabled: boolean): void {
  buttonSfxEnabled = enabled;
  if (!enabled) {
    stopActivePowerOnNoise();
  }
}

export function isRadioButtonSfxEnabled(): boolean {
  return buttonSfxEnabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;

  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function fetchRawNoise(index: 0 | 1): Promise<ArrayBuffer | null> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return Promise.resolve(null);
  }
  if (rawNoiseBuffers[index]) {
    return Promise.resolve(rawNoiseBuffers[index]);
  }
  if (!rawNoisePromises[index]) {
    rawNoisePromises[index] = fetch(POWER_ON_NOISE_URLS[index])
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .then((buf) => {
        if (buf) {
          rawNoiseBuffers[index] = buf;
        }
        return buf;
      })
      .catch(() => null);
  }
  return rawNoisePromises[index]!;
}

async function getDecodedNoiseBuffer(
  ctx: AudioContext,
  index: 0 | 1
): Promise<AudioBuffer | null> {
  const existing = decodedNoiseBuffers[index];
  if (existing && existing.sampleRate === ctx.sampleRate) {
    return existing;
  }
  const raw = await fetchRawNoise(index);
  if (!raw) return null;
  try {
    // Pass a copy because decodeAudioData detaches the ArrayBuffer
    const decoded = await ctx.decodeAudioData(raw.slice(0));
    decodedNoiseBuffers[index] = decoded;
    return decoded;
  } catch {
    return null;
  }
}

function fetchRawDial(): Promise<ArrayBuffer | null> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return Promise.resolve(null);
  }
  if (rawDialBuffer) {
    return Promise.resolve(rawDialBuffer);
  }
  if (!rawDialPromise) {
    rawDialPromise = fetch(DIAL_SFX_URL)
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .then((buf) => {
        if (buf) {
          rawDialBuffer = buf;
        }
        return buf;
      })
      .catch(() => null);
  }
  return rawDialPromise;
}

async function getDecodedDialBuffer(
  ctx: AudioContext
): Promise<AudioBuffer | null> {
  if (decodedDialBuffer && decodedDialBuffer.sampleRate === ctx.sampleRate) {
    return decodedDialBuffer;
  }
  const raw = await fetchRawDial();
  if (!raw) return null;
  try {
    const decoded = await ctx.decodeAudioData(raw.slice(0));
    decodedDialBuffer = decoded;
    return decoded;
  } catch {
    return null;
  }
}

export function preloadRadioNoiseSfx(): void {
  if (typeof window === 'undefined') return;
  void fetchRawNoise(0);
  void fetchRawNoise(1);
  void fetchRawDial();
}

// Start prefetching lightweight scratch noise and dial snap clips immediately
if (typeof window !== 'undefined') {
  preloadRadioNoiseSfx();
}

export function stopActivePowerOnNoise(): void {
  powerOnSessionId += 1;
  if (activeNoiseFallbackTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(activeNoiseFallbackTimer);
    activeNoiseFallbackTimer = null;
  }
  if (activeNoiseSource) {
    try {
      activeNoiseSource.stop();
      activeNoiseSource.disconnect();
    } catch {
      // Already stopped
    }
    activeNoiseSource = null;
  }
  if (activeNoiseAudio) {
    try {
      activeNoiseAudio.pause();
      activeNoiseAudio.currentTime = 0;
    } catch {
      // Ignore cleanup errors
    }
    activeNoiseAudio = null;
  }
}

function playPowerOnScratchNoise(
  ctx: AudioContext,
  clickTime: number,
  noiseDurationSec: number = DEFAULT_SCRATCH_NOISE_DURATION_SEC
): void {
  stopActivePowerOnNoise();
  const session = powerOnSessionId;
  const noiseIndex: 0 | 1 = Math.random() < 0.5 ? 0 : 1;

  const startDecodedBuffer = (buf: AudioBuffer, scheduledAt: number) => {
    if (session !== powerOnSessionId) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const needsLoop = noiseDurationSec > buf.duration;
    if (needsLoop) {
      const trimEdge = Math.min(0.05, buf.duration * 0.1);
      src.loop = true;
      src.loopStart = trimEdge;
      src.loopEnd = Math.max(trimEdge + 0.2, buf.duration - trimEdge);
    }

    const playDuration = needsLoop
      ? noiseDurationSec
      : Math.min(noiseDurationSec, buf.duration);
    const endAt = scheduledAt + playDuration;
    const fadeTailStart = Math.max(scheduledAt, endAt - 0.035);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85, scheduledAt);
    gain.gain.setValueAtTime(0.85, fadeTailStart);
    gain.gain.linearRampToValueAtTime(0.0001, endAt);

    src.connect(gain);
    gain.connect(ctx.destination);

    activeNoiseSource = src;
    src.onended = () => {
      if (activeNoiseSource === src) {
        activeNoiseSource = null;
      }
      try {
        gain.disconnect();
      } catch {
        // Ignore disconnect cleanup
      }
    };

    src.start(scheduledAt, 0, playDuration);
  };

  const cachedDecoded = decodedNoiseBuffers[noiseIndex];
  if (cachedDecoded && cachedDecoded.sampleRate === ctx.sampleRate) {
    startDecodedBuffer(cachedDecoded, clickTime + SWITCH_CLICK_LEAD_SEC);
    return;
  }

  // Decode pre-fetched buffer (or fetch if first-click was instant), falling back to HTMLAudioElement if needed
  const targetStartTime = clickTime + SWITCH_CLICK_LEAD_SEC;
  getDecodedNoiseBuffer(ctx, noiseIndex).then((decoded) => {
    if (session !== powerOnSessionId) return;
    if (decoded) {
      const safeStart = Math.max(ctx.currentTime + 0.002, targetStartTime);
      startDecodedBuffer(decoded, safeStart);
      return;
    }

    // Fallback to direct HTMLAudioElement playback if Web Audio decode failed
    const delayMs = Math.max(0, (targetStartTime - ctx.currentTime) * 1000);
    activeNoiseFallbackTimer = window.setTimeout(() => {
      if (session !== powerOnSessionId) return;
      const el = new Audio(POWER_ON_NOISE_URLS[noiseIndex]);
      el.volume = 0.72;
      el.loop = noiseDurationSec > 1;
      activeNoiseAudio = el;
      const p = el.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
      activeNoiseFallbackTimer = window.setTimeout(() => {
        if (activeNoiseAudio === el) {
          el.pause();
          el.currentTime = 0;
          activeNoiseAudio = null;
        }
        activeNoiseFallbackTimer = null;
      }, noiseDurationSec * 1000);
    }, delayMs);
  });
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }
  const length = Math.floor(ctx.sampleRate * 0.6);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let prev = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    prev = prev * 0.45 + white * 0.55;
    const crackle = Math.random() < 0.015 ? (Math.random() * 2 - 1) * 1.45 : 0;
    data[i] = Math.max(-1, Math.min(1, prev + crackle));
  }
  cachedNoiseBuffer = buffer;
  return buffer;
}

function triggerWoodBody(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  startFreq: number,
  endFreq: number,
  duration: number,
  gainPeak: number,
  lowpassFreq = 420
) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(startFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(22, endFreq),
    startTime + duration
  );

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(lowpassFreq, startTime);
  filter.Q.setValueAtTime(1.4, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.015);
}

function triggerBrassClick(
  ctx: AudioContext,
  dest: AudioNode,
  noiseBuffer: AudioBuffer,
  startTime: number,
  centerFreq: number,
  qValue: number,
  duration: number,
  gainPeak: number
) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(centerFreq, startTime);
  bandpass.Q.setValueAtTime(qValue, startTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.0018);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  src.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(dest);

  const offset = Math.random() * 0.25;
  src.start(startTime, offset, duration + 0.02);
  src.stop(startTime + duration + 0.025);
}

function triggerCracklePop(
  ctx: AudioContext,
  dest: AudioNode,
  noiseBuffer: AudioBuffer,
  startTime: number,
  highFreq: number,
  midFreq: number,
  gainPeak: number
) {
  triggerBrassClick(
    ctx,
    dest,
    noiseBuffer,
    startTime,
    highFreq,
    3.6,
    0.018,
    gainPeak
  );
  triggerBrassClick(
    ctx,
    dest,
    noiseBuffer,
    startTime + 0.002,
    midFreq,
    2.1,
    0.026,
    gainPeak * 0.62
  );
}

function triggerTunerWhisp(
  ctx: AudioContext,
  dest: AudioNode,
  noiseBuffer: AudioBuffer,
  startTime: number,
  freqStart: number,
  freqEnd: number,
  duration: number,
  gainPeak: number,
  qValue = 2.6
) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freqStart, startTime);
  filter.frequency.exponentialRampToValueAtTime(
    Math.max(80, freqEnd),
    startTime + duration
  );
  filter.Q.setValueAtTime(qValue, startTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  const offset = Math.random() * 0.2;
  src.start(startTime, offset, duration + 0.02);
  src.stop(startTime + duration + 0.025);
}

function triggerGlassTap(
  ctx: AudioContext,
  dest: AudioNode,
  noiseBuffer: AudioBuffer,
  startTime: number
): void {
  // 1. Crisp fingertip/knuckle contact transient on thick glass surface
  triggerBrassClick(ctx, dest, noiseBuffer, startTime, 2150, 2.3, 0.011, 0.42);
  triggerBrassClick(
    ctx,
    dest,
    noiseBuffer,
    startTime + 0.001,
    1250,
    1.8,
    0.016,
    0.26
  );

  // 2. Primary thick glass dome/pane resonance ("コッ")
  const primaryOsc = ctx.createOscillator();
  const primaryGain = ctx.createGain();
  primaryOsc.type = 'sine';
  primaryOsc.frequency.setValueAtTime(1020, startTime);
  primaryOsc.frequency.exponentialRampToValueAtTime(925, startTime + 0.055);
  primaryGain.gain.setValueAtTime(0.0001, startTime);
  primaryGain.gain.linearRampToValueAtTime(0.46, startTime + 0.0022);
  primaryGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.062);
  primaryOsc.connect(primaryGain);
  primaryGain.connect(dest);
  primaryOsc.start(startTime);
  primaryOsc.stop(startTime + 0.075);

  // 3. Secondary stiff glass plate overtone (dry ~1.67x mode for clear glass character without chime)
  const overtoneOsc = ctx.createOscillator();
  const overtoneGain = ctx.createGain();
  overtoneOsc.type = 'sine';
  overtoneOsc.frequency.setValueAtTime(1690, startTime);
  overtoneOsc.frequency.exponentialRampToValueAtTime(1580, startTime + 0.04);
  overtoneGain.gain.setValueAtTime(0.0001, startTime);
  overtoneGain.gain.linearRampToValueAtTime(0.21, startTime + 0.0018);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.044);
  overtoneOsc.connect(overtoneGain);
  overtoneGain.connect(dest);
  overtoneOsc.start(startTime);
  overtoneOsc.stop(startTime + 0.055);

  // 4. Subtle wooden/brass bezel mount damping underneath ("ツッ")
  triggerWoodBody(ctx, dest, startTime, 235, 132, 0.036, 0.19, 480);
}

function triggerJacketOpen(
  ctx: AudioContext,
  dest: AudioNode,
  noiseBuffer: AudioBuffer,
  startTime: number
): void {
  // Tactile glass + brass shutter unlatch when zooming into the CRT jacket window
  triggerWoodBody(ctx, dest, startTime, 175, 88, 0.055, 0.28, 460);
  triggerBrassClick(ctx, dest, noiseBuffer, startTime, 1950, 2.5, 0.016, 0.3);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(760, startTime + 0.008);
  osc.frequency.exponentialRampToValueAtTime(1040, startTime + 0.068);
  gain.gain.setValueAtTime(0.0001, startTime + 0.008);
  gain.gain.linearRampToValueAtTime(0.24, startTime + 0.014);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.078);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(startTime + 0.008);
  osc.stop(startTime + 0.09);
}

function triggerParchmentPageTurn(
  ctx: AudioContext,
  dest: AudioNode,
  noiseBuffer: AudioBuffer,
  startTime: number
): void {
  // Soft leather tome tap + warm crisp parchment paper brush
  triggerWoodBody(ctx, dest, startTime, 142, 74, 0.048, 0.24, 380);
  triggerTunerWhisp(
    ctx,
    dest,
    noiseBuffer,
    startTime + 0.006,
    1800,
    3100,
    0.072,
    0.16,
    1.2
  );
  triggerBrassClick(
    ctx,
    dest,
    noiseBuffer,
    startTime + 0.012,
    2400,
    2.2,
    0.014,
    0.14
  );
}

function triggerAntiqueUiClick(
  ctx: AudioContext,
  dest: AudioNode,
  noiseBuffer: AudioBuffer,
  startTime: number
): void {
  // Delicate brass clasp / antique fountain-pen detent click
  triggerWoodBody(ctx, dest, startTime, 165, 84, 0.038, 0.24, 420);
  triggerBrassClick(ctx, dest, noiseBuffer, startTime, 2350, 2.8, 0.014, 0.28);
  triggerBrassClick(
    ctx,
    dest,
    noiseBuffer,
    startTime + 0.014,
    3150,
    3.2,
    0.011,
    0.12
  );
}

function triggerScholarChime(
  ctx: AudioContext,
  dest: AudioNode,
  noiseBuffer: AudioBuffer,
  startTime: number
): void {
  // Subtle parchment-desk tap followed by a warm antique brass/celesta two-note fifth (A4 -> E5)
  triggerBrassClick(ctx, dest, noiseBuffer, startTime, 2100, 2.6, 0.012, 0.16);

  const playNote = (freq: number, at: number, dur: number, vol: number) => {
    const osc = ctx.createOscillator();
    const harm = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, at);
    harm.type = 'triangle';
    harm.frequency.setValueAtTime(freq * 2, at);

    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.18, at);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, at);

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(vol, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);

    osc.connect(filter);
    harm.connect(harmGain);
    harmGain.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(at);
    harm.start(at);
    osc.stop(at + dur + 0.02);
    harm.stop(at + dur + 0.02);
  };

  playNote(440, startTime + 0.004, 0.22, 0.28);
  playNote(659.25, startTime + 0.075, 0.29, 0.32);
}

function triggerWoodDullThud(
  ctx: AudioContext,
  dest: AudioNode,
  noiseBuffer: AudioBuffer,
  startTime: number
): void {
  // Soft damped walnut desk thud + muted felt tap (gentle, non-jarring)
  triggerWoodBody(ctx, dest, startTime, 152, 84, 0.085, 0.34, 340);
  triggerWoodBody(ctx, dest, startTime + 0.068, 124, 68, 0.095, 0.26, 280);
  triggerBrassClick(ctx, dest, noiseBuffer, startTime, 820, 1.5, 0.018, 0.16);
}

function playDialSnapClip(ctx: AudioContext, startTime: number): void {
  if (activeDialSource) {
    try {
      activeDialSource.stop();
      activeDialSource.disconnect();
    } catch {
      // Already stopped
    }
    activeDialSource = null;
  }
  if (activeDialAudio) {
    try {
      activeDialAudio.pause();
      activeDialAudio.currentTime = 0;
    } catch {
      // Ignore cleanup errors
    }
    activeDialAudio = null;
  }

  const startBuffer = (buf: AudioBuffer, scheduledAt: number) => {
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.92, scheduledAt);

    src.connect(gain);
    gain.connect(ctx.destination);

    activeDialSource = src;
    src.onended = () => {
      if (activeDialSource === src) {
        activeDialSource = null;
      }
      try {
        gain.disconnect();
      } catch {
        // Ignore disconnect cleanup
      }
    };
    src.start(scheduledAt);
  };

  if (decodedDialBuffer && decodedDialBuffer.sampleRate === ctx.sampleRate) {
    startBuffer(decodedDialBuffer, startTime);
    return;
  }

  getDecodedDialBuffer(ctx).then((decoded) => {
    if (decoded) {
      startBuffer(decoded, Math.max(ctx.currentTime + 0.002, startTime));
      return;
    }
    const el = new Audio(DIAL_SFX_URL);
    el.volume = 0.85;
    activeDialAudio = el;
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  });
}

export function playRadioPowerOnSfx(): number {
  const noiseDurationSec = rollPowerOnNoiseDurationSec();
  if (!buttonSfxEnabled) {
    return 0;
  }
  playRadioButtonSfxWithPowerDuration('power_on', noiseDurationSec);
  return Math.round((SWITCH_CLICK_LEAD_SEC + noiseDurationSec) * 1000);
}

export function playRadioButtonSfx(kind: RadioSfxKind): void {
  playRadioButtonSfxWithPowerDuration(
    kind,
    kind === 'power_on' ? rollPowerOnNoiseDurationSec() : DEFAULT_SCRATCH_NOISE_DURATION_SEC
  );
}

function playRadioButtonSfxWithPowerDuration(
  kind: RadioSfxKind,
  powerOnNoiseDurationSec: number
): void {
  try {
    // Button sound effects (prev, next, power_on, power_off) are muted when the SFX dial is OFF.
    // The dial toggle itself always plays the extracted mechanical latch clip when switched.
    if (kind !== 'dial' && !buttonSfxEnabled) {
      if (kind === 'power_off') {
        stopActivePowerOnNoise();
      }
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.002;

    if (kind === 'dial') {
      playDialSnapClip(ctx, now);
      return;
    }

    const noiseBuffer = getNoiseBuffer(ctx);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.5, now);
    master.connect(ctx.destination);

    if (kind === 'glass_tap') {
      master.gain.setValueAtTime(0.62, now);
      triggerGlassTap(ctx, master, noiseBuffer, now);
      return;
    }

    if (kind === 'jacket_open') {
      master.gain.setValueAtTime(0.55, now);
      triggerJacketOpen(ctx, master, noiseBuffer, now);
      return;
    }

    if (kind === 'ui_page') {
      master.gain.setValueAtTime(0.54, now);
      triggerParchmentPageTurn(ctx, master, noiseBuffer, now);
      return;
    }

    if (kind === 'ui_click') {
      master.gain.setValueAtTime(0.48, now);
      triggerAntiqueUiClick(ctx, master, noiseBuffer, now);
      return;
    }

    if (kind === 'quiz_correct') {
      master.gain.setValueAtTime(0.46, now);
      triggerScholarChime(ctx, master, noiseBuffer, now);
      return;
    }

    if (kind === 'quiz_wrong') {
      master.gain.setValueAtTime(0.52, now);
      triggerWoodDullThud(ctx, master, noiseBuffer, now);
      return;
    }

    if (kind === 'prev' || kind === 'next') {
      const isNext = kind === 'next';
      triggerBrassClick(
        ctx,
        master,
        noiseBuffer,
        now,
        isNext ? 2550 : 2150,
        2.2,
        0.024,
        0.34
      );
      triggerWoodBody(
        ctx,
        master,
        now,
        isNext ? 158 : 138,
        isNext ? 76 : 66,
        0.062,
        0.28
      );
      triggerBrassClick(
        ctx,
        master,
        noiseBuffer,
        now + 0.022,
        isNext ? 3200 : 2700,
        3.0,
        0.018,
        0.16
      );
      triggerTunerWhisp(
        ctx,
        master,
        noiseBuffer,
        now + 0.014,
        isNext ? 1100 : 1750,
        isNext ? 1850 : 1050,
        0.075,
        0.075
      );
      return;
    }

    if (kind === 'power_on') {
      // 1. Vintage switch clack ("カチャッ")
      triggerWoodBody(ctx, master, now, 132, 58, 0.075, 0.36);
      triggerBrassClick(ctx, master, noiseBuffer, now, 2050, 2.0, 0.024, 0.34);
      triggerBrassClick(
        ctx,
        master,
        noiseBuffer,
        now + 0.022,
        2850,
        2.6,
        0.022,
        0.26
      );

      // 2. Immediately follow with 1s (90%), 3s (5%), or 5s (5%) of randomly chosen Noise 3 or Noise 4 radio scratch clip
      playPowerOnScratchNoise(ctx, now, powerOnNoiseDurationSec);
      return;
    }

    // power_off: cancel any active warm-up noise, then play "プスッ..." tube shutoff sound
    stopActivePowerOnNoise();

    // 1. Switch release snap
    triggerWoodBody(ctx, master, now, 126, 48, 0.075, 0.34);
    triggerBrassClick(ctx, master, noiseBuffer, now, 1750, 2.2, 0.022, 0.28);

    // 2. "プ" — soft warm pneumatic/capacitor thump
    triggerWoodBody(ctx, master, now + 0.022, 225, 38, 0.145, 0.38, 560);

    // 3. "スッ..." — warm analog shutoff hiss-puff sweeping down
    triggerTunerWhisp(
      ctx,
      master,
      noiseBuffer,
      now + 0.036,
      1250,
      340,
      0.165,
      0.22,
      1.3
    );
    triggerBrassClick(
      ctx,
      master,
      noiseBuffer,
      now + 0.044,
      820,
      1.6,
      0.065,
      0.24
    );

    // 4. Tiny delicate filament cool-down micro-tick
    triggerCracklePop(ctx, master, noiseBuffer, now + 0.21, 2200, 840, 0.1);
  } catch {
    // Ignore audio context restriction errors gracefully
  }
}
