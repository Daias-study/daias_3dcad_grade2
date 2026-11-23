import radioImageUrl from '../assets/images/antique_wooden_radio_v2_cutout.png';
import type { BgmTrack } from '../types/quiz';
import { playRadioButtonSfx } from '../utils/radioSfx';

interface AntiqueRadioPlayerProps {
  tracks: BgmTrack[];
  currentIndex: number;
  isOn: boolean;
  needsGesture: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePower: () => void;
  onUnlockAudio: () => void;
  customTrackName?: string | null;
  showTrackNumber?: boolean;
}

const RADIO_W = 1200;
const RADIO_H = 896;

interface BrassCapSpec {
  leftPx: number;
  topPx: number;
  diameterPx: number;
}

const PREV_BTN: BrassCapSpec = {
  leftPx: 599,
  topPx: 674.5,
  diameterPx: 61,
};

const NEXT_BTN: BrassCapSpec = {
  leftPx: 718.5,
  topPx: 675,
  diameterPx: 61,
};

const POWER_BTN: BrassCapSpec = {
  leftPx: 842.5,
  topPx: 675,
  diameterPx: 61,
};

function getSocketStyle(spec: BrassCapSpec) {
  const leftPct = (spec.leftPx / RADIO_W) * 100;
  const topPct = (spec.topPx / RADIO_H) * 100;
  const widthPct = (spec.diameterPx / RADIO_W) * 100;
  const heightPct = (spec.diameterPx / RADIO_H) * 100;

  return {
    socket: {
      left: `${leftPct}%`,
      top: `${topPct}%`,
      width: `${widthPct}%`,
      height: `${heightPct}%`,
    },
    capImg: {
      width: `${(100 / widthPct) * 100}%`,
      height: `${(100 / heightPct) * 100}%`,
      left: `${(-leftPct / widthPct) * 100}%`,
      top: `${(-topPct / heightPct) * 100}%`,
      maxWidth: 'none' as const,
    },
  };
}

