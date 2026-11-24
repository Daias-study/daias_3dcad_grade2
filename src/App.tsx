import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AntiqueRadioPlayer } from './components/AntiqueRadioPlayer';
import { DiagramViewer } from './components/DiagramViewer';
import { LearningAnalyticsView } from './components/LearningAnalyticsView';
import { RandomQuizSetupView } from './components/RandomQuizSetupView';
import { bgmTracks } from './data/bgmTracks';
import { darkAcademiaLibraryScenes } from './data/libraryScenes';
import { quizDatasets } from './data/quizDatasets';
import type { QuizDataset, QuizQuestion, UserAnswer } from './types/quiz';
import {
  ALL_STUDY_GENRES,
  buildLearningAnalytics,
  classifyQuestionGenre,
  clearStudyHistory,
  loadStudyHistory,
  saveStudyHistory,
  type StudyAttemptRecord,
} from './utils/analyticsUtils';
import {
  isQuestionCorrect,
  isSingleBlankCorrect,
} from './utils/answerUtils';
import { downloadStandaloneBackupHtml } from './utils/exportStandaloneHtml';
import {
  playRadioButtonSfx,
  playRadioPowerOnSfx,
  setRadioButtonSfxEnabled,
  stopActivePowerOnNoise,
} from './utils/radioSfx';
import {
  generateRandomQuizDataset,
  type RandomQuizConfig,
} from './utils/randomQuizUtils';
import {
  buildBackupFileName,
  exportTransferToBackupFileContent,
  exportTransferToBase64Url,
  getQuestionKey,
  importTransferFromBase64Url,
  importTransferFromFile,
  mergeReviewQuestions,
  mergeStudyHistory,
  type ImportedTransferData,
} from './utils/transferUtils';

type ViewMode =
  | 'home'
  | 'quiz'
  | 'result'
  | 'transfer'
  | 'analytics'
  | 'random_setup';

const SCROLL_NUMBERS = ['壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖', '拾'];
const REVIEW_STORAGE_KEY = 'daia_3dcad_review_questions_v1';
const REVIEW_DATASET_ID = 'review_wrong_questions';

