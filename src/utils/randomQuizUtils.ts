import type { QuizDataset, QuizQuestion } from '../types/quiz';
import {
  ALL_STUDY_GENRES,
  classifyQuestionGenre,
  type LearningAnalyticsSummary,
  type StudyGenre,
} from './analyticsUtils';
import { getQuestionKey } from './transferUtils';

export type RandomOrderMode = 'random' | 'sequential';
export type RandomTargetScope = 'all' | 'weak' | 'custom';

export interface RandomQuizConfig {
  orderMode: RandomOrderMode;
  questionCount: number;
  /** 0 = 制限なし, 1以上の整数 = 制限時間（分） */
  timeLimitMinutes: number;
  targetScope: RandomTargetScope;
  selectedGenres: StudyGenre[];
}

export interface UniquePoolItem {
  question: QuizQuestion;
  genre: StudyGenre;
}

export function buildUniqueQuestionPool(
  datasets: QuizDataset[]
): UniquePoolItem[] {
  const seen = new Set<string>();
  const pool: UniquePoolItem[] = [];
  for (const ds of datasets) {
    for (const q of ds.questions) {
      const key = getQuestionKey(q);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({
        question: q,
        genre: classifyQuestionGenre(q),
      });
    }
  }
  return pool;
}

export function detectWeakGenres(
  analyticsSummary: LearningAnalyticsSummary
): StudyGenre[] {
  const attempted = analyticsSummary.genreStats.filter((g) => g.attempts > 0);
  if (attempted.length > 0) {
    const belowTarget = attempted
      .filter((g) => (g.accuracyPct ?? 100) < 80)
      .sort((a, b) => {
        const diff = (a.accuracyPct ?? 100) - (b.accuracyPct ?? 100);
        if (diff !== 0) return diff;
        return b.inReviewCount - a.inReviewCount;
      });
    if (belowTarget.length > 0) {
      return belowTarget.map((g) => g.genre);
    }

    const sorted = [...attempted].sort((a, b) => {
      const diff = (a.accuracyPct ?? 100) - (b.accuracyPct ?? 100);
      if (diff !== 0) return diff;
      return b.inReviewCount - a.inReviewCount;
    });
    const minAcc = sorted[0]?.accuracyPct ?? 100;
    return sorted
      .filter((g) => (g.accuracyPct ?? 100) <= minAcc + 3)
      .map((g) => g.genre);
  }

  const withReview = analyticsSummary.genreStats.filter(
    (g) => g.inReviewCount > 0
  );
  if (withReview.length > 0) {
    return withReview.map((g) => g.genre);
  }

  return [];
}

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function resolveTargetGenres(
  config: Pick<RandomQuizConfig, 'targetScope' | 'selectedGenres'>,
  analyticsSummary: LearningAnalyticsSummary
): StudyGenre[] {
  if (config.targetScope === 'all') {
    return [...ALL_STUDY_GENRES];
  }
  if (config.targetScope === 'weak') {
    return detectWeakGenres(analyticsSummary);
  }
  return config.selectedGenres;
}

export function generateRandomQuizDataset(
  datasets: QuizDataset[],
  analyticsSummary: LearningAnalyticsSummary,
  config: RandomQuizConfig
): {
  dataset: QuizDataset;
  actualCount: number;
  targetGenres: StudyGenre[];
} {
  const targetGenres = resolveTargetGenres(config, analyticsSummary);
  const genreSet = new Set<StudyGenre>(targetGenres);
  const pool = buildUniqueQuestionPool(datasets).filter((item) =>
    genreSet.has(item.genre)
  );

  const ordered =
    config.orderMode === 'random' ? fisherYatesShuffle(pool) : pool;
  const clampedCount = Math.max(
    1,
    Math.min(Math.round(config.questionCount) || 1, ordered.length)
  );
  const chosen = ordered.slice(0, clampedCount).map((item) => item.question);

  const scopeLabel =
    config.targetScope === 'all'
      ? '全分野'
      : config.targetScope === 'weak'
        ? '苦手分野'
        : targetGenres.length === 1
          ? targetGenres[0]
          : `選択${targetGenres.length}分野`;
  const orderLabel =
    config.orderMode === 'random' ? 'ランダム出題' : '収録順出題';
  const timeLabel =
    config.timeLimitMinutes > 0
      ? `制限時間 ${config.timeLimitMinutes}分`
      : '時間制限なし';

  const dataset: QuizDataset = {
    id: `random_generated_${Date.now()}`,
    title: `${orderLabel}（${scopeLabel}・${chosen.length}問）`,
    description: `サイト内収録問題から生成（${scopeLabel} ／ ${orderLabel} ／ ${timeLabel}）`,
    questions: chosen,
  };

  return {
    dataset,
    actualCount: chosen.length,
    targetGenres,
  };
}
