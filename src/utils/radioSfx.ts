export type RadioSfxKind = 'prev' | 'next' | 'power_on' | 'power_off';

export const RADIO_POWER_WARMUP_MS = 780;

let sharedAudioCtx: AudioContext | null = null;
let cachedNoiseBuffer: AudioBuffer | null = null;

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
  // Sharp high-frequency "パチッ" spark + warm mid-body "パ" snap
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

export function playRadioButtonSfx(kind: RadioSfxKind): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.002;
    const noiseBuffer = getNoiseBuffer(ctx);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.5, now);
    master.connect(ctx.destination);

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

      // 2. Tube warm-up crackling sequence ("パチッ パチパチパチ。。。") over ~750ms
      const crackleTimeline: Array<[number, number, number, number]> = [
        [0.09, 3150, 1080, 0.42],
        [0.205, 3650, 1280, 0.36],
        [0.295, 2550, 920, 0.44],
        [0.375, 3900, 1380, 0.34],
        [0.465, 2900, 1050, 0.38],
        [0.565, 3450, 1180, 0.25],
        [0.655, 2400, 880, 0.18],
        [0.735, 3100, 1120, 0.1],
      ];
      for (const [dt, hf, mf, amp] of crackleTimeline) {
        triggerCracklePop(ctx, master, noiseBuffer, now + dt, hf, mf, amp);
      }

      // 3. Soft rising analog tube static & warm transformer hum leading into music
      triggerTunerWhisp(
        ctx,
        master,
        noiseBuffer,
        now + 0.07,
        780,
        1550,
        0.72,
        0.08,
        1.5
      );

      const humOsc = ctx.createOscillator();
      const humGain = ctx.createGain();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(98, now + 0.05);
      humOsc.frequency.exponentialRampToValueAtTime(120, now + 0.72);
      humGain.gain.setValueAtTime(0.0001, now + 0.05);
      humGain.gain.linearRampToValueAtTime(0.048, now + 0.28);
      humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      humOsc.connect(humGain);
      humGain.connect(master);
      humOsc.start(now + 0.05);
      humOsc.stop(now + 0.82);
      return;
    }

    // power_off: Vintage toggle release + cozy "プスッ..." tube shutoff puff & capacitor drop
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