function formatCountdownMmSs(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function loadStoredReviewQuestions(): QuizQuestion[] {
  try {
    const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredReviewQuestions(list: QuizQuestion[]): void {
  try {
    window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function getRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function isSameOrder(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function createShuffledTrackOrder(
  length: number,
  avoidFirstIndex?: number,
  avoidSameOrder?: number[]
): number[] {
  if (length <= 1) return length === 1 ? [0] : [];

  const identity = Array.from({ length }, (_, i) => i);
  for (let attempt = 0; attempt < 24; attempt++) {
    const order = [...identity];
    for (let i = order.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (avoidFirstIndex !== undefined && order[0] === avoidFirstIndex) {
      continue;
    }
    if (avoidSameOrder && isSameOrder(order, avoidSameOrder)) {
      continue;
    }
    return order;
  }

  // Deterministic fallback guaranteed to satisfy constraints for length >= 3
  const fallback = [...identity];
  if (avoidFirstIndex !== undefined && fallback[0] === avoidFirstIndex) {
    [fallback[0], fallback[1]] = [fallback[1], fallback[0]];
  }
  if (avoidSameOrder && isSameOrder(fallback, avoidSameOrder)) {
    [fallback[fallback.length - 2], fallback[fallback.length - 1]] = [
      fallback[fallback.length - 1],
      fallback[fallback.length - 2],
    ];
  }
  return fallback;
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [currentDataset, setCurrentDataset] = useState<QuizDataset | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [reviewQuestions, setReviewQuestions] = useState<QuizQuestion[]>(() =>
    loadStoredReviewQuestions()
  );
  const [studyHistory, setStudyHistory] = useState<StudyAttemptRecord[]>(() =>
    loadStudyHistory()
  );
  const [randomQuizConfig, setRandomQuizConfig] = useState<RandomQuizConfig>(
    () => ({
      orderMode: 'random',
      questionCount: 10,
      timeLimitMinutes: 0,
      targetScope: 'all',
      selectedGenres: [...ALL_STUDY_GENRES],
    })
  );
  const [activeRandomConfig, setActiveRandomConfig] =
    useState<RandomQuizConfig | null>(null);
  const [quizTimeLimitSec, setQuizTimeLimitSec] = useState<number | null>(null);
  const [quizRemainingSec, setQuizRemainingSec] = useState<number | null>(null);
  const [quizTimedOut, setQuizTimedOut] = useState<boolean>(false);

  const [fillDraft, setFillDraft] = useState<string>('');
  const [multiFillDrafts, setMultiFillDrafts] = useState<string[]>([]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [sceneIndex, setSceneIndex] = useState<number>(0);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [testQuestionLimit, setTestQuestionLimit] = useState<number | null>(
    null
  );
  const [jumpDraft, setJumpDraft] = useState<string>('1');
  const [totalDraft, setTotalDraft] = useState<string>('1');
  const [showSecretInput, setShowSecretInput] = useState<boolean>(false);
  const [secretDraft, setSecretDraft] = useState<string>('');
  const [transferImportDraft, setTransferImportDraft] = useState<string>('');
  const [confirmResetData, setConfirmResetData] = useState<boolean>(false);
  const [showSceneMenu, setShowSceneMenu] = useState<boolean>(false);
  const [showBgmMenu, setShowBgmMenu] = useState<boolean>(false);
  const [customVideo, setCustomVideo] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [customBgm, setCustomBgm] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [bgmPlayback, setBgmPlayback] = useState<{
    order: number[];
    pos: number;
  }>(() => ({
    order: createShuffledTrackOrder(
      bgmTracks.length,
      undefined,
      bgmTracks.map((_, i) => i)
    ),
    pos: 0,
  }));
  const [isRadioOn, setIsRadioOn] = useState<boolean>(false);
  const [hasRadioBeenActivated, setHasRadioBeenActivated] =
    useState<boolean>(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState<boolean>(true);
  const [isRadioWarmingUp, setIsRadioWarmingUp] = useState<boolean>(false);
  const [isRadioPoweringOff, setIsRadioPoweringOff] = useState<boolean>(false);
  const [bgmNeedsGesture, setBgmNeedsGesture] = useState<boolean>(false);

  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastBgIndexRef = useRef<number>(-1);
  const customVideoUrlRef = useRef<string | null>(null);
  const customBgmUrlRef = useRef<string | null>(null);
  const powerWarmupTimerRef = useRef<number | null>(null);
  const powerOffTimerRef = useRef<number | null>(null);
  const volumeFadeRafRef = useRef<number | null>(null);
  const sceneMenuRef = useRef<HTMLDivElement | null>(null);
  const bgmMenuRef = useRef<HTMLDivElement | null>(null);
  const customVideoInputRef = useRef<HTMLInputElement | null>(null);
  const customBgmInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const jumpTimerRef = useRef<number | null>(null);
  const totalTimerRef = useRef<number | null>(null);
  const editingJumpRef = useRef<boolean>(false);
  const editingTotalRef = useRef<boolean>(false);
  const fillInputRef = useRef<HTMLInputElement | null>(null);
  const transferFileOverwriteRef = useRef<HTMLInputElement | null>(null);
  const transferFileMergeRef = useRef<HTMLInputElement | null>(null);
  const multiInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const secretInputRef = useRef<HTMLInputElement | null>(null);
  const keyBufferRef = useRef<string>('');
  const questionShownAtRef = useRef<number>(Date.now());

  const changeRandomLibraryBackground = useCallback(() => {
    let nextIndex: number;
    do {
      nextIndex = Math.floor(
        Math.random() * darkAcademiaLibraryScenes.length
      );
    } while (
      nextIndex === lastBgIndexRef.current &&
      darkAcademiaLibraryScenes.length > 1
    );

    lastBgIndexRef.current = nextIndex;
    setSceneIndex(nextIndex);
  }, []);

  const clearCustomVideo = useCallback(() => {
    if (customVideoUrlRef.current) {
      URL.revokeObjectURL(customVideoUrlRef.current);
      customVideoUrlRef.current = null;
    }
    setCustomVideo(null);
  }, []);

  const selectSceneByIndex = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= darkAcademiaLibraryScenes.length) return;
      playRadioButtonSfx('ui_click');
      clearCustomVideo();
      lastBgIndexRef.current = idx;
      setSceneIndex(idx);
      setShowSceneMenu(false);
    },
    [clearCustomVideo]
  );

  const playCustomVideoFile = useCallback((file: File) => {
    playRadioButtonSfx('ui_click');
    if (customVideoUrlRef.current) {
      URL.revokeObjectURL(customVideoUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    customVideoUrlRef.current = objectUrl;
    setCustomVideo({ name: file.name, url: objectUrl });
    setShowSceneMenu(false);
  }, []);

  const activeTrackOriginalIndex =
    bgmPlayback.order[bgmPlayback.pos] ?? 0;
  const activeBgmTrack = bgmTracks[activeTrackOriginalIndex] ?? bgmTracks[0];
  const activeBgmUrl =
    isTestMode && customBgm ? customBgm.url : activeBgmTrack?.audioUrl;
  const activeBgmName =
    isTestMode && customBgm ? customBgm.name : activeBgmTrack?.title;

  const clearCustomBgm = useCallback(() => {
    if (customBgmUrlRef.current) {
      URL.revokeObjectURL(customBgmUrlRef.current);
      customBgmUrlRef.current = null;
    }
    setCustomBgm(null);
  }, []);

  const selectBgmByIndex = useCallback(
    (trackIdx: number) => {
      if (trackIdx < 0 || trackIdx >= bgmTracks.length) return;
      playRadioButtonSfx('ui_click');
      clearCustomBgm();
      setBgmPlayback((prev) => {
        const foundPos = prev.order.indexOf(trackIdx);
        if (foundPos !== -1) {
          return { ...prev, pos: foundPos };
        }
        return prev;
      });
      setIsRadioOn(true);
      setHasRadioBeenActivated(true);
      setShowBgmMenu(false);
    },
    [clearCustomBgm]
  );

  const playCustomBgmFile = useCallback((file: File) => {
    if (customBgmUrlRef.current) {
      URL.revokeObjectURL(customBgmUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    customBgmUrlRef.current = objectUrl;
    setCustomBgm({ name: file.name, url: objectUrl });
    setIsRadioOn(true);
    setHasRadioBeenActivated(true);
    setShowBgmMenu(false);
  }, []);

  const handlePrevBgm = useCallback(() => {
    clearCustomBgm();
    setBgmPlayback((prev) => ({
      ...prev,
      pos: (prev.pos - 1 + prev.order.length) % prev.order.length,
    }));
  }, [clearCustomBgm]);

  const handleNextBgm = useCallback(() => {
    clearCustomBgm();
    setBgmPlayback((prev) => {
      const nextPos = prev.pos + 1;
      if (nextPos < prev.order.length) {
        return { ...prev, pos: nextPos };
      }
      const lastTrackIdx = prev.order[prev.pos];
      return {
        order: createShuffledTrackOrder(
          bgmTracks.length,
          lastTrackIdx,
          prev.order
        ),
        pos: 0,
      };
    });
  }, [clearCustomBgm]);

  const cancelPowerTimersAndFade = useCallback(() => {
    if (powerWarmupTimerRef.current !== null) {
      window.clearTimeout(powerWarmupTimerRef.current);
      powerWarmupTimerRef.current = null;
    }
    if (powerOffTimerRef.current !== null) {
      window.clearTimeout(powerOffTimerRef.current);
      powerOffTimerRef.current = null;
    }
    if (volumeFadeRafRef.current !== null) {
      window.cancelAnimationFrame(volumeFadeRafRef.current);
      volumeFadeRafRef.current = null;
    }
  }, []);

  const fadeAudioVolume = useCallback(
    (
      audio: HTMLAudioElement,
      fromVol: number,
      toVol: number,
      durationMs: number,
      onDone?: () => void
    ) => {
      if (volumeFadeRafRef.current !== null) {
        window.cancelAnimationFrame(volumeFadeRafRef.current);
        volumeFadeRafRef.current = null;
      }
      const startTime = performance.now();
      audio.volume = Math.max(0, Math.min(1, fromVol));

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / Math.max(1, durationMs));
        const eased = 1 - Math.pow(1 - progress, 2);
        audio.volume = Math.max(
          0,
          Math.min(1, fromVol + (toVol - fromVol) * eased)
        );
        if (progress < 1) {
          volumeFadeRafRef.current = window.requestAnimationFrame(step);
        } else {
          volumeFadeRafRef.current = null;
          onDone?.();
        }
      };

      volumeFadeRafRef.current = window.requestAnimationFrame(step);
    },
    []
  );

  const handleToggleSfxDial = useCallback(() => {
    const next = !isSfxEnabled;
    setRadioButtonSfxEnabled(next);
    setIsSfxEnabled(next);
    playRadioButtonSfx('dial');
  }, [isSfxEnabled]);

  const handleToggleRadioPower = useCallback(() => {
    const audio = bgmAudioRef.current;

    if (isRadioOn && !isRadioPoweringOff) {
      // Turning OFF: play vintage "プスッ..." sound when SFX enabled, then cut power
      cancelPowerTimersAndFade();
      setIsRadioWarmingUp(false);
      setBgmNeedsGesture(false);
      playRadioButtonSfx('power_off');

      if (!isSfxEnabled) {
        if (audio) {
          audio.muted = true;
          audio.pause();
        }
        setIsRadioPoweringOff(false);
        setIsRadioOn(false);
        return;
      }

      setIsRadioPoweringOff(true);
      if (audio && !audio.paused) {
        fadeAudioVolume(audio, audio.volume, 0, 100, () => {
          audio.muted = true;
          audio.pause();
        });
      } else if (audio) {
        audio.muted = true;
        audio.pause();
      }

      powerOffTimerRef.current = window.setTimeout(() => {
        powerOffTimerRef.current = null;
        setIsRadioPoweringOff(false);
        setIsRadioOn(false);
      }, 220);
      return;
    }

    // Turning ON: play switch click + Noise 3/4 crackle (1s 86%, 3s 5%, 5s 5%, 10s 2%, 20s 2%) when SFX enabled, otherwise start immediately
    cancelPowerTimersAndFade();
    setIsRadioPoweringOff(false);
    setIsRadioOn(true);
    setHasRadioBeenActivated(true);
    const warmupMs = playRadioPowerOnSfx();

    if (!isSfxEnabled || warmupMs <= 0) {
      setIsRadioWarmingUp(false);
      if (audio) {
        audio.muted = false;
        audio.volume = 0.45;
        const p = audio.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => setBgmNeedsGesture(true));
        }
      }
      return;
    }

    setIsRadioWarmingUp(true);

    if (audio) {
      // Keep audio unlocked inside the user click gesture while muted during tube warm-up
      audio.muted = true;
      audio.volume = 0;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    }

    powerWarmupTimerRef.current = window.setTimeout(() => {
      powerWarmupTimerRef.current = null;
      setIsRadioWarmingUp(false);
    }, warmupMs);
  }, [
    isRadioOn,
    isRadioPoweringOff,
    isSfxEnabled,
    cancelPowerTimersAndFade,
    fadeAudioVolume,
  ]);

  const handleUnlockBgmAudio = useCallback(() => {
    const audio = bgmAudioRef.current;
    if (!audio || !isRadioOn || isRadioWarmingUp || isRadioPoweringOff) return;
    audio.muted = false;
    audio.volume = 0.45;
    audio
      .play()
      .then(() => setBgmNeedsGesture(false))
      .catch(() => setBgmNeedsGesture(true));
  }, [isRadioOn, isRadioWarmingUp, isRadioPoweringOff]);

  useEffect(() => {
    const audio = bgmAudioRef.current;
    if (!audio) return;

    if (!isRadioOn) {
      audio.muted = true;
      audio.pause();
      setBgmNeedsGesture(false);
      return;
    }

    if (isRadioPoweringOff || isRadioWarmingUp) {
      return;
    }

    audio.muted = false;
    let cancelled = false;

    const tryPlay = () => {
      const p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          if (!cancelled) {
            setBgmNeedsGesture(false);
            if (audio.volume < 0.44) {
              fadeAudioVolume(audio, Math.max(0.06, audio.volume), 0.45, 280);
            } else {
              audio.volume = 0.45;
            }
          }
        }).catch(() => {
          if (!cancelled) setBgmNeedsGesture(true);
        });
      }
    };

    tryPlay();

    const onFirstGesture = () => {
      if (!cancelled && isRadioOn && !isRadioWarmingUp && !isRadioPoweringOff) {
        tryPlay();
      }
    };
    document.addEventListener('pointerdown', onFirstGesture, { once: true });
    document.addEventListener('keydown', onFirstGesture, { once: true });

    return () => {
      cancelled = true;
      document.removeEventListener('pointerdown', onFirstGesture);
      document.removeEventListener('keydown', onFirstGesture);
    };
  }, [
    activeBgmUrl,
    isRadioOn,
    isRadioWarmingUp,
    isRadioPoweringOff,
    fadeAudioVolume,
  ]);

  useEffect(() => {
    changeRandomLibraryBackground();
  }, [changeRandomLibraryBackground]);

  useEffect(() => {
    return () => {
      cancelPowerTimersAndFade();
      stopActivePowerOnNoise();
      if (customVideoUrlRef.current) {
        URL.revokeObjectURL(customVideoUrlRef.current);
        customVideoUrlRef.current = null;
      }
      if (customBgmUrlRef.current) {
        URL.revokeObjectURL(customBgmUrlRef.current);
        customBgmUrlRef.current = null;
      }
    };
  }, [cancelPowerTimersAndFade]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const saveToken = params.get('save');
      if (!saveToken) return;
      const imported = importTransferFromBase64Url(saveToken, quizDatasets);
      setReviewQuestions((prev) => {
        const merged = mergeReviewQuestions(prev, imported.reviewQuestions);
        saveStoredReviewQuestions(merged);
        return merged;
      });
      if (imported.hasStudyHistory) {
        setStudyHistory((prev) => {
          const merged = mergeStudyHistory(prev, imported.studyHistory);
          saveStudyHistory(merged);
          return merged;
        });
      }
      params.delete('save');
      const nextSearch = params.toString();
      const nextUrl =
        window.location.pathname +
        (nextSearch ? `?${nextSearch}` : '') +
        window.location.hash;
      window.history.replaceState(null, '', nextUrl);
      setToastMsg(
        imported.hasStudyHistory
          ? `✦ URLから引継ぎデータ（復習問題集 ${imported.reviewQuestions.length}問・学習データ分析 ${imported.studyHistory.length}件）を読み込みました。`
          : `✦ URLから引継ぎデータ（復習問題集 ${imported.reviewQuestions.length}問）を読み込みました。`
      );
      toastTimerRef.current = window.setTimeout(() => {
        setToastMsg(null);
      }, 3500);
    } catch {
      // ignore malformed URL save parameter
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (jumpTimerRef.current !== null) {
        window.clearTimeout(jumpTimerRef.current);
      }
      if (totalTimerRef.current !== null) {
        window.clearTimeout(totalTimerRef.current);
      }
    };
  }, []);

  const showMessage = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  }, []);

  const exitTestMode = useCallback(() => {
    if (jumpTimerRef.current !== null) {
      window.clearTimeout(jumpTimerRef.current);
    }
    if (totalTimerRef.current !== null) {
      window.clearTimeout(totalTimerRef.current);
    }
    editingJumpRef.current = false;
    editingTotalRef.current = false;
    setIsTestMode(false);
    setTestQuestionLimit(null);
    setShowSceneMenu(false);
    setShowBgmMenu(false);
    clearCustomVideo();
    clearCustomBgm();
    setShowSecretInput(false);
    setSecretDraft('');
    keyBufferRef.current = '';
    showMessage('✦ テストモードを終了しました。');
  }, [showMessage, clearCustomVideo, clearCustomBgm]);

  useEffect(() => {
    if (
      viewMode !== 'quiz' ||
      quizTimeLimitSec === null ||
      quizTimeLimitSec <= 0
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setQuizRemainingSec((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          window.clearInterval(intervalId);
          playRadioButtonSfx('quiz_wrong');
          setQuizTimedOut(true);
          showMessage('⏰ 制限時間が終了しました。最終鑑定結果へ移動します。');
          setViewMode('result');
          changeRandomLibraryBackground();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [viewMode, quizTimeLimitSec, showMessage, changeRandomLibraryBackground]);

  const currentQuestion =
    currentDataset?.questions[currentIndex] ?? null;
  const savedAnswer: UserAnswer = userAnswers[currentIndex] ?? null;
  const isAnswered = savedAnswer !== null;

  useEffect(() => {
    if (viewMode !== 'quiz' || !currentQuestion) return;
    if (currentQuestion.type === 'fill') {
      setFillDraft(typeof savedAnswer === 'string' ? savedAnswer : '');
      if (!isAnswered) {
        const timer = window.setTimeout(() => {
          fillInputRef.current?.focus();
        }, 50);
        return () => window.clearTimeout(timer);
      }
    } else if (currentQuestion.type === 'multi_fill') {
      if (Array.isArray(savedAnswer)) {
        setMultiFillDrafts(savedAnswer);
      } else {
        setMultiFillDrafts(new Array(currentQuestion.blanks.length).fill(''));
        const timer = window.setTimeout(() => {
          multiInputRefs.current[0]?.focus();
        }, 50);
        return () => window.clearTimeout(timer);
      }
    }
  }, [viewMode, currentIndex, currentQuestion, savedAnswer, isAnswered]);

  useEffect(() => {
    if (viewMode === 'quiz' && currentQuestion) {
      questionShownAtRef.current = Date.now();
    }
  }, [viewMode, currentIndex, currentDataset?.id, currentQuestion]);

  const maxQuestions = currentDataset?.questions.length ?? 0;
  const effectiveTotal =
    currentDataset && testQuestionLimit !== null
      ? Math.max(1, Math.min(testQuestionLimit, maxQuestions))
      : maxQuestions;

  useEffect(() => {
    if (!editingJumpRef.current) {
      setJumpDraft(String(currentIndex + 1));
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!editingTotalRef.current && currentDataset) {
      setTotalDraft(String(effectiveTotal));
    }
  }, [effectiveTotal, currentDataset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      let char = '';
      if (/^Key[A-Z]$/.test(e.code)) {
        char = e.code.slice(3).toLowerCase();
      } else if (e.key && e.key.length === 1) {
        char = e.key.toLowerCase();
      }
      if (!char) return;

      const nextBuffer = (keyBufferRef.current + char).slice(-16);
      keyBufferRef.current = nextBuffer;

      if (nextBuffer.endsWith('test')) {
        keyBufferRef.current = '';
        setShowSecretInput(false);
        setSecretDraft('');
        setIsTestMode((prev) => {
          if (!prev) {
            showMessage('✦ テストモードに切り替えました。');
          }
          return true;
        });
      } else if (nextBuffer.endsWith('esc')) {
        keyBufferRef.current = '';
        if (isTestMode) {
          exitTestMode();
        } else if (showSecretInput) {
          setShowSecretInput(false);
          setSecretDraft('');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [showMessage, isTestMode, showSecretInput, exitTestMode]);

  useEffect(() => {
    if (!isTestMode) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        exitTestMode();
      }
    };
    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [isTestMode, exitTestMode]);

  useEffect(() => {
    if (!showSceneMenu && !showBgmMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        showSceneMenu &&
        sceneMenuRef.current &&
        !sceneMenuRef.current.contains(e.target as Node)
      ) {
        setShowSceneMenu(false);
      }
      if (
        showBgmMenu &&
        bgmMenuRef.current &&
        !bgmMenuRef.current.contains(e.target as Node)
      ) {
        setShowBgmMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSceneMenu, showBgmMenu]);

  useEffect(() => {
    if (showSecretInput) {
      const timer = window.setTimeout(() => {
        secretInputRef.current?.focus();
      }, 30);
      return () => window.clearTimeout(timer);
    }
  }, [showSecretInput]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToHome = (folderId: string | null = null) => {
    playRadioButtonSfx('ui_page');
    setCurrentFolder(folderId);
    setViewMode('home');
    setQuizTimeLimitSec(null);
    setQuizRemainingSec(null);
    setQuizTimedOut(false);
    setActiveRandomConfig(null);
    setShowSecretInput(false);
    setSecretDraft('');
    keyBufferRef.current = '';
    changeRandomLibraryBackground();
    scrollToTop();
  };

  const startQuizWithDataset = (
    dataset: QuizDataset,
    options?: {
      timeLimitMinutes?: number;
      randomConfig?: RandomQuizConfig | null;
    }
  ) => {
    setCurrentDataset(dataset);
    setCurrentIndex(0);
    setTestQuestionLimit(null);
    setJumpDraft('1');
    setTotalDraft(String(dataset.questions.length));
    setUserAnswers(new Array(dataset.questions.length).fill(null));
    setFillDraft('');
    setMultiFillDrafts([]);
    setQuizTimedOut(false);
    const limitMinutes = options?.timeLimitMinutes ?? 0;
    if (limitMinutes > 0) {
      const totalSec = limitMinutes * 60;
      setQuizTimeLimitSec(totalSec);
      setQuizRemainingSec(totalSec);
    } else {
      setQuizTimeLimitSec(null);
      setQuizRemainingSec(null);
    }
    setActiveRandomConfig(options?.randomConfig ?? null);
    setViewMode('quiz');
    changeRandomLibraryBackground();
    scrollToTop();
  };

  const isReviewSessionDataset = (dataset: QuizDataset | null): boolean =>
    Boolean(dataset && (dataset.id === REVIEW_DATASET_ID || dataset.isReview));

  const startQuiz = (datasetId: string) => {
    if (datasetId === REVIEW_DATASET_ID) {
      if (reviewQuestions.length === 0) {
        playRadioButtonSfx('ui_click');
        showMessage('まだ間違えた問題はありません。');
        return;
      }
      playRadioButtonSfx('ui_page');
      startQuizWithDataset({
        id: REVIEW_DATASET_ID,
        isReview: true,
        title: '復習問題集',
        description:
          'これまで間違えた問題のみを収録した復習専用の書です。正解するとリストから外れます。',
        questions: [...reviewQuestions],
      });
      return;
    }

    const dataset = quizDatasets.find((d) => d.id === datasetId);
    if (!dataset) return;
    playRadioButtonSfx('ui_page');
    startQuizWithDataset(dataset);
  };

  const submitAnswer = (answer: string | string[]) => {
    if (isAnswered || !currentQuestion) return;
    setUserAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = answer;
      return next;
    });

    const correct = isQuestionCorrect(answer, currentQuestion);
    playRadioButtonSfx(correct ? 'quiz_correct' : 'quiz_wrong');
    const key = getQuestionKey(currentQuestion);
    const durationSec = Math.max(
      1,
      Math.min(300, Math.round((Date.now() - questionShownAtRef.current) / 1000))
    );
    const attemptRecord: StudyAttemptRecord = {
      questionKey: key,
      datasetId: currentDataset?.id ?? 'unknown',
      datasetTitle: currentDataset?.title ?? '',
      genre: classifyQuestionGenre(currentQuestion),
      isCorrect: correct,
      durationSec,
      timestamp: Date.now(),
    };
    setStudyHistory((prev) => {
      const updated = [...prev, attemptRecord];
      saveStudyHistory(updated);
      return updated;
    });

    if (!correct) {
      setReviewQuestions((prev) => {
        if (prev.some((item) => getQuestionKey(item) === key)) {
          return prev;
        }
        const updated = [...prev, currentQuestion];
        saveStoredReviewQuestions(updated);
        return updated;
      });
    } else if (isReviewSessionDataset(currentDataset)) {
      setReviewQuestions((prev) => {
        const updated = prev.filter((item) => getQuestionKey(item) !== key);
        if (updated.length !== prev.length) {
          saveStoredReviewQuestions(updated);
        }
        return updated;
      });
    }
  };

  const handleFillSubmit = () => {
    const val = fillDraft.trim();
    if (!val) {
      playRadioButtonSfx('ui_click');
      showMessage('空欄に用語を入力してください。');
      fillInputRef.current?.focus();
      return;
    }
    submitAnswer(val);
  };

  const handleMultiFillSubmit = () => {
    if (!currentQuestion || currentQuestion.type !== 'multi_fill') return;
    const vals = multiFillDrafts.map((v) => v.trim());
    const emptyIdx = vals.findIndex((v) => !v);
    if (emptyIdx !== -1) {
      playRadioButtonSfx('ui_click');
      showMessage(
        `${currentQuestion.blanks[emptyIdx].label} の空欄に用語を入力してください。`
      );
      multiInputRefs.current[emptyIdx]?.focus();
      return;
    }
    submitAnswer(vals);
  };

  const nextQuestion = () => {
    if (!currentDataset || !currentQuestion) return;
    if (!isAnswered) {
      playRadioButtonSfx('ui_click');
      showMessage(
        currentQuestion.type === 'fill' || currentQuestion.type === 'multi_fill'
          ? '空欄に用語を入力して「解答する」を押してください。'
          : 'いずれかの選択肢を1つお選びください。'
      );
      return;
    }

    playRadioButtonSfx('ui_page');
    if (currentIndex < effectiveTotal - 1) {
      setCurrentIndex((prev) => prev + 1);
      changeRandomLibraryBackground();
      scrollToTop();
    } else {
      setViewMode('result');
      changeRandomLibraryBackground();
      scrollToTop();
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      playRadioButtonSfx('ui_page');
      setCurrentIndex((prev) => prev - 1);
      changeRandomLibraryBackground();
      scrollToTop();
    }
  };

  const applyJumpToNumber = (num: number) => {
    if (!currentDataset) return;
    const clamped = Math.max(1, Math.min(num, effectiveTotal));
    if (clamped - 1 !== currentIndex) {
      setCurrentIndex(clamped - 1);
      changeRandomLibraryBackground();
      scrollToTop();
    }
    setJumpDraft(String(clamped));
  };

  const handleJumpDraftChange = (val: string) => {
    setJumpDraft(val);
    if (jumpTimerRef.current !== null) {
      window.clearTimeout(jumpTimerRef.current);
    }
    const parsed = Number.parseInt(val.trim(), 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= effectiveTotal) {
      jumpTimerRef.current = window.setTimeout(() => {
        if (parsed - 1 !== currentIndex) {
          setCurrentIndex(parsed - 1);
          changeRandomLibraryBackground();
          scrollToTop();
        }
      }, 280);
    }
  };

  const commitJumpDraft = (val: string) => {
    if (jumpTimerRef.current !== null) {
      window.clearTimeout(jumpTimerRef.current);
    }
    const parsed = Number.parseInt(val.trim(), 10);
    if (Number.isNaN(parsed)) {
      setJumpDraft(String(currentIndex + 1));
      return;
    }
    applyJumpToNumber(parsed);
  };

  const applyTotalLimit = (num: number) => {
    if (!currentDataset) return;
    const clamped = Math.max(1, Math.min(num, currentDataset.questions.length));
    setTestQuestionLimit(clamped);
    setTotalDraft(String(clamped));
    if (currentIndex >= clamped) {
      setCurrentIndex(clamped - 1);
      setJumpDraft(String(clamped));
      changeRandomLibraryBackground();
    }
  };

  const handleTotalDraftChange = (val: string) => {
    setTotalDraft(val);
    if (totalTimerRef.current !== null) {
      window.clearTimeout(totalTimerRef.current);
    }
    if (!currentDataset) return;
    const parsed = Number.parseInt(val.trim(), 10);
    if (
      !Number.isNaN(parsed) &&
      parsed >= 1 &&
      parsed <= currentDataset.questions.length
    ) {
      totalTimerRef.current = window.setTimeout(() => {
        setTestQuestionLimit(parsed);
        if (currentIndex >= parsed) {
          setCurrentIndex(parsed - 1);
          setJumpDraft(String(parsed));
          changeRandomLibraryBackground();
        }
      }, 280);
    }
  };

  const commitTotalDraft = (val: string) => {
    if (totalTimerRef.current !== null) {
      window.clearTimeout(totalTimerRef.current);
    }
    const parsed = Number.parseInt(val.trim(), 10);
    if (Number.isNaN(parsed)) {
      setTotalDraft(String(effectiveTotal));
      return;
    }
    applyTotalLimit(parsed);
  };

  const retryQuiz = () => {
    if (!currentDataset) return;
    playRadioButtonSfx('ui_page');
    if (currentDataset.id === REVIEW_DATASET_ID) {
      startQuiz(REVIEW_DATASET_ID);
      return;
    }
    if (activeRandomConfig) {
      const { dataset } = generateRandomQuizDataset(
        quizDatasets,
        analyticsSummary,
        activeRandomConfig
      );
      startQuizWithDataset(dataset, {
        timeLimitMinutes: activeRandomConfig.timeLimitMinutes,
        randomConfig: activeRandomConfig,
      });
      return;
    }
    startQuizWithDataset(currentDataset);
  };

  const handleStartRandomQuiz = (config: RandomQuizConfig) => {
    setRandomQuizConfig(config);
    const { dataset, actualCount } = generateRandomQuizDataset(
      quizDatasets,
      analyticsSummary,
      config
    );
    if (actualCount === 0 || dataset.questions.length === 0) {
      showMessage('該当する問題が見つかりませんでした。分野設定をご確認ください。');
      return;
    }
    playRadioButtonSfx('ui_page');
    startQuizWithDataset(dataset, {
      timeLimitMinutes: config.timeLimitMinutes,
      randomConfig: config,
    });
  };

  const groupedDatasets = quizDatasets.filter(
    (d) => d.group === 'practice_set_1_2'
  );
  const standaloneDatasets = quizDatasets.filter((d) => !d.group);
  const totalGroupedQuestions = groupedDatasets.reduce(
    (sum, d) => sum + d.questions.length,
    0
  );
  const totalAllQuestions = quizDatasets.reduce(
    (sum, d) => sum + d.questions.length,
    0
  );
  const analyticsSummary = useMemo(
    () => buildLearningAnalytics(quizDatasets, reviewQuestions, studyHistory),
    [reviewQuestions, studyHistory]
  );
  const transferCode = useMemo(
    () =>
      exportTransferToBase64Url(reviewQuestions, studyHistory, quizDatasets),
    [reviewQuestions, studyHistory]
  );
  const estimatedShareUrlLength = useMemo(() => {
    const baseLen =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?save=`.length
        : 64;
    return baseLen + transferCode.length;
  }, [transferCode]);
  const isShareUrlTooLong = estimatedShareUrlLength > 8000;

  const handleDownloadBackup = () => {
    playRadioButtonSfx('ui_click');
    const filename = downloadStandaloneBackupHtml(quizDatasets);
    showMessage(
      `✦ ${filename} を保存しました（ダブルクリックでそのまま開けます）`
    );
  };

  const applyImportedTransfer = (
    imported: ImportedTransferData,
    mode: 'overwrite' | 'merge',
    source: 'code' | 'file',
    fileName?: string
  ) => {
    const prefix = source === 'file' && fileName ? `「${fileName}」から` : '';
    if (mode === 'overwrite') {
      setReviewQuestions(imported.reviewQuestions);
      saveStoredReviewQuestions(imported.reviewQuestions);
      if (imported.hasStudyHistory) {
        setStudyHistory(imported.studyHistory);
        saveStudyHistory(imported.studyHistory);
      }
      setTransferImportDraft('');
      showMessage(
        imported.hasStudyHistory
          ? `✦ ${prefix}復習問題集（${imported.reviewQuestions.length} 問）と学習データ分析（${imported.studyHistory.length} 件）を引き継ぎました（上書き）。`
          : `✦ ${prefix}復習問題集（${imported.reviewQuestions.length} 問）を引き継ぎました（上書き）。`
      );
      return;
    }

    const mergedReview = mergeReviewQuestions(
      reviewQuestions,
      imported.reviewQuestions
    );
    const addedReviewCount = mergedReview.length - reviewQuestions.length;
    setReviewQuestions(mergedReview);
    saveStoredReviewQuestions(mergedReview);

    let addedHistoryCount = 0;
    let totalHistoryCount = studyHistory.length;
    if (imported.hasStudyHistory) {
      const mergedHistory = mergeStudyHistory(
        studyHistory,
        imported.studyHistory
      );
      addedHistoryCount = Math.max(
        0,
        mergedHistory.length - studyHistory.length
      );
      totalHistoryCount = mergedHistory.length;
      setStudyHistory(mergedHistory);
      saveStudyHistory(mergedHistory);
    }

    setTransferImportDraft('');
    showMessage(
      imported.hasStudyHistory
        ? `✦ ${prefix}統合しました（復習問題集 +${addedReviewCount}問 計${mergedReview.length}問 ／ 学習データ分析 +${addedHistoryCount}件 計${totalHistoryCount}件）。`
        : `✦ ${prefix}復習問題集を統合しました（新規追加 ${addedReviewCount} 問・合計 ${mergedReview.length} 問）。`
    );
  };

  const handleDownloadTransferFile = () => {
    playRadioButtonSfx('ui_click');
    const jsonContent = exportTransferToBackupFileContent(
      reviewQuestions,
      studyHistory,
      quizDatasets
    );
    const fileName = buildBackupFileName();
    const blob = new Blob([jsonContent], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage(
      `✦ ${fileName} を保存しました（復習問題集 ${reviewQuestions.length}問 ／ 学習データ分析 ${studyHistory.length}件）。`
    );
  };

  const handleTransferFileSelected = async (
    file: File | undefined,
    mode: 'overwrite' | 'merge'
  ) => {
    if (!file) return;
    playRadioButtonSfx('ui_click');
    try {
      const imported = await importTransferFromFile(file, quizDatasets);
      applyImportedTransfer(imported, mode, 'file', file.name);
    } catch {
      showMessage('バックアップファイルの形式が正しくありません。');
    }
  };

  const currentScene = darkAcademiaLibraryScenes[sceneIndex];
  const activeVideoUrl =
    isTestMode && customVideo ? customVideo.url : currentScene.url;
  const activeSceneName =
    isTestMode && customVideo ? customVideo.name : currentScene.name;

  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, [activeVideoUrl]);

  const activeQuestions = currentDataset
    ? currentDataset.questions.slice(0, effectiveTotal)
    : [];
  const incorrectQuestions =
    viewMode === 'result' && currentDataset
      ? activeQuestions.filter(
          (q, idx) => !isQuestionCorrect(userAnswers[idx], q)
        )
      : [];
  const correctCount =
    viewMode === 'result' && currentDataset
      ? activeQuestions.length - incorrectQuestions.length
      : 0;
  const totalCount = activeQuestions.length;
  const incorrectCount = incorrectQuestions.length;
  const percentage =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const retryIncorrectOnly = () => {
    if (!currentDataset || incorrectQuestions.length === 0) return;
    playRadioButtonSfx('ui_page');
    const isReview = isReviewSessionDataset(currentDataset);
    const retryDataset: QuizDataset = {
      id: `retry_incorrect_${Date.now()}`,
      isReview,
      title: currentDataset.title.endsWith('（間違えた問題）')
        ? currentDataset.title
        : `${currentDataset.title}（間違えた問題）`,
      description: `${currentDataset.title} で間違えた ${incorrectQuestions.length} 問の復習用セットです。`,
      questions: incorrectQuestions,
    };
    startQuizWithDataset(retryDataset);
  };

  const syncReviewFromActiveSession = () => {
    if (!currentDataset || !isReviewSessionDataset(currentDataset)) return;
    const answeredCorrectKeys = new Set<string>();
    const answeredWrong: QuizQuestion[] = [];
    activeQuestions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === null || ans === undefined) return;
      if (isQuestionCorrect(ans, q)) {
        answeredCorrectKeys.add(getQuestionKey(q));
      } else {
        answeredWrong.push(q);
      }
    });
    setReviewQuestions((prev) => {
      let updated = prev.filter(
        (item) => !answeredCorrectKeys.has(getQuestionKey(item))
      );
      const existingKeys = new Set(updated.map(getQuestionKey));
      for (const wq of answeredWrong) {
        const wk = getQuestionKey(wq);
        if (!existingKeys.has(wk)) {
          existingKeys.add(wk);
          updated = [...updated, wq];
        }
      }
      saveStoredReviewQuestions(updated);
      return updated;
    });
  };

  const currentQuestionCorrect =
    isAnswered && currentQuestion
      ? isQuestionCorrect(savedAnswer, currentQuestion)
      : false;

  const displayCorrectAnswer = currentQuestion
    ? currentQuestion.type === 'multi_fill'
      ? currentQuestion.blanks
          .map((b) => `${b.label}：${b.correctAnswer}`)
          .join(' ／ ')
      : currentQuestion.correctAnswer
    : '';

  return (
    <>
      <video
        ref={bgVideoRef}
        key={activeVideoUrl}
        src={activeVideoUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="library-bg-video"
      />
      <audio
        ref={bgmAudioRef}
        src={activeBgmUrl}
        preload="auto"
        onEnded={handleNextBgm}
        onCanPlay={() => {
          const audio = bgmAudioRef.current;
          if (
            isRadioOn &&
            !isRadioWarmingUp &&
            !isRadioPoweringOff &&
            audio &&
            audio.paused
          ) {
            audio.volume = 0.45;
            audio.muted = false;
            audio
              .play()
              .then(() => setBgmNeedsGesture(false))
              .catch(() => {});
          }
        }}
      />
      <div className="library-bg-overlay" />

      {/* Header */}
      <header className="bg-[#09070a]/90 backdrop-blur-md text-[#e6dfd3] py-5 px-4 border-b border-[#c5a059]/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => goToHome(null)}
          >
            <div className="p-2 rounded-full border border-[#c5a059]/50 bg-[#1a141e] group-hover:border-[#ffd700] transition">
              <svg
                className="w-6 h-6 text-[#d4af37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] text-[#c5a059]">
                Daia&apos;s３次元ＣＡＤ対策
              </span>
              <h1 className="classic-title text-xl sm:text-2xl font-bold tracking-wider text-[#f3e5ab]">
                3次元CAD利用技術者試験２級
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <div ref={sceneMenuRef} className="relative">
              {isTestMode ? (
                <button
                  type="button"
                  onClick={() => {
                    playRadioButtonSfx('ui_click');
                    setShowBgmMenu(false);
                    setShowSceneMenu((prev) => !prev);
                  }}
                  title="クリックして背景動画を選択"
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-[#2a1c30] hover:bg-[#3a2542] text-[#f3e5ab] border border-[#d4af37]/70 hover:border-[#ffd700] tracking-wider transition shadow cursor-pointer"
                >
                  <span className="max-w-[180px] sm:max-w-[240px] truncate">
                    {customVideo ? '🎬' : '🏛️'} {activeSceneName}{' '}
                    {customVideo
                      ? '(任意)'
                      : `(${sceneIndex + 1}/${darkAcademiaLibraryScenes.length})`}
                  </span>
                  <span className="text-[9px] text-[#d4af37]">▼</span>
                </button>
              ) : (
                <span className="hidden md:inline-block text-[11px] px-3 py-1 rounded-full bg-[#17121c]/90 text-[#c5a059] border border-[#c5a059]/30 tracking-wider">
                  🏛️ {currentScene.name}
                </span>
              )}

              {isTestMode && showSceneMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#141019]/95 backdrop-blur-md border border-[#c5a059]/70 shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold text-[#d4af37] border-b border-[#c5a059]/25 mb-1 flex items-center justify-between">
                    <span>🎬 背景動画を選択</span>
                    <span className="text-[10px] text-[#9e9285]">
                      テストモード
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {darkAcademiaLibraryScenes.map((scene, idx) => {
                      const isActive = !customVideo && sceneIndex === idx;
                      return (
                        <button
                          key={scene.url}
                          type="button"
                          onClick={() => selectSceneByIndex(idx)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                            isActive
                              ? 'bg-[#3a1c24] text-[#f3e5ab] border border-[#d4af37]/70 font-bold'
                              : 'text-[#dfd7c8] hover:bg-[#231b2b] border border-transparent'
                          }`}
                        >
                          <span className="truncate">
                            {idx + 1}. {scene.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] text-[#ffd700] shrink-0">
                              再生中
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-[#c5a059]/25 mt-2 pt-2">
                    <input
                      ref={customVideoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          playCustomVideoFile(file);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        playRadioButtonSfx('ui_click');
                        customVideoInputRef.current?.click();
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] border border-[#c5a059]/50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>📁 任意の動画ファイルを選択</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isTestMode && (
              <div ref={bgmMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    playRadioButtonSfx('ui_click');
                    setShowSceneMenu(false);
                    setShowBgmMenu((prev) => !prev);
                  }}
                  title="クリックしてBGMを選択"
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-[#2a1c30] hover:bg-[#3a2542] text-[#f3e5ab] border border-[#d4af37]/70 hover:border-[#ffd700] tracking-wider transition shadow cursor-pointer"
                >
                  <span className="max-w-[160px] sm:max-w-[220px] truncate">
                    {customBgm ? '🎵' : isRadioOn ? '📻' : '🔇'} {activeBgmName}{' '}
                    {customBgm
                      ? '(任意)'
                      : `(${activeTrackOriginalIndex + 1}/${bgmTracks.length})${!isRadioOn ? ' OFF' : ''}`}
                  </span>
                  <span className="text-[9px] text-[#d4af37]">▼</span>
                </button>

                {showBgmMenu && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#141019]/95 backdrop-blur-md border border-[#c5a059]/70 shadow-2xl p-2 z-50 animate-fadeIn">
                    <div className="px-2.5 py-1.5 text-[11px] font-bold text-[#d4af37] border-b border-[#c5a059]/25 mb-1 flex items-center justify-between">
                      <span>🎵 BGMを選択</span>
                      <span className="text-[10px] text-[#9e9285]">
                        テストモード
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {bgmTracks.map((track, idx) => {
                        const isActive =
                          !customBgm && activeTrackOriginalIndex === idx;
                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => selectBgmByIndex(idx)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                              isActive
                                ? 'bg-[#3a1c24] text-[#f3e5ab] border border-[#d4af37]/70 font-bold'
                                : 'text-[#dfd7c8] hover:bg-[#231b2b] border border-transparent'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="block truncate">
                                {idx + 1}. {track.title}
                              </span>
                              <span className="block truncate text-[10px] text-[#a69a8c] font-normal">
                                {track.subtitle}
                              </span>
                            </div>
                            {isActive && (
                              <span className="text-[10px] text-[#ffd700] shrink-0">
                                {isRadioOn ? '再生中' : '選択中'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-[#c5a059]/25 mt-2 pt-2 space-y-1.5">
                      <input
                        ref={customBgmInputRef}
                        type="file"
                        accept="audio/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            playCustomBgmFile(file);
                          }
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          playRadioButtonSfx('ui_click');
                          customBgmInputRef.current?.click();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] border border-[#c5a059]/50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>📁 任意の音声/動画ファイルを選択</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {viewMode !== 'home' && (
              <button
                type="button"
                onClick={() => goToHome(null)}
                className="text-xs sm:text-sm px-4 py-2 rounded-lg bg-[#1d1722] hover:bg-[#3a1c24] text-[#d4af37] border border-[#c5a059]/50 transition shadow cursor-pointer"
              >
                🗝️ ホームへ戻る
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-3xl w-full mx-auto p-4 sm:p-6 my-6">
        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#2a151b] border border-[#d4af37] text-[#f3e5ab] px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-fadeIn">
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Persistent Antique Radio at the top across all views */}
        <div className="mb-6 sm:mb-8">
          <AntiqueRadioPlayer
            tracks={bgmTracks}
            currentIndex={activeTrackOriginalIndex}
            isOn={isRadioOn}
            needsGesture={bgmNeedsGesture}
            onPrev={handlePrevBgm}
            onNext={handleNextBgm}
            onTogglePower={handleToggleRadioPower}
            onUnlockAudio={handleUnlockBgmAudio}
            customTrackName={isTestMode && customBgm ? customBgm.name : null}
            showTrackNumber={isTestMode}
            hasBeenTurnedOn={hasRadioBeenActivated}
            isSfxEnabled={isSfxEnabled}
            onToggleSfx={handleToggleSfxDial}
          />
        </div>

        {/* VIEW 1: HOME */}
        {viewMode === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  playRadioButtonSfx('ui_click');
                  setShowSecretInput((prev) => !prev);
                }}
                className="inline-block text-xs tracking-[0.2em] uppercase px-4 py-1 bg-[#261829] text-[#d4af37] font-semibold rounded-full border border-[#c5a059]/40 cursor-pointer hover:border-[#ffd700] transition"
              >
                ✦ ようこそ ✦
              </button>
              <h2 className="classic-title text-3xl sm:text-4xl font-bold text-[#f3e5ab] drop-shadow">
                ホーム
              </h2>
              <p className="text-sm text-[#9e9285]">
                ファイルを1つお選びください。
              </p>
              {showSecretInput && (
                <div className="pt-2 flex items-center justify-center gap-2 animate-fadeIn">
                  <input
                    ref={secretInputRef}
                    type="text"
                    value={secretDraft}
                    autoComplete="off"
                    placeholder="コマンドを入力..."
                    onChange={(e) => {
                      const val = e.target.value;
                      setSecretDraft(val);
                      const normalized = val.trim().toLowerCase();
                      if (normalized === 'test') {
                        setIsTestMode(true);
                        setShowSecretInput(false);
                        setSecretDraft('');
                        showMessage('✦ テストモードに切り替えました。');
                      } else if (normalized === 'esc') {
                        if (isTestMode) {
                          exitTestMode();
                        } else {
                          setShowSecretInput(false);
                          setSecretDraft('');
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSecretInput(false);
                        setSecretDraft('');
                      }
                    }}
                    className="w-52 px-3 py-1.5 rounded-lg bg-[#120e16] border border-[#c5a059]/60 text-[#f5efe6] placeholder-[#7d7267] text-xs focus:outline-none focus:border-[#ffd700]"
                  />
                </div>
              )}
            </div>

            {currentFolder === 'practice_set_1_2' ? (
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between mb-1">
                  <button
                    type="button"
                    onClick={() => goToHome(null)}
                    className="px-4 py-2 rounded-xl border border-[#c5a059]/50 bg-[#1a151f] hover:bg-[#2a2133] text-[#d4af37] text-xs sm:text-sm font-bold transition shadow flex items-center space-x-2 cursor-pointer"
                  >
                    <span>◀ ファイル一覧へ戻る</span>
                  </button>
                  <span className="text-xs text-[#c5a059] font-semibold tracking-wider">
                    📁 演習問題集
                  </span>
                </div>

                {groupedDatasets.map((dataset, index) => {
                  const scrollLabel =
                    SCROLL_NUMBERS[index] ?? String(index + 1);
                  return (
                    <div
                      key={dataset.id}
                      onClick={() => startQuiz(dataset.id)}
                      className="antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">
                            御試みの書 {scrollLabel}
                          </span>
                          <span className="text-xs text-[#d4af37] font-bold tracking-wider">
                            全 {dataset.questions.length} 問収録
                          </span>
                        </div>
                        <h3 className="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">
                          {dataset.title}
                        </h3>
                        <p className="text-sm text-[#a69a8c] leading-relaxed">
                          {dataset.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0 cursor-pointer"
                      >
                        <span>試験へ挑む ▶</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {/* データ引継ぎカード（1番目） */}
                <div
                  onClick={() => {
                    playRadioButtonSfx('ui_page');
                    setTransferImportDraft('');
                    setConfirmResetData(false);
                    setViewMode('transfer');
                    changeRandomLibraryBackground();
                    scrollToTop();
                  }}
                  className="antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">
                        御試みの書 壱
                      </span>
                      <span className="text-xs text-[#d4af37] font-bold tracking-wider">
                        Base64URL 形式対応
                      </span>
                    </div>
                    <h3 className="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">
                      データ引継ぎ
                    </h3>
                    <p className="text-sm text-[#a69a8c] leading-relaxed">
                      復習問題などの学習記録をBase64URLコードやURLで書き出し、別の端末やブラウザへ引き継ぎます。
                    </p>
                  </div>
                  <button
                    type="button"
                    className="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0 cursor-pointer"
                  >
                    <span>引継ぎを開く ▶</span>
                  </button>
                </div>

                {/* 学習データ分析カード（2番目：データ引継ぎの直下） */}
                <div
                  onClick={() => {
                    playRadioButtonSfx('ui_page');
                    setViewMode('analytics');
                    changeRandomLibraryBackground();
                    scrollToTop();
                  }}
                  className="antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">
                        御試みの書 弐
                      </span>
                      <span className="text-xs text-[#d4af37] font-bold tracking-wider">
                        習得率 {analyticsSummary.learnedPercent}%
                        {analyticsSummary.avgAccuracyPercent !== null
                          ? ` ／ 平均正解率 ${analyticsSummary.avgAccuracyPercent}%`
                          : ' ／ 7種グラフ収録'}
                      </span>
                    </div>
                    <h3 className="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">
                      学習データ分析
                    </h3>
                    <p className="text-sm text-[#a69a8c] leading-relaxed">
                      覚えた割合や平均正誤率、得意・苦手ジャンルに加え、棒グラフ・折れ線・円/帯・積み上げ棒・散布図・ヒストグラム/箱ひげ図・レーダーチャートの7種で学習記録を分析します。
                    </p>
                  </div>
                  <button
                    type="button"
                    className="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0 cursor-pointer"
                  >
                    <span>分析を開く ▶</span>
                  </button>
                </div>

                {/* ランダム問題生成カード（3番目：学習データ分析と復習問題集の間） */}
                <div
                  onClick={() => {
                    playRadioButtonSfx('ui_page');
                    setViewMode('random_setup');
                    changeRandomLibraryBackground();
                    scrollToTop();
                  }}
                  className="antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">
                        御試みの書 参
                      </span>
                      <span className="text-xs text-[#d4af37] font-bold tracking-wider">
                        問題数・制限時間・苦手/任意分野を選択可
                      </span>
                    </div>
                    <h3 className="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">
                      ランダム問題生成
                    </h3>
                    <p className="text-sm text-[#a69a8c] leading-relaxed">
                      サイト内に収録されている問題から、ランダム出題の有無・出題数・制限時間・苦手分野のみ／任意の分野指定を選んで演習問題を作成します。
                    </p>
                  </div>
                  <button
                    type="button"
                    className="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0 cursor-pointer"
                  >
                    <span>問題を設定 ▶</span>
                  </button>
                </div>

                {/* 復習問題集カード（4番目） */}
                <div
                  onClick={() => startQuiz(REVIEW_DATASET_ID)}
                  className="antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">
                        御試みの書 肆
                      </span>
                      <span className="text-xs text-[#d4af37] font-bold tracking-wider">
                        全 {reviewQuestions.length} 問収録
                      </span>
                    </div>
                    <h3 className="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">
                      復習問題集
                    </h3>
                    <p className="text-sm text-[#a69a8c] leading-relaxed">
                      {reviewQuestions.length > 0
                        ? 'これまでの試験や図問題で間違えた問題のみを収録した復習専用の書です。正解するとリストから外れます。'
                        : 'これまで間違えた問題が自動的にここへ収録されます（現在は間違いがありません）。'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0 ${
                      reviewQuestions.length === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                  >
                    <span>
                      {reviewQuestions.length > 0 ? '復習へ挑む ▶' : '問題なし'}
                    </span>
                  </button>
                </div>

                {/* 演習問題集フォルダカード */}
                <div
                  onClick={() => {
                    playRadioButtonSfx('ui_page');
                    setCurrentFolder('practice_set_1_2');
                    changeRandomLibraryBackground();
                    scrollToTop();
                  }}
                  className="antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">
                        御試みの書 伍
                      </span>
                      <span className="text-xs text-[#d4af37] font-bold tracking-wider">
                        演習問題数：全 {totalGroupedQuestions} 問収録（
                        {groupedDatasets.length}回分）
                      </span>
                    </div>
                    <h3 className="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">
                      演習問題集
                    </h3>
                    <p className="text-sm text-[#a69a8c] leading-relaxed">
                      選択問題や入力問題などをまとめた演習問題集です。
                    </p>
                  </div>
                  <button
                    type="button"
                    className="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0 cursor-pointer"
                  >
                    <span>問題集を開く ▶</span>
                  </button>
                </div>

                {/* その他の独立ファイル */}
                {standaloneDatasets.map((dataset, idx) => {
                  const scrollLabel =
                    SCROLL_NUMBERS[idx + 5] ?? String(idx + 6);
                  return (
                    <div
                      key={dataset.id}
                      onClick={() => startQuiz(dataset.id)}
                      className="antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">
                            御試みの書 {scrollLabel}
                          </span>
                          <span className="text-xs text-[#d4af37] font-bold tracking-wider">
                            全 {dataset.questions.length} 問収録
                            {dataset.countSuffix ?? ''}
                          </span>
                        </div>
                        <h3 className="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">
                          {dataset.title}
                        </h3>
                        <p className="text-sm text-[#a69a8c] leading-relaxed">
                          {dataset.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0 cursor-pointer"
                      >
                        <span>試験へ挑む ▶</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* テストモード＆バージョンバックアップ保存（通常非表示・ホームで "test" 入力で表示） */}
            {isTestMode && (
              <div className="bg-[#130f17]/90 border border-[#c5a059]/35 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#d4af37] tracking-wider">
                      🛠️ テストモード・バックアップ保存（単体HTML）
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#a69a8c] leading-relaxed">
                    現在の全収録問題（全 {totalAllQuestions}{' '}
                    問・図解含む）を1つのHTMLファイルとして保存できます。問題画面では番号移動・全問数の変更も可能です（Escキーまたは "esc" 入力で通常モードに戻ります）。
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="px-5 py-2.5 rounded-xl border border-[#c5a059]/60 bg-[#211926] hover:bg-[#3a1c24] text-[#f3e5ab] text-xs sm:text-sm font-bold whitespace-nowrap transition shadow cursor-pointer"
                  >
                    📥 バックアップを保存
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: QUIZ SCREEN */}
        {viewMode === 'quiz' && currentDataset && currentQuestion && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Progress Indicator */}
            <div className="bg-[#151118] border border-[#c5a059]/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
              <span className="font-bold text-[#d4af37] text-sm sm:text-base tracking-wide">
                {currentDataset.title}
              </span>
              <div className="flex items-center space-x-3">
                {isTestMode ? (
                  <div className="bg-[#2a1c30] px-3.5 py-1 rounded-full font-bold text-xs sm:text-sm text-[#f3e5ab] border border-[#d4af37] shadow-inner flex items-center gap-1.5">
                    <span>第</span>
                    <input
                      type="number"
                      min={1}
                      max={effectiveTotal}
                      aria-label="問題番号を指定"
                      value={jumpDraft}
                      onFocus={() => {
                        editingJumpRef.current = true;
                      }}
                      onChange={(e) => handleJumpDraftChange(e.target.value)}
                      onBlur={() => {
                        editingJumpRef.current = false;
                        commitJumpDraft(jumpDraft);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          editingJumpRef.current = false;
                          commitJumpDraft(jumpDraft);
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-12 text-center bg-[#120e16] border border-[#c5a059]/70 rounded-md px-1 py-0.5 text-[#ffd700] font-bold focus:outline-none focus:border-[#ffd700]"
                    />
                    <span>問 / 全</span>
                    <input
                      type="number"
                      min={1}
                      max={currentDataset.questions.length}
                      aria-label="全問題数を変更"
                      value={totalDraft}
                      onFocus={() => {
                        editingTotalRef.current = true;
                      }}
                      onChange={(e) => handleTotalDraftChange(e.target.value)}
                      onBlur={() => {
                        editingTotalRef.current = false;
                        commitTotalDraft(totalDraft);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          editingTotalRef.current = false;
                          commitTotalDraft(totalDraft);
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-12 text-center bg-[#120e16] border border-[#c5a059]/70 rounded-md px-1 py-0.5 text-[#ffd700] font-bold focus:outline-none focus:border-[#ffd700]"
                    />
                    <span>問</span>
                  </div>
                ) : (
                  <span className="bg-[#2a1c30] px-4 py-1 rounded-full font-bold text-xs sm:text-sm text-[#f3e5ab] border border-[#c5a059]/60 shadow-inner">
                    第 {currentIndex + 1} 問 / 全 {effectiveTotal} 問
                  </span>
                )}
                {quizRemainingSec !== null && (
                  <span
                    className={`px-3.5 py-1 rounded-full font-bold text-xs sm:text-sm border shadow-inner tabular-nums ${
                      quizRemainingSec <= 30
                        ? 'bg-[#3b151e] border-rose-400 text-rose-200'
                        : quizRemainingSec <= 120
                          ? 'bg-[#302112] border-amber-400 text-amber-200'
                          : 'bg-[#1a1522] border-[#c5a059]/60 text-[#ffd700]'
                    }`}
                  >
                    ⏱ 残り {formatCountdownMmSs(quizRemainingSec)}
                  </span>
                )}
              </div>
            </div>

            {/* Question Card */}
            <div className="antique-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-bold text-[#c5a059] bg-[#211926] px-3 py-1 rounded border border-[#c5a059]/40">
                  <span>❖ 問題 {currentIndex + 1}</span>
                </div>

                {currentQuestion.diagram && (
                  <div className="my-4 p-3 sm:p-4 bg-[#f8f6f0] rounded-xl border-2 border-[#c5a059]/70 shadow-inner overflow-x-auto">
                    <DiagramViewer diagramId={currentQuestion.diagram} />
                  </div>
                )}

                <h3 className="text-lg sm:text-xl font-bold text-[#f5efe6] leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options / Inputs */}
              <div className="space-y-3">
                {currentQuestion.type === 'multi_fill' ? (
                  <div className="space-y-3">
                    {currentQuestion.blanks.map((blank, bIdx) => {
                      const userVal =
                        isAnswered && Array.isArray(savedAnswer)
                          ? savedAnswer[bIdx] ?? ''
                          : multiFillDrafts[bIdx] ?? '';
                      const blankOk =
                        isAnswered &&
                        Array.isArray(savedAnswer) &&
                        isSingleBlankCorrect(userVal, blank);

                      return (
                        <div key={blank.label} className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-lg bg-[#261829] border border-[#c5a059]/60 text-[#f3e5ab] font-bold flex items-center justify-center shrink-0 text-sm">
                            {blank.label}
                          </span>
                          <input
                            ref={(el) => {
                              multiInputRefs.current[bIdx] = el;
                            }}
                            type="text"
                            value={userVal}
                            disabled={isAnswered}
                            placeholder={
                              blank.placeholder ?? `${blank.label}に入る用語を入力`
                            }
                            autoComplete="off"
                            onChange={(e) => {
                              const val = e.target.value;
                              setMultiFillDrafts((prev) => {
                                const next = [...prev];
                                next[bIdx] = val;
                                return next;
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (
                                  bIdx <
                                  currentQuestion.blanks.length - 1
                                ) {
                                  multiInputRefs.current[bIdx + 1]?.focus();
                                } else {
                                  handleMultiFillSubmit();
                                }
                              }
                            }}
                            className={`flex-grow px-4 py-3 rounded-xl bg-[#120e16] border text-[#f5efe6] placeholder-[#7d7267] focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#d4af37]/30 text-base font-bold tracking-wide ${
                              isAnswered
                                ? blankOk
                                  ? 'border-2 border-emerald-500 bg-emerald-950/50 text-emerald-200'
                                  : 'border-2 border-rose-500 bg-rose-950/50 text-rose-200'
                                : 'border-[#c5a059]/60'
                            }`}
                          />
                        </div>
                      );
                    })}

                    {!isAnswered && (
                      <button
                        type="button"
                        onClick={handleMultiFillSubmit}
                        className="antique-btn w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base mt-2 cursor-pointer"
                      >
                        ✦ 解答する
                      </button>
                    )}
                  </div>
                ) : currentQuestion.type === 'fill' ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        ref={fillInputRef}
                        type="text"
                        value={
                          isAnswered && typeof savedAnswer === 'string'
                            ? savedAnswer
                            : fillDraft
                        }
                        disabled={isAnswered}
                        placeholder={
                          currentQuestion.placeholder ?? '用語を入力してください'
                        }
                        autoComplete="off"
                        onChange={(e) => setFillDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleFillSubmit();
                          }
                        }}
                        className={`flex-grow px-4 py-3.5 rounded-xl bg-[#120e16] border text-[#f5efe6] placeholder-[#7d7267] focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#d4af37]/30 text-base sm:text-lg font-bold tracking-wide ${
                          isAnswered
                            ? currentQuestionCorrect
                              ? 'border-2 border-emerald-500 bg-emerald-950/50 text-emerald-200'
                              : 'border-2 border-rose-500 bg-rose-950/50 text-rose-200'
                            : 'border-[#c5a059]/60'
                        }`}
                      />
                      <button
                        type="button"
                        disabled={isAnswered}
                        onClick={handleFillSubmit}
                        className={`antique-btn px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap shrink-0 ${
                          isAnswered
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                      >
                        ✦ 解答する
                      </button>
                    </div>
                  </div>
                ) : (
                  currentQuestion.options.map((opt, idx) => {
                    const iconText = String.fromCharCode(9312 + idx);
                    const isCorrectOpt = opt === currentQuestion.correctAnswer;
                    const isSelectedWrong =
                      isAnswered && savedAnswer === opt && !isCorrectOpt;

                    let btnClass =
                      'antique-option w-full text-left p-4 rounded-xl font-medium flex items-center justify-between transition cursor-pointer';
                    if (isAnswered) {
                      if (isCorrectOpt) {
                        btnClass =
                          'w-full text-left p-4 rounded-xl font-bold flex items-center justify-between border-2 border-emerald-500/80 bg-emerald-950/70 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
                      } else if (isSelectedWrong) {
                        btnClass =
                          'w-full text-left p-4 rounded-xl font-bold flex items-center justify-between border-2 border-rose-500/80 bg-rose-950/70 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
                      } else {
                        btnClass =
                          'antique-option w-full text-left p-4 rounded-xl font-medium flex items-center justify-between transition opacity-45';
                      }
                    }

                    return (
                      <button
                        key={`${currentIndex}-${idx}`}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => submitAnswer(opt)}
                        className={btnClass}
                      >
                        <span className="flex items-start space-x-3">
                          <span className="font-bold text-[#d4af37] text-lg leading-snug">
                            {iconText}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </span>
                        {isAnswered && isCorrectOpt && (
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-800/80 text-emerald-100 ml-2 shrink-0">
                            正解
                          </span>
                        )}
                        {isSelectedWrong && (
                          <span className="text-xs px-2 py-0.5 rounded bg-rose-800/80 text-rose-100 ml-2 shrink-0">
                            あなたの選択
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Explanation Box */}
              {isAnswered && (
                <div
                  className={`mt-6 p-5 rounded-xl border-l-4 shadow-inner animate-fadeIn ${
                    currentQuestionCorrect
                      ? 'border-emerald-500 bg-[#0f241d] text-emerald-100'
                      : 'border-rose-500 bg-[#261117] text-rose-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold mb-2">
                    {currentQuestionCorrect ? (
                      <>
                        <svg
                          className="w-6 h-6 text-emerald-400 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-lg text-emerald-300">
                          見事、正解です！（正解：
                          <strong className="text-[#f3e5ab]">
                            {displayCorrectAnswer}
                          </strong>
                          ）
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6 text-rose-400 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-lg text-rose-300">
                          惜しくも不正解（正解：
                          <strong className="underline text-[#f3e5ab]">
                            {displayCorrectAnswer}
                          </strong>
                          ）
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-sm sm:text-base leading-relaxed mt-2 pt-2 border-t border-white/10 text-[#e6dfd3]">
                    <span className="text-xs uppercase tracking-wider text-[#d4af37] font-bold block mb-1">
                      ✦ 解説
                    </span>
                    <p>{currentQuestion.explanation}</p>
                    {currentQuestion.point && (
                      <div className="mt-3 p-3.5 rounded-lg bg-[#1a141e]/90 border border-[#c5a059]/50 text-[#f3e5ab]">
                        <span className="text-xs tracking-wider text-[#ffd700] font-bold block mb-1">
                          💡 覚えるポイント
                        </span>
                        <span className="font-semibold">
                          {currentQuestion.point}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className={`px-5 py-3 rounded-xl border border-[#c5a059]/40 text-[#c9beae] bg-[#1a151f] hover:bg-[#2a2133] hover:text-[#f3e5ab] font-semibold text-sm transition flex items-center space-x-2 shadow ${
                  currentIndex === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <span>◀ 戻る</span>
              </button>
              <button
                type="button"
                onClick={nextQuestion}
                className="antique-btn px-7 py-3 rounded-xl font-bold text-sm transition flex items-center space-x-2 cursor-pointer"
              >
                <span>
                  {currentIndex >= effectiveTotal - 1
                    ? '✦ 最終結果へ ✦'
                    : '次へ ▶'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: RESULT SCREEN */}
        {viewMode === 'result' && currentDataset && (
          <div className="space-y-6 animate-fadeIn">
            <div className="antique-card rounded-2xl p-8 sm:p-10 text-center space-y-8">
              <div className="space-y-3">
                <span className="inline-block text-xs uppercase tracking-[0.25em] text-[#d4af37] font-bold px-4 py-1 bg-[#261829] rounded-full border border-[#c5a059]/40">
                  ✦ 試練の記録 ✦
                </span>
                <h2 className="classic-title text-3xl sm:text-4xl font-bold text-[#f3e5ab]">
                  最終鑑定結果
                </h2>
                <p className="text-sm text-[#a69a8c]">
                  対象試験： {currentDataset.title}
                </p>
                {quizTimedOut && (
                  <p className="text-xs sm:text-sm font-semibold text-amber-200 bg-amber-950/50 border border-amber-500/45 rounded-lg px-4 py-2 inline-block">
                    ⏰ 制限時間が終了したため、解答を締め切りました。
                  </p>
                )}
              </div>

              <div className="bg-[#120e16] border border-[#c5a059]/50 rounded-xl p-6 max-w-lg mx-auto grid grid-cols-3 gap-4 shadow-inner">
                <div className="text-center border-r border-[#c5a059]/25 pr-2">
                  <span className="block text-xs text-[#9e9285] font-semibold mb-1">
                    正解した回数
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
                    {correctCount} 回
                  </span>
                </div>
                <div className="text-center border-r border-[#c5a059]/25 pr-2">
                  <span className="block text-xs text-[#9e9285] font-semibold mb-1">
                    間違えた回数
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-rose-400">
                    {incorrectCount} 回
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-xs text-[#9e9285] font-semibold mb-1">
                    正解率
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#f3e5ab]">
                    {percentage}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (isReviewSessionDataset(currentDataset)) {
                      syncReviewFromActiveSession();
                      showMessage('✦ 復習データをセーブしました。');
                    }
                    goToHome(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#e6dfd3] font-bold shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>
                    {isReviewSessionDataset(currentDataset)
                      ? '🗝️ セーブしてホームに戻る'
                      : '🗝️ ホームに戻る'}
                  </span>
                </button>
                {activeRandomConfig && (
                  <button
                    type="button"
                    onClick={() => {
                      playRadioButtonSfx('ui_page');
                      setQuizTimeLimitSec(null);
                      setQuizRemainingSec(null);
                      setQuizTimedOut(false);
                      setViewMode('random_setup');
                      changeRandomLibraryBackground();
                      scrollToTop();
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] font-bold shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>🎲 生成条件を変更する</span>
                  </button>
                )}
                {incorrectQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={retryIncorrectOnly}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-rose-500/70 bg-[#2d141d] hover:bg-[#421a28] text-[#f3e5ab] font-bold shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>
                      🔄 間違えた問題だけをやり直す（{incorrectQuestions.length}
                      問）
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={retryQuiz}
                  className="w-full sm:w-auto antique-btn px-8 py-3.5 rounded-xl font-bold shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>🕯️ もう一度挑戦する</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: DATA TRANSFER SCREEN */}
        {viewMode === 'transfer' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="antique-card rounded-2xl p-6 sm:p-8 space-y-8">
              <div className="text-center space-y-2">
                <span className="inline-block text-xs uppercase tracking-[0.25em] text-[#d4af37] font-bold px-4 py-1 bg-[#261829] rounded-full border border-[#c5a059]/40">
                  ✦ 記録の継承 ✦
                </span>
                <h2 className="classic-title text-2xl sm:text-3xl font-bold text-[#f3e5ab]">
                  データ引継ぎ（Base64URL・ファイル）
                </h2>
                <p className="text-xs sm:text-sm text-[#a69a8c]">
                  現在の復習問題集（全 {reviewQuestions.length} 問）と学習データ分析（
                  {studyHistory.length} 件）をgzip圧縮コード・URL・バックアップファイルとして引き継げます。
                </p>
              </div>

              {/* 書き出し（エクスポート） */}
              <div className="space-y-3 bg-[#120e16]/80 border border-[#c5a059]/35 rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#d4af37]">
                    📤 データを書き出す（引継ぎコード / ファイル）
                  </h3>
                  <span className="text-xs text-[#a69a8c]">
                    復習問題集 {reviewQuestions.length} 問 ／ 学習データ分析{' '}
                    {studyHistory.length} 件（{transferCode.startsWith('gz.') ? 'gzip圧縮・' : ''}
                    {transferCode.length.toLocaleString()}文字）
                  </span>
                </div>
                <textarea
                  readOnly
                  rows={3}
                  value={transferCode}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0910] border border-[#c5a059]/50 text-[#f3e5ab] text-xs font-mono leading-relaxed focus:outline-none focus:border-[#ffd700] resize-none"
                />
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      playRadioButtonSfx('ui_click');
                      try {
                        await navigator.clipboard.writeText(transferCode);
                      } catch {
                        const tmp = document.createElement('textarea');
                        tmp.value = transferCode;
                        document.body.appendChild(tmp);
                        tmp.select();
                        document.execCommand('copy');
                        document.body.removeChild(tmp);
                      }
                      showMessage('✦ Base64URLコードをコピーしました。');
                    }}
                    className="antique-btn px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
                  >
                    📋 コードをコピー
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      playRadioButtonSfx('ui_click');
                      const base = `${window.location.origin}${window.location.pathname}`;
                      const shareUrl = `${base}?save=${transferCode}`;
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                      } catch {
                        const tmp = document.createElement('textarea');
                        tmp.value = shareUrl;
                        document.body.appendChild(tmp);
                        tmp.select();
                        document.execCommand('copy');
                        document.body.removeChild(tmp);
                      }
                      showMessage(
                        isShareUrlTooLong
                          ? '✦ 引継ぎURLをコピーしました（※URLが長いため、開けない場合はファイル保存やコードコピーがおすすめです）。'
                          : '✦ 引継ぎURLをコピーしました。'
                      );
                    }}
                    className="px-5 py-2.5 rounded-xl border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] text-xs sm:text-sm font-bold transition shadow cursor-pointer"
                  >
                    🔗 引継ぎURLをコピー
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTransferFile}
                    className="px-5 py-2.5 rounded-xl border border-emerald-500/55 bg-[#12221b] hover:bg-[#193026] text-emerald-200 text-xs sm:text-sm font-bold transition shadow cursor-pointer"
                  >
                    💾 ファイルで保存
                  </button>
                </div>
                {isShareUrlTooLong && (
                  <p className="text-xs text-amber-200/95 bg-amber-950/45 border border-amber-500/45 rounded-lg px-3.5 py-2.5 leading-relaxed">
                    ⚠️ 引継ぎURLが長くなっているため（約{' '}
                    {estimatedShareUrlLength.toLocaleString()}{' '}
                    文字）、ブラウザや共有アプリによってはURLから開けない場合があります。確実な引継ぎには「📋
                    コードをコピー」または「💾 ファイルで保存」がおすすめです。
                  </p>
                )}
              </div>

              {/* 読み込み（インポート） */}
              <div className="space-y-4 bg-[#120e16]/80 border border-[#c5a059]/35 rounded-xl p-5">
                <h3 className="text-sm sm:text-base font-bold text-[#d4af37]">
                  📥 データを読み込む（コード / 引継ぎURL / ファイル）
                </h3>
                <textarea
                  rows={3}
                  value={transferImportDraft}
                  onChange={(e) => setTransferImportDraft(e.target.value)}
                  placeholder="Base64URLコード（gz.圧縮・旧形式どちらも可）、引継ぎURL（?save=...）、または保存JSONを貼り付けてください..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0910] border border-[#c5a059]/50 text-[#f5efe6] placeholder-[#7d7267] text-xs font-mono leading-relaxed focus:outline-none focus:border-[#ffd700] resize-none"
                />
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playRadioButtonSfx('ui_click');
                      try {
                        const imported = importTransferFromBase64Url(
                          transferImportDraft,
                          quizDatasets
                        );
                        applyImportedTransfer(imported, 'overwrite', 'code');
                      } catch {
                        showMessage(
                          '引継ぎコードの形式が正しくありません。'
                        );
                      }
                    }}
                    className="antique-btn px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
                  >
                    📥 上書きして読み込む
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playRadioButtonSfx('ui_click');
                      try {
                        const imported = importTransferFromBase64Url(
                          transferImportDraft,
                          quizDatasets
                        );
                        applyImportedTransfer(imported, 'merge', 'code');
                      } catch {
                        showMessage(
                          '引継ぎコードの形式が正しくありません。'
                        );
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] text-xs sm:text-sm font-bold transition shadow cursor-pointer"
                  >
                    ➕ 現在の記録と統合する
                  </button>
                </div>

                {/* ファイル読み込み */}
                <div className="pt-3 border-t border-[#c5a059]/20 space-y-2.5">
                  <p className="text-xs text-[#a69a8c]">
                    文字数制限を気にせず引き継ぐ場合は、保存したバックアップファイル（.json / .txt）からそのまま読み込めます。
                  </p>
                  <input
                    ref={transferFileOverwriteRef}
                    type="file"
                    accept=".json,.txt,.gz,application/json,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void handleTransferFileSelected(file, 'overwrite');
                    }}
                  />
                  <input
                    ref={transferFileMergeRef}
                    type="file"
                    accept=".json,.txt,.gz,application/json,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void handleTransferFileSelected(file, 'merge');
                    }}
                  />
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playRadioButtonSfx('ui_click');
                        transferFileOverwriteRef.current?.click();
                      }}
                      className="px-5 py-2.5 rounded-xl border border-emerald-500/55 bg-[#12221b] hover:bg-[#193026] text-emerald-200 text-xs sm:text-sm font-bold transition shadow cursor-pointer"
                    >
                      📂 ファイルから上書き読み込み
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playRadioButtonSfx('ui_click');
                        transferFileMergeRef.current?.click();
                      }}
                      className="px-5 py-2.5 rounded-xl border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] text-xs sm:text-sm font-bold transition shadow cursor-pointer"
                    >
                      📂 ファイルから統合読み込み
                    </button>
                  </div>
                </div>
              </div>

              {!confirmResetData ? (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playRadioButtonSfx('ui_click');
                      setConfirmResetData(true);
                    }}
                    className="px-6 py-3 rounded-xl border border-rose-500/60 bg-[#261117] hover:bg-[#3a1822] text-rose-200 font-bold text-sm shadow-lg transition cursor-pointer"
                  >
                    🗑️ データを初期化
                  </button>
                </div>
              ) : (
                <div className="bg-[#261117]/90 border border-rose-500/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                  <p className="text-xs sm:text-sm text-rose-200 font-semibold">
                    保存されている復習問題集（全 {reviewQuestions.length}{' '}
                    問）および学習データ分析（{studyHistory.length}{' '}
                    件）をすべて消去して初期化しますか？
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playRadioButtonSfx('ui_click');
                        setConfirmResetData(false);
                      }}
                      className="px-4 py-2 rounded-lg border border-[#c5a059]/40 bg-[#1c1622] hover:bg-[#2c2236] text-[#e6dfd3] text-xs font-bold transition cursor-pointer"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playRadioButtonSfx('ui_click');
                        setReviewQuestions([]);
                        saveStoredReviewQuestions([]);
                        setStudyHistory([]);
                        clearStudyHistory();
                        try {
                          window.localStorage.removeItem(REVIEW_STORAGE_KEY);
                        } catch {
                          // ignore
                        }
                        setTransferImportDraft('');
                        setConfirmResetData(false);
                        showMessage('✦ 学習データを初期化しました。');
                      }}
                      className="px-4 py-2 rounded-lg border border-rose-400 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer"
                    >
                      初期化する
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: LEARNING ANALYTICS SCREEN */}
        {viewMode === 'analytics' && (
          <LearningAnalyticsView summary={analyticsSummary} />
        )}

        {/* VIEW 6: RANDOM QUIZ GENERATOR SETUP SCREEN */}
        {viewMode === 'random_setup' && (
          <RandomQuizSetupView
            datasets={quizDatasets}
            analyticsSummary={analyticsSummary}
            initialConfig={randomQuizConfig}
            onStart={handleStartRandomQuiz}
            onBackHome={() => goToHome(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#09070a] text-[#6e6359] text-xs py-4 text-center border-t border-[#c5a059]/20">
        <p>Gutta cavat lapidem.</p>
      </footer>
    </>
  );
}