export function AntiqueRadioPlayer({
  tracks,
  currentIndex,
  isOn,
  needsGesture,
  onPrev,
  onNext,
  onTogglePower,
  onUnlockAudio,
  customTrackName,
  showTrackNumber = false,
}: AntiqueRadioPlayerProps) {
  const currentTrack = tracks[currentIndex] ?? tracks[0];

  if (!currentTrack) return null;

  const displayTrackLabel = customTrackName
    ? customTrackName
    : `${currentTrack.title} — ${currentTrack.subtitle}`;

  const prevLayout = getSocketStyle(PREV_BTN);
  const nextLayout = getSocketStyle(NEXT_BTN);
  const powerLayout = getSocketStyle(POWER_BTN);

  const handlePrevClick = () => {
    playRadioButtonSfx('prev');
    onPrev();
  };

  const handleNextClick = () => {
    playRadioButtonSfx('next');
    onNext();
  };

  const handlePowerClick = () => {
    onTogglePower();
  };

  return (
    <div className="max-w-lg mx-auto w-full">
      {/* Transparent Cutout Radio Silhouette (Background shows directly behind radio & antenna) */}
      <div className="relative overflow-hidden select-none -mt-[3%] -mb-[9%] drop-shadow-[0_14px_26px_rgba(0,0,0,0.60)]">
        <div className="relative w-full aspect-[1200/896]">
          <img
            src={radioImageUrl}
            alt="アンテナ・表示窓付きアンティーク木製ラジオ"
            referrerPolicy="no-referrer"
            draggable={false}
            className="w-full h-full object-cover block pointer-events-none"
          />

          {/* Upper BGM Track Info Display Window */}
          <div
            className="absolute overflow-hidden bg-black flex flex-col items-center justify-center text-center px-2.5 transition-all duration-300 shadow-[inset_0_0_12px_rgba(0,0,0,0.98)]"
            style={{
              left: '15.83%',
              top: '31.92%',
              width: '68.42%',
              height: '8.26%',
              borderRadius: '6px',
            }}
          >
            {isOn ? (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 50%, rgba(56, 38, 18, 0.92) 0%, rgba(20, 14, 9, 0.98) 72%, rgba(8, 5, 3, 1) 100%)',
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,236,179,0.10) 0%, rgba(255,236,179,0) 45%, rgba(0,0,0,0.35) 100%)',
                  }}
                />
                <div className="relative z-10 w-full flex flex-col items-center justify-center leading-none">
                  <span className="text-[7px] sm:text-[9px] font-bold tracking-[0.18em] text-[#e5be67] drop-shadow-[0_0_6px_rgba(229,190,103,0.45)]">
                    {showTrackNumber
                      ? customTrackName
                        ? 'BGM (任意)'
                        : `BGM ${currentIndex + 1}/${tracks.length}`
                      : 'BGM'}
                  </span>
                  <span className="mt-0.5 w-full truncate text-[8.5px] sm:text-[11px] font-semibold tracking-wide text-[#f7ebd0] drop-shadow-[0_0_8px_rgba(247,235,208,0.3)]">
                    {displayTrackLabel}
                  </span>
                </div>
              </>
            ) : (
              <div
                aria-label="ラジオ表示窓 OFF（消灯）"
                className="w-full h-full bg-black"
              />
            )}
          </div>

          {/* Left Album Jacket Window (Turns pitch black when OFF) */}
          <div
            className="absolute overflow-hidden bg-black transition-all duration-300 shadow-[inset_0_0_12px_rgba(0,0,0,0.95)]"
            style={{
              left: '17.88%',
              top: '49.67%',
              width: '21.17%',
              height: '26.79%',
              borderRadius: '7%',
            }}
          >
            {isOn ? (
              <>
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="w-full h-full object-cover block transition-opacity duration-300 opacity-100"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 28% 24%, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.38) 100%)',
                  }}
                />
              </>
            ) : (
              <div
                aria-label="ラジオ電源OFF（消灯）"
                className="w-full h-full bg-black"
              />
            )}
          </div>

          {/* Previous Track Button (|<) — 3D Mechanical Brass Cap Cutout */}
          <button
            type="button"
            onClick={handlePrevClick}
            title="前のBGMへ"
            aria-label="前のBGMへ"
            className="group absolute rounded-full cursor-pointer focus:outline-none"
            style={prevLayout.socket}
          >
            <span className="absolute -inset-2 rounded-full" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[#090603] shadow-[inset_0_5px_10px_rgba(0,0,0,0.98)]" />
            <span className="pointer-events-none relative block w-full h-full rounded-full overflow-hidden transition-all duration-150 ease-out shadow-[0_3px_5px_rgba(0,0,0,0.85)] group-hover:translate-y-[2px] group-hover:scale-[0.94] group-hover:shadow-[0_1.5px_3px_rgba(0,0,0,0.8)] group-active:translate-y-[4.5px] group-active:scale-[0.86] group-active:shadow-none">
              <img
                src={radioImageUrl}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                draggable={false}
                className="absolute block pointer-events-none"
                style={prevLayout.capImg}
              />
            </span>
          </button>

          {/* Next Track Button (>|) — 3D Mechanical Brass Cap Cutout */}
          <button
            type="button"
            onClick={handleNextClick}
            title="次のBGMへ"
            aria-label="次のBGMへ"
            className="group absolute rounded-full cursor-pointer focus:outline-none"
            style={nextLayout.socket}
          >
            <span className="absolute -inset-2 rounded-full" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[#090603] shadow-[inset_0_5px_10px_rgba(0,0,0,0.98)]" />
            <span className="pointer-events-none relative block w-full h-full rounded-full overflow-hidden transition-all duration-150 ease-out shadow-[0_3px_5px_rgba(0,0,0,0.85)] group-hover:translate-y-[2px] group-hover:scale-[0.94] group-hover:shadow-[0_1.5px_3px_rgba(0,0,0,0.8)] group-active:translate-y-[4.5px] group-active:scale-[0.86] group-active:shadow-none">
              <img
                src={radioImageUrl}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                draggable={false}
                className="absolute block pointer-events-none"
                style={nextLayout.capImg}
              />
            </span>
          </button>

          {/* Power / Mute Toggle Button — 3D Mechanical Brass Cap Cutout */}
          <button
            type="button"
            onClick={handlePowerClick}
            title={isOn ? '電源OFF（ミュート）' : '電源ON（ミュート解除・再生）'}
            aria-label={isOn ? '電源OFF（ミュート）' : '電源ON（ミュート解除・再生）'}
            className="group absolute rounded-full cursor-pointer focus:outline-none"
            style={powerLayout.socket}
          >
            <span className="absolute -inset-2 rounded-full" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[#090603] shadow-[inset_0_5px_10px_rgba(0,0,0,0.98)]" />
            <span className="pointer-events-none relative block w-full h-full rounded-full overflow-hidden transition-all duration-150 ease-out shadow-[0_3px_5px_rgba(0,0,0,0.85)] group-hover:translate-y-[2px] group-hover:scale-[0.94] group-hover:shadow-[0_1.5px_3px_rgba(0,0,0,0.8)] group-active:translate-y-[4.5px] group-active:scale-[0.86] group-active:shadow-none">
              <img
                src={radioImageUrl}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                draggable={false}
                className="absolute block pointer-events-none"
                style={powerLayout.capImg}
              />
            </span>
          </button>

          {/* Non-clickable Indicator Lamp (Green when ON, Red when OFF — fitted flush inside brass bezel) */}
          <div
            role="status"
            aria-label={isOn ? '電源ランプ ON（緑）' : '電源ランプ OFF（赤）'}
            className="pointer-events-none absolute rounded-full overflow-hidden"
            style={{
              left: '80.54%',
              top: '76.51%',
              width: '2.83%',
              height: '3.79%',
              boxShadow: isOn
                ? '0 0 8px 2px rgba(34, 197, 94, 0.78), 0 0 18px 5px rgba(34, 197, 94, 0.38)'
                : '0 0 8px 2px rgba(239, 68, 68, 0.78), 0 0 18px 5px rgba(239, 68, 68, 0.38)',
            }}
          >
            {/* Recolor the underlying photographic amber glass jewel naturally */}
            <span
              className="absolute inset-0 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: isOn ? '#22c55e' : '#ef4444',
                mixBlendMode: 'color',
              }}
            />
            {/* Soft inner glass glow preserving original highlight & recessed bezel rim */}
            <span
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                background: isOn
                  ? 'radial-gradient(circle at 42% 38%, rgba(220, 252, 231, 0.68) 0%, rgba(34, 197, 94, 0.62) 55%, rgba(20, 83, 45, 0.72) 100%)'
                  : 'radial-gradient(circle at 42% 38%, rgba(254, 226, 226, 0.68) 0%, rgba(239, 68, 68, 0.65) 55%, rgba(127, 29, 29, 0.75) 100%)',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.85)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Autoplay Gesture Unlock Prompt (only shown if browser blocks initial autoplay) */}
      {isOn && needsGesture && (
        <div className="mt-2 flex items-center justify-center">
          <button
            type="button"
            onClick={onUnlockAudio}
            className="px-3.5 py-1.5 rounded-md bg-[#3a1c24]/90 hover:bg-[#522531] text-[#f3e5ab] border border-[#d4af37]/70 text-xs font-bold transition cursor-pointer animate-pulse shadow-lg"
          >
            🔊 クリックして音を鳴らす
          </button>
        </div>
      )}
    </div>
  );
}
