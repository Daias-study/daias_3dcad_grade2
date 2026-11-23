import type { QuizDataset, QuizQuestion } from '../types/quiz';
import { getQuestionKey } from './transferUtils';

export const STUDY_HISTORY_STORAGE_KEY = 'daia_3dcad_study_history_v1';

export type StudyGenre =
  | 'モデリング手順・コマンド'
  | '形状表現・幾何理論'
  | 'アセンブリ・CAE・造形'
  | '座標系・CG・ハードウェア'
  | 'データ交換・規格・PDQ'
  | 'CAD基礎・設計管理・運用';

export const ALL_STUDY_GENRES: readonly StudyGenre[] = [
  'モデリング手順・コマンド',
  '形状表現・幾何理論',
  'アセンブリ・CAE・造形',
  '座標系・CG・ハードウェア',
  'データ交換・規格・PDQ',
  'CAD基礎・設計管理・運用',
] as const;

export const SHORT_GENRE_LABELS: Record<StudyGenre, string> = {
  'モデリング手順・コマンド': 'モデリング手順',
  '形状表現・幾何理論': '形状表現・幾何',
  'アセンブリ・CAE・造形': 'アセンブリ・CAE',
  '座標系・CG・ハードウェア': '座標・CG・HW',
  'データ交換・規格・PDQ': 'データ変換・規格',
  'CAD基礎・設計管理・運用': 'CAD基礎・管理',
};

export interface StudyAttemptRecord {
  questionKey: string;
  datasetId: string;
  datasetTitle: string;
  genre: StudyGenre;
  isCorrect: boolean;
  durationSec: number;
  timestamp: number;
}

export interface GenreStats {
  genre: StudyGenre;
  shortLabel: string;
  totalQuestionsInBank: number;
  masteredCount: number;
  inReviewCount: number;
  attempts: number;
  correct: number;
  wrong: number;
  accuracyPct: number | null;
  masteryPct: number;
  avgDurationSec: number | null;
}

export interface TimeSeriesPoint {
  label: string;
  attempts: number;
  correct: number;
  wrong: number;
  accuracyPct: number;
  cumulativeMasteredPct: number;
}

export interface ScatterPoint {
  index: number;
  durationSec: number;
  isCorrect: boolean;
  genre: StudyGenre;
  shortLabel: string;
  label: string;
  timestamp: number;
}

export interface HistogramBin {
  label: string;
  minSec: number;
  maxSec: number;
  count: number;
  correctCount: number;
  wrongCount: number;
}

export interface BoxPlotSummary {
  label: string;
  count: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
}

export interface LearningAnalyticsSummary {
  totalUniqueQuestions: number;
  masteredCount: number;
  inReviewCount: number;
  unattemptedCount: number;
  learnedPercent: number;
  totalAttempts: number;
  totalCorrect: number;
  totalWrong: number;
  avgAccuracyPercent: number | null;
  avgWrongPercent: number | null;
  bestGenre: GenreStats | null;
  weakestGenre: GenreStats | null;
  genreStats: GenreStats[];
  timeSeries: TimeSeriesPoint[];
  scatterPoints: ScatterPoint[];
  scatterCorrelation: number | null;
  histogramBins: HistogramBin[];
  boxPlots: BoxPlotSummary[];
}

const GENRE_RULES: Array<[StudyGenre, RegExp]> = [
  [
    'データ交換・規格・PDQ',
    /IGES|STEP|STL|DXF|JT|VRML|中間ファイル|標準化|ISO|JIS|PDQ|品質|ヒーリング|変換/i,
  ],
  [
    '座標系・CG・ハードウェア',
    /座標|右手系|左手系|投影|透視|レンダリング|シェーディング|ポリゴン|テッセレーション|GPU|CPU|メモリ|RAM|ディスプレイ|入力装置|出力装置|マウス|キーボード|解像度|カラー|画素|ハードウェア|OS|ネットワーク/i,
  ],
  [
    'アセンブリ・CAE・造形',
    /アセンブリ|拘束|干渉|ボトムアップ|トップダウン|CAE|FEM|CAM|NC|RP|3Dプリンタ|光造形|積層|STLデータ|公差|質量|重心|慣性モーメント|試作/i,
  ],
  [
    'モデリング手順・コマンド',
    /押し出し|回転|スイープ|ロフト|シェル|フィレット|面取り|抜き勾配|リブ|ボス|トリム|縫合|ステッチ|オフセット|ミラー|パターン|稜線|プロファイル/,
  ],
  [
    '形状表現・幾何理論',
    /ソリッド|サーフェス|ワイヤーフレーム|CSG|B-rep|境界表現|ブーリアン|集合演算|NURBS|ベジェ|スプライン|自由曲面|位相|幾何|オイラー|多様体|トポロジ|プリミティブ|断面/i,
  ],
];

