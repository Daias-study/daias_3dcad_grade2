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

export type OfficialExamDomain =
  | '3次元CADの概念'
  | '3次元CADの機能と実用的モデリング手法'
  | '3次元CADデータの管理と周辺知識'
  | '3次元CADデータの活用';

export const OFFICIAL_EXAM_DOMAINS: readonly OfficialExamDomain[] = [
  '3次元CADの概念',
  '3次元CADの機能と実用的モデリング手法',
  '3次元CADデータの管理と周辺知識',
  '3次元CADデータの活用',
] as const;

export const OFFICIAL_EXAM_TOTAL_QUESTIONS = 60;
export const OFFICIAL_EXAM_TIME_MINUTES = 60;
export const OFFICIAL_EXAM_PER_DOMAIN = 15;
export const OFFICIAL_EXAM_PASS_OVERALL_PCT = 70;
export const OFFICIAL_EXAM_PASS_DOMAIN_PCT = 50;

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

export function classifyOfficialExamDomain(
  q: QuizQuestion
): OfficialExamDomain {
  if (q.diagram) {
    return '3次元CADの機能と実用的モデリング手法';
  }
  const ans =
    q.type === 'multi_fill'
      ? q.blanks.map((b) => b.correctAnswer).join(' ')
      : q.correctAnswer;
  const corpus = `${q.question} ${ans} ${q.explanation} ${q.point ?? ''}`;

  if (
    /IGES|STEP|AP242|PDM|PLM|PDQ|品質|ヒーリング|標準化|ISO|JIS|チェックアウト|チェックイン|リビジョン|部品表|BOM|ハードウェア|CPU|GPU|メモリ|RAM|OS|ネットワーク|VPN|セキュリティ|バックアップ|ファイル形式|データ交換|中間ファイル|トレランス/.test(
      corpus
    )
  ) {
    return '3次元CADデータの管理と周辺知識';
  }

  if (
    /CAE|FEM|有限要素|解析|CAM|NC|RP|3Dプリンタ|積層|光造形|粉末焼結|材料押出|STL|VRML|JT|XVL|DMU|デザインレビュー|リバース|点群|レンダリング|シェーディング|ラピッド|CG|活用|試作|シミュレーション/.test(
      corpus
    )
  ) {
    return '3次元CADデータの活用';
  }

  if (
    /押し出し|回転|スイープ|ロフト|シェル|フィレット|面取り|抜き勾配|リブ|ボス|トリム|ステッチ|縫合|パターン|ミラー|アセンブリ|ボトムアップ|トップダウン|合致|拘束|フィーチャー|スケッチ|断面図|第三角法|かくれ線|自由度|干渉|アソシエィティブ/.test(
      corpus
    )
  ) {
    return '3次元CADの機能と実用的モデリング手法';
  }

  return '3次元CADの概念';
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

export function generateOfficialMockExam(datasets: QuizDataset[]): {
  dataset: QuizDataset;
  questionDomains: OfficialExamDomain[];
  domainCounts: Record<OfficialExamDomain, number>;
} {
  const pool = buildUniqueQuestionPool(datasets);
  const buckets: Record<OfficialExamDomain, QuizQuestion[]> = {
    '3次元CADの概念': [],
    '3次元CADの機能と実用的モデリング手法': [],
    '3次元CADデータの管理と周辺知識': [],
    '3次元CADデータの活用': [],
  };

  for (const item of pool) {
    const domain = classifyOfficialExamDomain(item.question);
    buckets[domain].push(item.question);
  }

  const picked: Array<{ question: QuizQuestion; domain: OfficialExamDomain }> =
    [];
  const domainCounts: Record<OfficialExamDomain, number> = {
    '3次元CADの概念': 0,
    '3次元CADの機能と実用的モデリング手法': 0,
    '3次元CADデータの管理と周辺知識': 0,
    '3次元CADデータの活用': 0,
  };

  for (const domain of OFFICIAL_EXAM_DOMAINS) {
    const shuffledBucket = fisherYatesShuffle(buckets[domain]);
    const selected = shuffledBucket.slice(0, OFFICIAL_EXAM_PER_DOMAIN);
    domainCounts[domain] = selected.length;
    for (const q of selected) {
      picked.push({ question: q, domain });
    }
  }

  const shuffledExam = fisherYatesShuffle(picked);
  const questions = shuffledExam.map((item) => item.question);
  const questionDomains = shuffledExam.map((item) => item.domain);

  const dataset: QuizDataset = {
    id: `official_mock_2kyu_${Date.now()}`,
    title: '3次元CAD利用技術者試験2級 本番完全再現モード（CBT・60問60分）',
    description:
      '公式試験と同じく4分野各15問・全60問・制限時間60分のCBT形式で出題します。終了後に総合70%以上かつ各分野50%以上の合格基準で判定します。',
    questions,
  };

  return {
    dataset,
    questionDomains,
    domainCounts,
  };
}
