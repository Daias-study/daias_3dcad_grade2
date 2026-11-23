import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import radioDialOffUrl from '../assets/images/radio_dial_off_cutout.png';
import radioDialOnUrl from '../assets/images/radio_dial_on_cutout.png';
import walnutWoodBgUrl from '../assets/images/walnut_wood_bg_1795427895086.jpg';
import zoomedJacketWideUrl from '../assets/images/zoomed_jacket_square_v2_1795428697097.jpg';
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
  hasBeenTurnedOn?: boolean;
  isSfxEnabled?: boolean;
  onToggleSfx?: () => void;
}

const RADIO_W = 1200;
const RADIO_H = 896;

interface BrassCapSpec {
  leftPx: number;
  topPx: number;
  diameterPx: number;
}

const PREV_BTN: BrassCapSpec = {
  leftPx: 567,
  topPx: 680,
  diameterPx: 55,
};

const NEXT_BTN: BrassCapSpec = {
  leftPx: 668.5,
  topPx: 680,
  diameterPx: 54,
};

const POWER_BTN: BrassCapSpec = {
  leftPx: 764.5,
  topPx: 680,
  diameterPx: 55,
};

// Cavity & control coordinates inside the dedicated 1376x768 widescreen square-jacket wooden panel
const ZOOM_WIDE_JACKET_RECT = {
  left: '38.01%',
  top: '18.23%',
  width: '23.98%',
  height: '41.93%',
} as const;

const ZOOM_WIDE_BGM_RECT = {
  left: '9.81%',
  top: '75.78%',
  width: '80.16%',
  height: '12.24%',
} as const;