export function classifyQuestionGenre(q: QuizQuestion): StudyGenre {
  if (q.diagram) {
    return 'モデリング手順・コマンド';
  }
  const answerText =
    q.type === 'multi_fill'
      ? q.blanks.map((b) => b.correctAnswer).join(' ')
      : q.correctAnswer;
  const corpus = `${q.question} ${answerText} ${q.explanation} ${q.point ?? ''}`;
  for (const [genre, regex] of GENRE_RULES) {
    if (regex.test(corpus)) {
      return genre;
    }
  }
  return 'CAD基礎・設計管理・運用';
}

export function loadStudyHistory(): StudyAttemptRecord[] {
  try {
    const raw = window.localStorage.getItem(STUDY_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StudyAttemptRecord =>
        Boolean(item) &&
        typeof item.questionKey === 'string' &&
        typeof item.isCorrect === 'boolean' &&
        typeof item.durationSec === 'number' &&
        typeof item.timestamp === 'number'
    );
  } catch {
    return [];
  }
}

export function saveStudyHistory(records: StudyAttemptRecord[]): void {
  try {
    // Keep up to the latest 3000 attempts to avoid hitting localStorage quotas
    const trimmed = records.length > 3000 ? records.slice(-3000) : records;
    window.localStorage.setItem(
      STUDY_HISTORY_STORAGE_KEY,
      JSON.stringify(trimmed)
    );
  } catch {
    // ignore storage errors
  }
}

