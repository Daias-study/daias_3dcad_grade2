import { useCallback, useEffect, useRef, useState } from 'react';
import { DiagramViewer } from './components/DiagramViewer';
import { darkAcademiaLibraryScenes } from './data/libraryScenes';
import { quizDatasets } from './data/quizDatasets';
import type { QuizDataset, UserAnswer } from './types/quiz';
import {
  isQuestionCorrect,
  isSingleBlankCorrect,
} from './utils/answerUtils';
import { downloadStandaloneBackupHtml } from './utils/exportStandaloneHtml';

type ViewMode = 'home' | 'quiz' | 'result';

const SCROLL_NUMBERS = ['壱', '弐', '参', '肆', '伍', '陸'];

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [currentDataset, setCurrentDataset] = useState<QuizDataset | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  const [fillDraft, setFillDraft] = useState<string>('');
  const [multiFillDrafts, setMultiFillDrafts] = useState<string[]>([]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [sceneIndex, setSceneIndex] = useState<number>(0);
  const [showBackupPanel, setShowBackupPanel] = useState<boolean>(false);
  const [showSecretInput, setShowSecretInput] = useState<boolean>(false);
  const [secretDraft, setSecretDraft] = useState<string>('');

  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const lastBgIndexRef = useRef<number>(-1);
  const toastTimerRef = useRef<number | null>(null);
  const fillInputRef = useRef<HTMLInputElement | null>(null);
  const multiInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const secretInputRef = useRef<HTMLInputElement | null>(null);
  const keyBufferRef = useRef<string>('');

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

  useEffect(() => {
    changeRandomLibraryBackground();
  }, [changeRandomLibraryBackground]);

  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, [sceneIndex]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
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
    if (viewMode !== 'home') {
      keyBufferRef.current = '';
      return;
    }

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
        setShowBackupPanel((prev) => {
          if (!prev) {
            showMessage('✦ バックアップ保存メニューを表示しました');
          }
          return true;
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [viewMode, showMessage]);

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
    setCurrentFolder(folderId);
    setViewMode('home');
    setShowBackupPanel(false);
    setShowSecretInput(false);
    setSecretDraft('');
    keyBufferRef.current = '';
    changeRandomLibraryBackground();
    scrollToTop();
  };

  const startQuiz = (datasetId: string) => {
    const dataset = quizDatasets.find((d) => d.id === datasetId);
    if (!dataset) return;

    setCurrentDataset(dataset);
    setCurrentIndex(0);
    setUserAnswers(new Array(dataset.questions.length).fill(null));
    setFillDraft('');
    setMultiFillDrafts([]);
    setViewMode('quiz');
    changeRandomLibraryBackground();
    scrollToTop();
  };

  const submitAnswer = (answer: string | string[]) => {
    if (isAnswered) return;
    setUserAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = answer;
      return next;
    });
  };

  const handleFillSubmit = () => {
    const val = fillDraft.trim();
    if (!val) {
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
      showMessage(
        currentQuestion.type === 'fill' || currentQuestion.type === 'multi_fill'
          ? '空欄に用語を入力して「解答する」を押してください。'
          : 'いずれかの選択肢を1つお選びください。'
      );
      return;
    }

    if (currentIndex < currentDataset.questions.length - 1) {
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
      setCurrentIndex((prev) => prev - 1);
      changeRandomLibraryBackground();
      scrollToTop();
    }
  };

  const retryQuiz = () => {
    if (currentDataset) {
      startQuiz(currentDataset.id);
    }
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

  const handleDownloadBackup = () => {
    const filename = downloadStandaloneBackupHtml(quizDatasets);
    showMessage(
      `✦ ${filename} を保存しました（ダブルクリックでそのまま開けます）`
    );
  };

  const currentScene = darkAcademiaLibraryScenes[sceneIndex];

  const correctCount =
    viewMode === 'result' && currentDataset
      ? currentDataset.questions.reduce(
          (count, q, idx) =>
            isQuestionCorrect(userAnswers[idx], q) ? count + 1 : count,
          0
        )
      : 0;
  const totalCount = currentDataset?.questions.length ?? 0;
  const incorrectCount = totalCount - correctCount;
  const percentage =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

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
        key={currentScene.url}
        src={currentScene.url}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="library-bg-video"
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
          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-block text-[11px] px-3 py-1 rounded-full bg-[#17121c]/90 text-[#c5a059] border border-[#c5a059]/30 tracking-wider">
              🏛️ {currentScene.name}
              {showBackupPanel
                ? ` (${sceneIndex + 1}/${darkAcademiaLibraryScenes.length})`
                : ''}
            </span>
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

        {/* VIEW 1: HOME */}
        {viewMode === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-3 mb-8">
              <button
                type="button"
                onClick={() => setShowSecretInput((prev) => !prev)}
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
                      if (val.trim().toLowerCase() === 'test') {
                        setShowBackupPanel(true);
                        setShowSecretInput(false);
                        setSecretDraft('');
                        showMessage('✦ バックアップ保存メニューを表示しました');
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
                {/* 演習問題集フォルダカード */}
                <div
                  onClick={() => {
                    setCurrentFolder('practice_set_1_2');
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
                    SCROLL_NUMBERS[idx + 1] ?? String(idx + 2);
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
            )}

            {/* バージョンバックアップ保存（通常非表示・ホームで "test" 入力で表示） */}
            {showBackupPanel && (
              <div className="bg-[#130f17]/90 border border-[#c5a059]/35 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#d4af37] tracking-wider">
                      💾 バージョンバックアップ（単体HTML保存）
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#a69a8c] leading-relaxed">
                    現在の全収録問題（全 {totalAllQuestions}{' '}
                    問・図解含む）を1つのHTMLファイルとして保存します。エクスプローラーからダブルクリックだけで開けます。
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
                  <button
                    type="button"
                    onClick={() => setShowBackupPanel(false)}
                    className="px-3.5 py-2.5 rounded-xl border border-[#c5a059]/30 bg-[#18131d] hover:bg-[#261d2e] text-[#9e9285] hover:text-[#f3e5ab] text-xs font-semibold whitespace-nowrap transition cursor-pointer"
                  >
                    閉じる
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
                <span className="bg-[#2a1c30] px-4 py-1 rounded-full font-bold text-xs sm:text-sm text-[#f3e5ab] border border-[#c5a059]/60 shadow-inner">
                  第 {currentIndex + 1} 問 / 全 {currentDataset.questions.length}{' '}
                  問
                </span>
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
                  {currentIndex === currentDataset.questions.length - 1
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

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => goToHome(null)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#e6dfd3] font-bold shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>🗝️ ホームに戻る</span>
                </button>
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
      </main>

      {/* Footer */}
      <footer className="bg-[#09070a] text-[#6e6359] text-xs py-4 text-center border-t border-[#c5a059]/20">
        <p>Gutta cavat lapidem.</p>
      </footer>
    </>
  );
}