const ZOOM_WIDE_CLOSE_BTN_RECT = {
  left: '81.54%',
  top: '9.64%',
  width: '12.28%',
  height: '20.57%',
} as const;

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
  hasBeenTurnedOn = true,
  isSfxEnabled = true,
  onToggleSfx,
}: AntiqueRadioPlayerProps) {
  const [isJacketZoomed, setIsJacketZoomed] = useState<boolean>(false);

  useEffect(() => {
    if (!isJacketZoomed) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isJacketZoomed]);

  const currentTrack = tracks[currentIndex] ?? tracks[0];
  const lampState: 'on' | 'off' | 'unlit' = isOn
    ? 'on'
    : hasBeenTurnedOn
      ? 'off'
      : 'unlit';

  if (!currentTrack) return null;

  const radioImageUrl = isSfxEnabled ? radioDialOnUrl : radioDialOffUrl;
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
      {/* Transparent Cutout Radio Silhouette (Swaps photorealistic ON/OFF dial images seamlessly) */}
      <div className="relative overflow-hidden select-none -mt-[3%] -mb-[9%] drop-shadow-[0_14px_26px_rgba(0,0,0,0.60)]">
        <div className="relative w-full aspect-[1200/896]">
          <img
            src={radioDialOnUrl}
            alt="アンテナ・表示窓付きアンティーク木製ラジオ"
            referrerPolicy="no-referrer"
            draggable={false}
            className="w-full h-full object-cover block pointer-events-none"
            style={{ opacity: isSfxEnabled ? 1 : 0 }}
          />
          <img
            src={radioDialOffUrl}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover block pointer-events-none"
            style={{ opacity: isSfxEnabled ? 0 : 1 }}
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

          {/* Left Album Jacket Window (Always clickable ON or pitch-black OFF; no yellow hover border) */}
          <button
            type="button"
            onClick={() => setIsJacketZoomed(true)}
            title="ラジオを拡大表示"
            aria-label="ラジオを拡大表示"
            className="absolute overflow-hidden bg-black transition-all duration-300 shadow-[inset_0_0_12px_rgba(0,0,0,0.95)] p-0 border-0 focus:outline-none cursor-pointer"
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
              <div className="w-full h-full bg-black" />
            )}
          </button>

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

          {/* SFX Toggle Dial Hit Area (Right = ON, Left = OFF — swaps entire photorealistic dial image directly with zero sink/hover animation) */}
          <button
            type="button"
            onClick={onToggleSfx}
            title={
              isSfxEnabled
                ? 'ボタン効果音 ON（クリックでOFF）'
                : 'ボタン効果音 OFF（クリックでON）'
            }
            aria-label={
              isSfxEnabled
                ? 'ボタン効果音ダイアル ON（右）'
                : 'ボタン効果音ダイアル OFF（左）'
            }
            aria-pressed={isSfxEnabled}
            className="absolute rounded-full cursor-pointer focus:outline-none bg-transparent"
            style={{
              left: '70.4%',
              top: '73.2%',
              width: '8.8%',
              height: '11.4%',
            }}
          />

          {/* Non-clickable Indicator Lamp (Pitch black initially before first power-on, Green when ON, Red when OFF afterwards) */}
          <div
            role="status"
            aria-label={
              lampState === 'on'
                ? '電源ランプ ON（緑）'
                : lampState === 'off'
                  ? '電源ランプ OFF（赤）'
                  : '電源ランプ 未点灯（黒）'
            }
            className="pointer-events-none absolute rounded-full overflow-hidden transition-all duration-300"
            style={{
              left: '82.00%',
              top: '77.01%',
              width: '2.50%',
              height: '3.57%',
              boxShadow:
                lampState === 'on'
                  ? '0 0 8px 2px rgba(34, 197, 94, 0.78), 0 0 18px 5px rgba(34, 197, 94, 0.38)'
                  : lampState === 'off'
                    ? '0 0 8px 2px rgba(239, 68, 68, 0.78), 0 0 18px 5px rgba(239, 68, 68, 0.38)'
                    : 'none',
            }}
          >
            {lampState === 'unlit' ? (
              <span
                className="absolute inset-0 rounded-full bg-black"
                style={{
                  boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 1)',
                }}
              />
            ) : (
              <>
                {/* Recolor the underlying photographic amber glass jewel naturally */}
                <span
                  className="absolute inset-0 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: lampState === 'on' ? '#22c55e' : '#ef4444',
                    mixBlendMode: 'color',
                  }}
                />
                {/* Soft inner glass glow preserving original highlight & recessed bezel rim */}
                <span
                  className="absolute inset-0 rounded-full transition-all duration-300"
                  style={{
                    background:
                      lampState === 'on'
                        ? 'radial-gradient(circle at 42% 38%, rgba(220, 252, 231, 0.68) 0%, rgba(34, 197, 94, 0.62) 55%, rgba(20, 83, 45, 0.72) 100%)'
                        : 'radial-gradient(circle at 42% 38%, rgba(254, 226, 226, 0.68) 0%, rgba(239, 68, 68, 0.65) 55%, rgba(127, 29, 29, 0.75) 100%)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.85)',
                  }}
                />
              </>
            )}
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

      {/* Fullscreen Zoomed Jacket View (16:9 Full Wooden Panel + Giant Jacket + Wide BGM Frame + Gold Fisheye X Button) */}
      {isJacketZoomed &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ジャケット拡大表示"
            onClick={() => setIsJacketZoomed(false)}
            className="fixed inset-0 z-50 bg-[#1a0f08] flex items-center justify-center overflow-hidden select-none animate-fadeIn"
          >
            {/* Full-bleed matching antique walnut wood wall filling 100% of any viewport ratio */}
            <img
              src={walnutWoodBgUrl}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              draggable={false}
              className="fixed inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Centered 16:9 Dedicated Wooden Panel (True square CRT jacket + wide BGM bezel + gold fisheye X) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-[min(100vw,calc(100vh*1376/768))] aspect-[1376/768] shadow-[0_24px_70px_rgba(0,0,0,0.85)]"
            >
              <div className="relative w-full h-full">
                <img
                  src={zoomedJacketWideUrl}
                  alt="アンティーク木製正方形ジャケット・広幅BGM表示フレーム"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="w-full h-full object-cover block pointer-events-none"
                />

                {/* Top-Right Gold-Framed Convex Fisheye X Button Hit Area */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playRadioButtonSfx('glass_tap');
                    setIsJacketZoomed(false);
                  }}
                  title="元の画面に戻る"
                  aria-label="拡大表示を閉じる"
                  className="absolute rounded-full cursor-pointer focus:outline-none bg-transparent transition hover:brightness-110 active:brightness-95"
                  style={{
                    left: ZOOM_WIDE_CLOSE_BTN_RECT.left,
                    top: ZOOM_WIDE_CLOSE_BTN_RECT.top,
                    width: ZOOM_WIDE_CLOSE_BTN_RECT.width,
                    height: ZOOM_WIDE_CLOSE_BTN_RECT.height,
                  }}
                />

                {/* Giant Album Jacket CRT Screen (Real-time track sync or pitch black when OFF) */}
                <div
                  className="absolute overflow-hidden bg-black transition-all duration-300 shadow-[inset_0_0_28px_rgba(0,0,0,0.96)]"
                  style={{
                    left: ZOOM_WIDE_JACKET_RECT.left,
                    top: ZOOM_WIDE_JACKET_RECT.top,
                    width: ZOOM_WIDE_JACKET_RECT.width,
                    height: ZOOM_WIDE_JACKET_RECT.height,
                    borderRadius: '6%',
                  }}
                >
                  {isOn ? (
                    <>
                      <img
                        src={currentTrack.coverUrl}
                        alt={currentTrack.title}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        className="w-full h-full object-cover block"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(circle at 28% 24%, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.40) 100%)',
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

                {/* Extra-Wide Antique BGM Brass Display Window (Strictly inside brass inner rim; scales cleanly without clipping) */}
                <div
                  className="absolute overflow-hidden bg-black flex items-center justify-center text-center px-[2.5%] transition-all duration-300 shadow-[inset_0_0_16px_rgba(0,0,0,0.98)]"
                  style={{
                    left: ZOOM_WIDE_BGM_RECT.left,
                    top: ZOOM_WIDE_BGM_RECT.top,
                    width: ZOOM_WIDE_BGM_RECT.width,
                    height: ZOOM_WIDE_BGM_RECT.height,
                    borderRadius: '6px',
                    containerType: 'size',
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
                      <div className="relative z-10 w-full h-full flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-[2cqh] leading-none">
                        <span
                          className="shrink-0 font-bold tracking-[0.2em] text-[#e5be67] drop-shadow-[0_0_6px_rgba(229,190,103,0.45)]"
                          style={{
                            fontSize: 'min(22cqh, 1.5cqw, 13px)',
                            lineHeight: 1.05,
                          }}
                        >
                          {showTrackNumber
                            ? customTrackName
                              ? 'BGM (任意)'
                              : `BGM ${currentIndex + 1}/${tracks.length}`
                            : 'BGM'}
                        </span>
                        <span
                          className="max-w-full truncate font-semibold tracking-wide text-[#f7ebd0] drop-shadow-[0_0_8px_rgba(247,235,208,0.3)]"
                          style={{
                            fontSize: 'min(36cqh, 2.7cqw, 21px)',
                            lineHeight: 1.15,
                          }}
                        >
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
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