export function clearStudyHistory(): void {
  try {
    window.localStorage.removeItem(STUDY_HISTORY_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

function computeMedian(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeBoxPlot(label: string, values: number[]): BoxPlotSummary | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const median = computeMedian(sorted);
  const lowerHalf = sorted.slice(0, Math.floor(n / 2));
  const upperHalf = sorted.slice(Math.ceil(n / 2));
  const q1 = lowerHalf.length > 0 ? computeMedian(lowerHalf) : sorted[0];
  const q3 = upperHalf.length > 0 ? computeMedian(upperHalf) : sorted[n - 1];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  return {
    label,
    count: n,
    min: sorted[0],
    q1: Math.round(q1 * 10) / 10,
    median: Math.round(median * 10) / 10,
    q3: Math.round(q3 * 10) / 10,
    max: sorted[n - 1],
    mean: Math.round((sum / n) * 10) / 10,
  };
}

function formatDateLabel(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function buildLearningAnalytics(
  datasets: QuizDataset[],
  reviewQuestions: QuizQuestion[],
  attempts: StudyAttemptRecord[]
): LearningAnalyticsSummary {
  const uniqueBankMap = new Map<string, { genre: StudyGenre }>();
  for (const ds of datasets) {
    for (const q of ds.questions) {
      const key = getQuestionKey(q);
      if (!uniqueBankMap.has(key)) {
        uniqueBankMap.set(key, { genre: classifyQuestionGenre(q) });
      }
    }
  }

  const reviewKeySet = new Set<string>(reviewQuestions.map(getQuestionKey));
  const everCorrectKeySet = new Set<string>();
  const sortedAttempts = [...attempts].sort((a, b) => a.timestamp - b.timestamp);

  for (const att of sortedAttempts) {
    if (att.isCorrect) {
      everCorrectKeySet.add(att.questionKey);
    }
  }

  // A question is mastered if answered correctly and NOT currently in the review-wrong list
  const masteredKeySet = new Set<string>();
  for (const key of everCorrectKeySet) {
    if (!reviewKeySet.has(key) && uniqueBankMap.has(key)) {
      masteredKeySet.add(key);
    }
  }

  const totalUniqueQuestions = uniqueBankMap.size;
  const masteredCount = masteredKeySet.size;
  const inReviewCount = Array.from(reviewKeySet).filter((k) =>
    uniqueBankMap.has(k)
  ).length;
  const unattemptedCount = Math.max(
    0,
    totalUniqueQuestions - masteredCount - inReviewCount
  );
  const learnedPercent =
    totalUniqueQuestions > 0
      ? Math.round((masteredCount / totalUniqueQuestions) * 1000) / 10
      : 0;

  const totalAttempts = sortedAttempts.length;
  const totalCorrect = sortedAttempts.filter((a) => a.isCorrect).length;
  const totalWrong = totalAttempts - totalCorrect;
  const avgAccuracyPercent =
    totalAttempts > 0
      ? Math.round((totalCorrect / totalAttempts) * 1000) / 10
      : null;
  const avgWrongPercent =
    totalAttempts > 0
      ? Math.round((totalWrong / totalAttempts) * 1000) / 10
      : null;

  // Per-genre metrics
  const genreTotalCounts: Record<StudyGenre, number> = {
    'モデリング手順・コマンド': 0,
    '形状表現・幾何理論': 0,
    'アセンブリ・CAE・造形': 0,
    '座標系・CG・ハードウェア': 0,
    'データ交換・規格・PDQ': 0,
    'CAD基礎・設計管理・運用': 0,
  };
  const genreMasteredCounts: Record<StudyGenre, number> = { ...genreTotalCounts };
  const genreReviewCounts: Record<StudyGenre, number> = { ...genreTotalCounts };
  const genreAttempts: Record<StudyGenre, number> = { ...genreTotalCounts };
  const genreCorrect: Record<StudyGenre, number> = { ...genreTotalCounts };
  const genreDurationSum: Record<StudyGenre, number> = { ...genreTotalCounts };

  for (const [key, meta] of uniqueBankMap.entries()) {
    genreTotalCounts[meta.genre] += 1;
    if (masteredKeySet.has(key)) {
      genreMasteredCounts[meta.genre] += 1;
    } else if (reviewKeySet.has(key)) {
      genreReviewCounts[meta.genre] += 1;
    }
  }

  for (const att of sortedAttempts) {
    const g = ALL_STUDY_GENRES.includes(att.genre)
      ? att.genre
      : uniqueBankMap.get(att.questionKey)?.genre ?? 'CAD基礎・設計管理・運用';
    genreAttempts[g] += 1;
    if (att.isCorrect) genreCorrect[g] += 1;
    genreDurationSum[g] += att.durationSec;
  }

  const genreStats: GenreStats[] = ALL_STUDY_GENRES.map((genre) => {
    const totBank = genreTotalCounts[genre];
    const att = genreAttempts[genre];
    const cor = genreCorrect[genre];
    const wrong = att - cor;
    return {
      genre,
      shortLabel: SHORT_GENRE_LABELS[genre],
      totalQuestionsInBank: totBank,
      masteredCount: genreMasteredCounts[genre],
      inReviewCount: genreReviewCounts[genre],
      attempts: att,
      correct: cor,
      wrong,
      accuracyPct: att > 0 ? Math.round((cor / att) * 1000) / 10 : null,
      masteryPct:
        totBank > 0
          ? Math.round((genreMasteredCounts[genre] / totBank) * 1000) / 10
          : 0,
      avgDurationSec:
        att > 0 ? Math.round((genreDurationSum[genre] / att) * 10) / 10 : null,
    };
  });

  // Determine strongest & weakest genres among attempted genres (or fall back to review count if user has reviewQuestions without attempts)
  const attemptedGenres = genreStats.filter((g) => g.attempts > 0);
  let bestGenre: GenreStats | null = null;
  let weakestGenre: GenreStats | null = null;

  if (attemptedGenres.length > 0) {
    bestGenre = [...attemptedGenres].sort((a, b) => {
      const accDiff = (b.accuracyPct ?? 0) - (a.accuracyPct ?? 0);
      if (Math.abs(accDiff) > 0.01) return accDiff;
      return b.attempts - a.attempts;
    })[0];

    weakestGenre = [...attemptedGenres].sort((a, b) => {
      const accDiff = (a.accuracyPct ?? 0) - (b.accuracyPct ?? 0);
      if (Math.abs(accDiff) > 0.01) return accDiff;
      return b.wrong - a.wrong;
    })[0];

    if (
      attemptedGenres.length === 1 &&
      bestGenre.genre === weakestGenre.genre
    ) {
      if ((bestGenre.accuracyPct ?? 0) >= 60) {
        weakestGenre = null;
      } else {
        bestGenre = null;
      }
    }
  }

  // Time series: group by date if >= 2 distinct dates, otherwise group into chronological mini-sessions (every 5 attempts)
  const distinctDates = new Set(sortedAttempts.map((a) => formatDateLabel(a.timestamp)));
  const timeSeries: TimeSeriesPoint[] = [];

  if (sortedAttempts.length > 0) {
    const runningMastered = new Set<string>();
    if (distinctDates.size >= 2) {
      const byDay = new Map<string, StudyAttemptRecord[]>();
      for (const att of sortedAttempts) {
        const lbl = formatDateLabel(att.timestamp);
        const list = byDay.get(lbl) ?? [];
        list.push(att);
        byDay.set(lbl, list);
      }
      for (const [label, dayAttempts] of byDay.entries()) {
        let cor = 0;
        for (const a of dayAttempts) {
          if (a.isCorrect) {
            cor += 1;
            if (uniqueBankMap.has(a.questionKey)) {
              runningMastered.add(a.questionKey);
            }
          } else {
            runningMastered.delete(a.questionKey);
          }
        }
        const tot = dayAttempts.length;
        timeSeries.push({
          label,
          attempts: tot,
          correct: cor,
          wrong: tot - cor,
          accuracyPct: Math.round((cor / tot) * 1000) / 10,
          cumulativeMasteredPct:
            totalUniqueQuestions > 0
              ? Math.round((runningMastered.size / totalUniqueQuestions) * 1000) /
                10
              : 0,
        });
      }
    } else {
      const chunkSize = Math.max(1, Math.min(5, Math.ceil(sortedAttempts.length / 8)));
      for (let i = 0; i < sortedAttempts.length; i += chunkSize) {
        const slice = sortedAttempts.slice(i, i + chunkSize);
        let cor = 0;
        for (const a of slice) {
          if (a.isCorrect) {
            cor += 1;
            if (uniqueBankMap.has(a.questionKey)) {
              runningMastered.add(a.questionKey);
            }
          } else {
            runningMastered.delete(a.questionKey);
          }
        }
        const tot = slice.length;
        const startNo = i + 1;
        const endNo = i + tot;
        timeSeries.push({
          label: startNo === endNo ? `#${startNo}` : `#${startNo}-${endNo}`,
          attempts: tot,
          correct: cor,
          wrong: tot - cor,
          accuracyPct: Math.round((cor / tot) * 1000) / 10,
          cumulativeMasteredPct:
            totalUniqueQuestions > 0
              ? Math.round((runningMastered.size / totalUniqueQuestions) * 1000) /
                10
              : 0,
        });
      }
    }
  }

  // Scatter plot (up to last 80 attempts: X = durationSec, Y = correctness / cumulative score or duration vs index)
  // Better: show up to 80 recent attempts (durationSec vs outcome/speed), plus if multiple genres attempted, compute correlation between durationSec and correctness (0 or 100%)
  const recentAttempts = sortedAttempts.slice(-80);
  const scatterPoints: ScatterPoint[] = recentAttempts.map((a, idx) => ({
    index: idx + 1,
    durationSec: a.durationSec,
    isCorrect: a.isCorrect,
    genre: a.genre,
    shortLabel: SHORT_GENRE_LABELS[a.genre] ?? a.genre,
    label: `#${sortedAttempts.length - recentAttempts.length + idx + 1}`,
    timestamp: a.timestamp,
  }));

  let scatterCorrelation: number | null = null;
  if (scatterPoints.length >= 3) {
    const xs: number[] = scatterPoints.map((p) => p.durationSec);
    const ys: number[] = scatterPoints.map((p) => (p.isCorrect ? 100 : 0));
    const mx = xs.reduce((s, v) => s + v, 0) / xs.length;
    const my = ys.reduce((s, v) => s + v, 0) / ys.length;
    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < xs.length; i++) {
      const dx = xs[i] - mx;
      const dy = ys[i] - my;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    if (denX > 0 && denY > 0) {
      scatterCorrelation = Math.round((num / Math.sqrt(denX * denY)) * 100) / 100;
    }
  }

  // Histogram bins for answer duration (seconds)
  const binSpecs: Array<{ label: string; minSec: number; maxSec: number }> = [
    { label: '0-5秒', minSec: 0, maxSec: 5 },
    { label: '6-10秒', minSec: 6, maxSec: 10 },
    { label: '11-15秒', minSec: 11, maxSec: 15 },
    { label: '16-25秒', minSec: 16, maxSec: 25 },
    { label: '26-45秒', minSec: 26, maxSec: 45 },
    { label: '46秒+', minSec: 46, maxSec: Infinity },
  ];
  const histogramBins: HistogramBin[] = binSpecs.map((spec) => {
    const matched = sortedAttempts.filter(
      (a) => a.durationSec >= spec.minSec && a.durationSec <= spec.maxSec
    );
    const cor = matched.filter((a) => a.isCorrect).length;
    return {
      ...spec,
      count: matched.length,
      correctCount: cor,
      wrongCount: matched.length - cor,
    };
  });

  // Box plots for overall, correct, and wrong answer durations
  const allDurations = sortedAttempts.map((a) => a.durationSec);
  const correctDurations = sortedAttempts
    .filter((a) => a.isCorrect)
    .map((a) => a.durationSec);
  const wrongDurations = sortedAttempts
    .filter((a) => !a.isCorrect)
    .map((a) => a.durationSec);

  const boxPlots: BoxPlotSummary[] = [
    computeBoxPlot('全体', allDurations),
    computeBoxPlot('正解時', correctDurations),
    computeBoxPlot('不正解時', wrongDurations),
  ].filter((item): item is BoxPlotSummary => item !== null);

  return {
    totalUniqueQuestions,
    masteredCount,
    inReviewCount,
    unattemptedCount,
    learnedPercent,
    totalAttempts,
    totalCorrect,
    totalWrong,
    avgAccuracyPercent,
    avgWrongPercent,
    bestGenre,
    weakestGenre,
    genreStats,
    timeSeries,
    scatterPoints,
    scatterCorrelation,
    histogramBins,
    boxPlots,
  };
}
