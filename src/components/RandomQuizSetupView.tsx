import { useMemo, useState } from 'react';
import type { QuizDataset } from '../types/quiz';
import {
  ALL_STUDY_GENRES,
  type LearningAnalyticsSummary,
  type StudyGenre,
} from '../utils/analyticsUtils';
import { playRadioButtonSfx } from '../utils/radioSfx';
import {
  buildUniqueQuestionPool,
  detectWeakGenres,
  type RandomOrderMode,
  type RandomQuizConfig,
  type RandomTargetScope,
} from '../utils/randomQuizUtils';

interface RandomQuizSetupViewProps {
  datasets: QuizDataset[];
  analyticsSummary: LearningAnalyticsSummary;
  initialConfig: RandomQuizConfig;
  onStart: (config: RandomQuizConfig) => void;
  onBackHome: () => void;
}

const PRESET_COUNTS = [5, 10, 20, 30, 50, 60] as const;
const PRESET_MINUTES = [0, 5, 10, 15, 30, 60] as const;

export function RandomQuizSetupView({
  datasets,
  analyticsSummary,
  initialConfig,
  onStart,
  onBackHome,
}: RandomQuizSetupViewProps) {
  const [orderMode, setOrderMode] = useState<RandomOrderMode>(
    initialConfig.orderMode
  );
  const [targetScope, setTargetScope] = useState<RandomTargetScope>(
    initialConfig.targetScope
  );
  const [selectedGenres, setSelectedGenres] = useState<StudyGenre[]>(
    initialConfig.selectedGenres.length > 0
      ? initialConfig.selectedGenres
      : [...ALL_STUDY_GENRES]
  );
  const [questionCount, setQuestionCount] = useState<number>(
    initialConfig.questionCount
  );
  const [countDraft, setCountDraft] = useState<string>(
    String(initialConfig.questionCount)
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(
    initialConfig.timeLimitMinutes
  );
  const [minutesDraft, setMinutesDraft] = useState<string>(
    String(initialConfig.timeLimitMinutes)
  );

  const uniquePool = useMemo(() => buildUniqueQuestionPool(datasets), [datasets]);

  const countByGenre = useMemo(() => {
    const map = new Map<StudyGenre, number>();
    for (const g of ALL_STUDY_GENRES) map.set(g, 0);
    for (const item of uniquePool) {
      map.set(item.genre, (map.get(item.genre) ?? 0) + 1);
    }
    return map;
  }, [uniquePool]);

  const weakGenres = useMemo(
    () => detectWeakGenres(analyticsSummary),
    [analyticsSummary]
  );

  const genreStatsMap = useMemo(() => {
    const map = new Map(analyticsSummary.genreStats.map((g) => [g.genre, g]));
    return map;
  }, [analyticsSummary.genreStats]);

  const activeGenres: StudyGenre[] = useMemo(() => {
    if (targetScope === 'all') return [...ALL_STUDY_GENRES];
    if (targetScope === 'weak') return weakGenres;
    return selectedGenres;
  }, [targetScope, weakGenres, selectedGenres]);

  const availableQuestionCount = useMemo(() => {
    const set = new Set<StudyGenre>(activeGenres);
    return uniquePool.filter((item) => set.has(item.genre)).length;
  }, [uniquePool, activeGenres]);

  const effectiveQuestionCount =
    availableQuestionCount > 0
      ? Math.max(1, Math.min(questionCount, availableQuestionCount))
      : 0;

  const canStart = availableQuestionCount > 0 && effectiveQuestionCount > 0;

  const toggleGenre = (genre: StudyGenre) => {
    playRadioButtonSfx('ui_click');
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const applyCount = (next: number) => {
    const maxAllowed = Math.max(1, availableQuestionCount || uniquePool.length);
    const clamped = Math.max(1, Math.min(Math.round(next), maxAllowed));
    setQuestionCount(clamped);
    setCountDraft(String(clamped));
  };

  const applyMinutes = (next: number) => {
    const clamped = Math.max(0, Math.min(180, Math.round(next)));
    setTimeLimitMinutes(clamped);
    setMinutesDraft(String(clamped));
  };

  const handleSubmit = () => {
    if (!canStart) return;
    onStart({
      orderMode,
      questionCount: effectiveQuestionCount,
      timeLimitMinutes,
      targetScope,
      selectedGenres,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="antique-card rounded-2xl p-6 sm:p-8 space-y-7">
        {/* Heading */}
        <div className="text-center space-y-2">
          <p className="text-xs tracking-[0.2em] text-[#d4af37] font-bold">
            ✦ 演習カスタム生成 ✦
          </p>
          <h2 className="classic-title text-2xl sm:text-3xl font-bold text-[#f3e5ab]">
            ランダム問題生成の設定
          </h2>
          <p className="text-xs sm:text-sm text-[#a69a8c] leading-relaxed">
            サイト内の全収録問題（重複除外・全 {uniquePool.length}{' '}
            問）から、条件に合わせて問題セットを作成します。
          </p>
        </div>

        {/* 1. ランダムに生成するかどうか */}
        <section className="space-y-3 pt-5 border-t border-[#c5a059]/25">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#d4af37]">
              1. ランダムに問題を生成するかどうか
            </h3>
            <span className="text-xs text-[#a69a8c]">
              出題順の並び方を選択
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                playRadioButtonSfx('ui_click');
                setOrderMode('random');
              }}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                orderMode === 'random'
                  ? 'border-[#ffd700] bg-[#2a1d2e] text-[#f3e5ab] shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                  : 'border-[#c5a059]/35 bg-[#120e16]/85 text-[#c9beae] hover:border-[#c5a059]/70'
              }`}
            >
              <div className="text-sm font-bold">🎲 ランダムに生成する</div>
              <p className="text-xs text-[#a69a8c] mt-1">
                対象問題から毎回シャッフルして抽出します。
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                playRadioButtonSfx('ui_click');
                setOrderMode('sequential');
              }}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                orderMode === 'sequential'
                  ? 'border-[#ffd700] bg-[#2a1d2e] text-[#f3e5ab] shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                  : 'border-[#c5a059]/35 bg-[#120e16]/85 text-[#c9beae] hover:border-[#c5a059]/70'
              }`}
            >
              <div className="text-sm font-bold">📜 ランダムにせず順番通りに出題</div>
              <p className="text-xs text-[#a69a8c] mt-1">
                収録順のまま指定した問題数・分野を出題します。
              </p>
            </button>
          </div>
        </section>

        {/* 2. 分野の選び方（全分野 / 苦手分野のみ / 自分で分野を選ぶ） */}
        <section className="space-y-4 pt-5 border-t border-[#c5a059]/25">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#d4af37]">
              2. 出題する分野の選択
            </h3>
            <span className="text-xs text-[#f3e5ab] font-semibold tabular-nums">
              対象問題数：{availableQuestionCount} 問
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => {
                playRadioButtonSfx('ui_click');
                setTargetScope('all');
              }}
              className={`px-3.5 py-3 rounded-xl border text-left transition cursor-pointer ${
                targetScope === 'all'
                  ? 'border-[#ffd700] bg-[#2a1d2e] text-[#f3e5ab]'
                  : 'border-[#c5a059]/35 bg-[#120e16]/85 text-[#c9beae] hover:border-[#c5a059]/70'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold">📚 すべての分野</div>
              <div className="text-[11px] text-[#a69a8c] mt-0.5 tabular-nums">
                全 {uniquePool.length} 問から出題
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                playRadioButtonSfx('ui_click');
                setTargetScope('weak');
              }}
              className={`px-3.5 py-3 rounded-xl border text-left transition cursor-pointer ${
                targetScope === 'weak'
                  ? 'border-[#ffd700] bg-[#2a1d2e] text-[#f3e5ab]'
                  : 'border-[#c5a059]/35 bg-[#120e16]/85 text-[#c9beae] hover:border-[#c5a059]/70'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold">
                🎯 苦手な分野のみ
              </div>
              <div className="text-[11px] text-[#a69a8c] mt-0.5 tabular-nums">
                {weakGenres.length > 0
                  ? `${weakGenres.length}分野を自動抽出`
                  : '解答履歴から自動判定'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                playRadioButtonSfx('ui_click');
                setTargetScope('custom');
              }}
              className={`px-3.5 py-3 rounded-xl border text-left transition cursor-pointer ${
                targetScope === 'custom'
                  ? 'border-[#ffd700] bg-[#2a1d2e] text-[#f3e5ab]'
                  : 'border-[#c5a059]/35 bg-[#120e16]/85 text-[#c9beae] hover:border-[#c5a059]/70'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold">
                🗂️ 自分で分野を選ぶ
              </div>
              <div className="text-[11px] text-[#a69a8c] mt-0.5 tabular-nums">
                {selectedGenres.length} / {ALL_STUDY_GENRES.length} 分野選択中
              </div>
            </button>
          </div>

          {targetScope === 'weak' && (
            <div className="rounded-xl bg-[#120e16]/90 border border-[#c5a059]/30 p-4 space-y-2.5">
              {weakGenres.length > 0 ? (
                <>
                  <p className="text-xs text-[#dfd7c8]">
                    学習データ分析の結果（正解率80%未満・最低正解率・復習残問数）から、以下の分野を苦手分野として抽出しました：
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {weakGenres.map((genre) => {
                      const stat = genreStatsMap.get(genre);
                      const count = countByGenre.get(genre) ?? 0;
                      return (
                        <div
                          key={genre}
                          className="px-3 py-2 rounded-lg bg-[#1d1522] border border-rose-500/40 flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="font-bold text-[#f3e5ab] truncate">
                            {genre}
                          </span>
                          <span className="text-rose-300 font-semibold shrink-0 tabular-nums">
                            {stat?.accuracyPct !== null &&
                            stat?.accuracyPct !== undefined
                              ? `正解率 ${stat.accuracyPct}%`
                              : `復習 ${stat?.inReviewCount ?? 0}問`}{' '}
                            · {count}問
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-amber-200/95 leading-relaxed">
                    まだ学習データ分析の解答履歴や復習問題がないため、苦手分野を自動判定できません。先に問題を解くか、「自分で分野を選ぶ」「すべての分野」を選択してください。
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      playRadioButtonSfx('ui_click');
                      setTargetScope('custom');
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] text-xs font-bold transition cursor-pointer"
                  >
                    自分で分野を選ぶへ切り替え
                  </button>
                </div>
              )}
            </div>
          )}

          {targetScope === 'custom' && (
            <div className="rounded-xl bg-[#120e16]/90 border border-[#c5a059]/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-[#a69a8c]">
                  出題したい分野をクリックして選択してください（複数選択可）
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playRadioButtonSfx('ui_click');
                      setSelectedGenres([...ALL_STUDY_GENRES]);
                    }}
                    className="px-2.5 py-1 rounded border border-[#c5a059]/45 bg-[#1a151f] hover:bg-[#2a2133] text-[#f3e5ab] text-[11px] font-bold transition cursor-pointer"
                  >
                    すべて選択
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playRadioButtonSfx('ui_click');
                      setSelectedGenres([]);
                    }}
                    className="px-2.5 py-1 rounded border border-[#c5a059]/30 bg-[#141018] hover:bg-[#231b2b] text-[#a69a8c] text-[11px] font-bold transition cursor-pointer"
                  >
                    すべて解除
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALL_STUDY_GENRES.map((genre) => {
                  const isChecked = selectedGenres.includes(genre);
                  const stat = genreStatsMap.get(genre);
                  const qCount = countByGenre.get(genre) ?? 0;
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3.5 py-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                        isChecked
                          ? 'border-[#ffd700] bg-[#261b2b] text-[#f3e5ab]'
                          : 'border-[#c5a059]/25 bg-[#15111a]/75 text-[#8c8075] hover:border-[#c5a059]/55 hover:text-[#dfd7c8]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {isChecked ? '☑ ' : '☐ '}
                          {genre}
                        </div>
                        <div className="text-[11px] text-[#a69a8c] mt-0.5 tabular-nums">
                          収録 {qCount} 問 ·{' '}
                          {stat?.accuracyPct !== null &&
                          stat?.accuracyPct !== undefined
                            ? `正解率 ${stat.accuracyPct}%`
                            : '未挑戦'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedGenres.length === 0 && (
                <p className="text-xs text-rose-300 font-semibold">
                  少なくとも1つの分野を選択してください。
                </p>
              )}
            </div>
          )}
        </section>

        {/* 3. 何問生成するか */}
        <section className="space-y-3 pt-5 border-t border-[#c5a059]/25">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#d4af37]">
              3. 何問生成するか
            </h3>
            <span className="text-xs text-[#f3e5ab] font-semibold tabular-nums">
              {availableQuestionCount > 0
                ? `出題数：${effectiveQuestionCount} 問（最大 ${availableQuestionCount} 問）`
                : '対象分野を選択してください'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_COUNTS.map((cnt) => {
              const isActive =
                availableQuestionCount > 0 && effectiveQuestionCount === cnt;
              const disabled =
                availableQuestionCount > 0 && cnt > availableQuestionCount;
              return (
                <button
                  key={cnt}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    playRadioButtonSfx('ui_click');
                    applyCount(cnt);
                  }}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-bold transition tabular-nums ${
                    disabled
                      ? 'border-[#c5a059]/15 bg-[#120e16]/50 text-[#5e544c] cursor-not-allowed'
                      : isActive
                        ? 'border-[#ffd700] bg-[#2a1d2e] text-[#ffd700] cursor-pointer'
                        : 'border-[#c5a059]/40 bg-[#1a151f] hover:bg-[#2a2133] text-[#dfd7c8] cursor-pointer'
                  }`}
                >
                  {cnt}問
                </button>
              );
            })}
            <button
              type="button"
              disabled={availableQuestionCount === 0}
              onClick={() => {
                playRadioButtonSfx('ui_click');
                applyCount(availableQuestionCount);
              }}
              className={`px-3.5 py-2 rounded-lg border text-xs font-bold transition tabular-nums ${
                availableQuestionCount === 0
                  ? 'border-[#c5a059]/15 bg-[#120e16]/50 text-[#5e544c] cursor-not-allowed'
                  : effectiveQuestionCount === availableQuestionCount
                    ? 'border-[#ffd700] bg-[#2a1d2e] text-[#ffd700] cursor-pointer'
                    : 'border-[#c5a059]/40 bg-[#1a151f] hover:bg-[#2a2133] text-[#dfd7c8] cursor-pointer'
              }`}
            >
              全問（{availableQuestionCount}問）
            </button>

            <div className="flex items-center gap-1.5 ml-auto">
              <label
                htmlFor="random-count-input"
                className="text-xs text-[#a69a8c]"
              >
                任意数：
              </label>
              <input
                id="random-count-input"
                type="number"
                min={1}
                max={Math.max(1, availableQuestionCount)}
                value={countDraft}
                onChange={(e) => {
                  setCountDraft(e.target.value);
                  const parsed = Number.parseInt(e.target.value, 10);
                  if (!Number.isNaN(parsed) && parsed >= 1) {
                    setQuestionCount(parsed);
                  }
                }}
                onBlur={() => {
                  const parsed = Number.parseInt(countDraft, 10);
                  applyCount(Number.isNaN(parsed) ? 10 : parsed);
                }}
                className="w-20 px-2.5 py-1.5 rounded-lg bg-[#0c0910] border border-[#c5a059]/60 text-[#ffd700] text-xs font-bold text-center tabular-nums focus:outline-none focus:border-[#ffd700]"
              />
              <span className="text-xs text-[#a69a8c]">問</span>
            </div>
          </div>
        </section>

        {/* 4. 時間制限はどれくらいにするか */}
        <section className="space-y-3 pt-5 border-t border-[#c5a059]/25">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#d4af37]">
              4. 時間制限の設定
            </h3>
            <span className="text-xs text-[#f3e5ab] font-semibold tabular-nums">
              {timeLimitMinutes > 0
                ? `制限時間：${timeLimitMinutes}分`
                : '制限時間：なし'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_MINUTES.map((mins) => {
              const isActive = timeLimitMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    playRadioButtonSfx('ui_click');
                    applyMinutes(mins);
                  }}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-bold transition tabular-nums cursor-pointer ${
                    isActive
                      ? 'border-[#ffd700] bg-[#2a1d2e] text-[#ffd700]'
                      : 'border-[#c5a059]/40 bg-[#1a151f] hover:bg-[#2a2133] text-[#dfd7c8]'
                  }`}
                >
                  {mins === 0 ? '制限なし' : `${mins}分`}
                </button>
              );
            })}

            <div className="flex items-center gap-1.5 ml-auto">
              <label
                htmlFor="random-minutes-input"
                className="text-xs text-[#a69a8c]"
              >
                任意時間：
              </label>
              <input
                id="random-minutes-input"
                type="number"
                min={0}
                max={180}
                value={minutesDraft}
                onChange={(e) => {
                  setMinutesDraft(e.target.value);
                  const parsed = Number.parseInt(e.target.value, 10);
                  if (!Number.isNaN(parsed) && parsed >= 0) {
                    setTimeLimitMinutes(Math.min(180, parsed));
                  }
                }}
                onBlur={() => {
                  const parsed = Number.parseInt(minutesDraft, 10);
                  applyMinutes(Number.isNaN(parsed) ? 0 : parsed);
                }}
                className="w-20 px-2.5 py-1.5 rounded-lg bg-[#0c0910] border border-[#c5a059]/60 text-[#ffd700] text-xs font-bold text-center tabular-nums focus:outline-none focus:border-[#ffd700]"
              />
              <span className="text-xs text-[#a69a8c]">分（0でなし）</span>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-5 border-t border-[#c5a059]/30 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#c5a059]/45 bg-[#1a151f] hover:bg-[#2a2133] text-[#dfd7c8] text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            ◀ ホームへ戻る
          </button>

          <button
            type="button"
            disabled={!canStart}
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm sm:text-base font-bold transition shadow-lg ${
              canStart
                ? 'antique-btn cursor-pointer'
                : 'border border-[#c5a059]/25 bg-[#1a151f] text-[#6e6359] cursor-not-allowed'
            }`}
          >
            🎲 {effectiveQuestionCount}問を生成して開始する ▶
          </button>
        </div>
      </div>
    </div>
  );
}
