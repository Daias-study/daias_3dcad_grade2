import { useMemo, useState } from 'react';
import { playRadioButtonSfx } from '../utils/radioSfx';
import type {
  BoxPlotSummary,
  GenreStats,
  LearningAnalyticsSummary,
  ScatterPoint,
} from '../utils/analyticsUtils';
import { StudyCalendarPanel } from './StudyCalendarPanel';

export type AnalyticsChartType =
  | 'bar'
  | 'line'
  | 'pie_band'
  | 'stacked_bar'
  | 'scatter'
  | 'hist_box'
  | 'radar'
  | 'all';

interface ChartOption {
  value: AnalyticsChartType;
  label: string;
  subtitle: string;
}

const CHART_OPTIONS: ChartOption[] = [
  {
    value: 'all',
    label: '🗂️ すべてのグラフを一覧表示（全7種）',
    subtitle: '7種類すべての基本グラフを縦に並べて確認します',
  },
  {
    value: 'bar',
    label: '📊 棒グラフ（ジャンル別の正解率・習得率）',
    subtitle: 'ジャンルごとの正解率と習得率の大小・差を比較します',
  },
  {
    value: 'line',
    label: '📈 折れ線グラフ（時間経過による学習トレンド）',
    subtitle: '日別・セッション別の正解率と累計習得率の推移を確認します',
  },
  {
    value: 'pie_band',
    label: '🥧 円グラフ・帯グラフ（全体の習得構成比・正誤割合）',
    subtitle: '全問題に対する習得・復習・未着手の構成比と正誤比率を見ます',
  },
  {
    value: 'stacked_bar',
    label: '🧱 積み上げ棒グラフ（解答数の合計と正誤内訳）',
    subtitle: 'ジャンル別・推移別の総解答数と正解・不正解の内訳を同時に見ます',
  },
  {
    value: 'scatter',
    label: '✨ 散布図（解答時間と正誤の相関関係）',
    subtitle: '解答にかかった秒数と正誤の分布・相関を確認します',
  },
  {
    value: 'hist_box',
    label: '📦 ヒストグラム・箱ひげ図（解答時間の分布と四分位数）',
    subtitle: '解答時間のばらつき・中央値・第1/第3四分位数を可視化します',
  },
  {
    value: 'radar',
    label: '🕸️ レーダーチャート（6ジャンルの強み・弱みバランス）',
    subtitle: '3次元CAD全6分野のバランスや得意・不得意を多角的に把握します',
  },
];

interface LearningAnalyticsViewProps {
  summary: LearningAnalyticsSummary;
}

function EmptyChartNotice({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/85 px-5 py-10 text-center space-y-2">
      <p className="text-sm font-semibold text-[#d4af37]">✦ データ計測待ち</p>
      <p className="text-xs sm:text-sm text-[#a69a8c] leading-relaxed">
        {message}
      </p>
    </div>
  );
}

function BarChartSection({ genreStats }: { genreStats: GenreStats[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const w = 680;
  const h = 300;
  const padL = 46;
  const padR = 20;
  const padT = 26;
  const padB = 64;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const slotW = innerW / Math.max(1, genreStats.length);
  const barW = Math.min(24, slotW * 0.28);

  const hovered = hoveredIdx !== null ? genreStats[hoveredIdx] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a69a8c]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#d4af37] inline-block" />
            <span className="text-[#f3e5ab]">平均正解率 (%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
            <span className="text-emerald-200">バンク習得率 (%)</span>
          </span>
        </div>
        <span className="text-[11px] text-[#9e9285]">
          棒にカーソルを合わせると詳細が表示されます
        </span>
      </div>

      <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-3 sm:p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full min-w-[520px] h-auto select-none"
          role="img"
          aria-label="ジャンル別正解率と習得率の棒グラフ"
        >
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = padT + innerH - (tick / 100) * innerH;
            return (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={y}
                  x2={w - padR}
                  y2={y}
                  stroke="rgba(197,160,89,0.16)"
                  strokeDasharray={tick === 0 ? undefined : '3 3'}
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#9e9285"
                  fontSize="11"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {genreStats.map((g, i) => {
            const cx = padL + slotW * i + slotW / 2;
            const accVal = g.accuracyPct ?? 0;
            const accH = (accVal / 100) * innerH;
            const masH = (g.masteryPct / 100) * innerH;
            const isActive = hoveredIdx === i;

            return (
              <g
                key={g.genre}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={padL + slotW * i + 2}
                  y={padT}
                  width={slotW - 4}
                  height={innerH}
                  rx={6}
                  fill={isActive ? 'rgba(212,175,55,0.08)' : 'transparent'}
                />
                {/* Accuracy Bar */}
                <rect
                  x={cx - barW - 3}
                  y={padT + innerH - accH}
                  width={barW}
                  height={Math.max(accH, g.attempts > 0 ? 3 : 0)}
                  rx={4}
                  fill={g.attempts > 0 ? '#d4af37' : 'rgba(197,160,89,0.2)'}
                />
                <text
                  x={cx - barW / 2 - 3}
                  y={padT + innerH - accH - 6}
                  textAnchor="middle"
                  fill={g.attempts > 0 ? '#f3e5ab' : '#7d7267'}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {g.accuracyPct !== null ? `${Math.round(g.accuracyPct)}%` : '--'}
                </text>

                {/* Mastery Bar */}
                <rect
                  x={cx + 3}
                  y={padT + innerH - masH}
                  width={barW}
                  height={Math.max(masH, g.masteredCount > 0 ? 3 : 0)}
                  rx={4}
                  fill="#34d399"
                />
                <text
                  x={cx + barW / 2 + 3}
                  y={padT + innerH - masH - 6}
                  textAnchor="middle"
                  fill="#a7f3d0"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {Math.round(g.masteryPct)}%
                </text>

                <text
                  x={cx}
                  y={padT + innerH + 20}
                  textAnchor="middle"
                  fill={isActive ? '#ffd700' : '#dfd7c8'}
                  fontSize="11"
                  fontWeight="bold"
                >
                  {g.shortLabel}
                </text>
                <text
                  x={cx}
                  y={padT + innerH + 36}
                  textAnchor="middle"
                  fill="#8c8075"
                  fontSize="10"
                >
                  ({g.attempts}回)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hovered && (
        <div className="rounded-lg border border-[#c5a059]/40 bg-[#17121c] px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <span className="font-bold text-[#f3e5ab]">{hovered.genre}</span>
          <span className="text-[#dfd7c8]">
            正解率:{' '}
            <strong className="text-[#ffd700]">
              {hovered.accuracyPct !== null ? `${hovered.accuracyPct}%` : '未解答'}
            </strong>{' '}
            ({hovered.correct}/{hovered.attempts}) ／ 習得率:{' '}
            <strong className="text-emerald-300">{hovered.masteryPct}%</strong> (
            {hovered.masteredCount}/{hovered.totalQuestionsInBank}問)
          </span>
        </div>
      )}
    </div>
  );
}

function LineChartSection({
  summary,
}: {
  summary: LearningAnalyticsSummary;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const points = summary.timeSeries;

  if (points.length === 0) {
    return (
      <EmptyChartNotice message="まだ解答履歴がありません。問題に挑戦すると、日別またはセッションごとの正解率と累計習得率の推移が折れ線グラフで描かれます。" />
    );
  }

  const w = 680;
  const h = 290;
  const padL = 48;
  const padR = 26;
  const padT = 26;
  const padB = 56;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const getX = (idx: number) =>
    points.length === 1
      ? padL + innerW / 2
      : padL + (idx / (points.length - 1)) * innerW;
  const getY = (pct: number) => padT + innerH - (pct / 100) * innerH;

  const accPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.accuracyPct)}`)
    .join(' ');
  const masPath = points
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.cumulativeMasteredPct)}`
    )
    .join(' ');

  const hovered = hoveredIdx !== null ? points[hoveredIdx] : null;
  const labelStride = Math.max(1, Math.ceil(points.length / 8));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a69a8c]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#ffd700] inline-block" />
            <span className="text-[#f3e5ab]">期間別 正解率 (%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-emerald-400 inline-block" />
            <span className="text-emerald-200">累計 バンク習得率 (%)</span>
          </span>
        </div>
        <span className="text-[11px] text-[#9e9285]">
          各点にカーソルを合わせると数値を確認できます
        </span>
      </div>

      <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-3 sm:p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full min-w-[500px] h-auto select-none"
          role="img"
          aria-label="学習推移の折れ線グラフ"
        >
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={y}
                  x2={w - padR}
                  y2={y}
                  stroke="rgba(197,160,89,0.16)"
                  strokeDasharray={tick === 0 ? undefined : '3 3'}
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#9e9285"
                  fontSize="11"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {points.length > 1 && (
            <>
              <path
                d={masPath}
                fill="none"
                stroke="#34d399"
                strokeWidth="2.4"
                strokeDasharray="5 4"
              />
              <path
                d={accPath}
                fill="none"
                stroke="#ffd700"
                strokeWidth="2.8"
              />
            </>
          )}

          {points.map((p, i) => {
            const x = getX(i);
            const yAcc = getY(p.accuracyPct);
            const yMas = getY(p.cumulativeMasteredPct);
            const isActive = hoveredIdx === i;

            return (
              <g
                key={`${p.label}-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {isActive && (
                  <line
                    x1={x}
                    y1={padT}
                    x2={x}
                    y2={padT + innerH}
                    stroke="rgba(255,215,0,0.35)"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={x}
                  cy={yMas}
                  r={isActive ? 6 : 4.2}
                  fill="#10b981"
                  stroke="#0d0a11"
                  strokeWidth="1.5"
                />
                <circle
                  cx={x}
                  cy={yAcc}
                  r={isActive ? 6.5 : 4.8}
                  fill="#ffd700"
                  stroke="#0d0a11"
                  strokeWidth="1.5"
                />
                {(points.length <= 8 ||
                  i % labelStride === 0 ||
                  i === points.length - 1) && (
                  <text
                    x={x}
                    y={padT + innerH + 22}
                    textAnchor="middle"
                    fill={isActive ? '#ffd700' : '#dfd7c8'}
                    fontSize="11"
                  >
                    {p.label}
                  </text>
                )}
                <circle cx={x} cy={yAcc} r={14} fill="transparent" />
              </g>
            );
          })}
        </svg>
      </div>

      {hovered && (
        <div className="rounded-lg border border-[#c5a059]/40 bg-[#17121c] px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <span className="font-bold text-[#f3e5ab]">
            区間 {hovered.label}（解答 {hovered.attempts} 回）
          </span>
          <span className="text-[#dfd7c8]">
            正解率:{' '}
            <strong className="text-[#ffd700]">{hovered.accuracyPct}%</strong> (
            {hovered.correct}正解 / {hovered.wrong}不正解) ／ 累計習得率:{' '}
            <strong className="text-emerald-300">
              {hovered.cumulativeMasteredPct}%
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

function PieAndBandChartSection({
  summary,
}: {
  summary: LearningAnalyticsSummary;
}) {
  const total = Math.max(1, summary.totalUniqueQuestions);
  const slices = [
    {
      label: '習得済み',
      count: summary.masteredCount,
      pct: Math.round((summary.masteredCount / total) * 1000) / 10,
      color: '#10b981',
      textClass: 'text-emerald-300',
    },
    {
      label: '復習対象',
      count: summary.inReviewCount,
      pct: Math.round((summary.inReviewCount / total) * 1000) / 10,
      color: '#f43f5e',
      textClass: 'text-rose-300',
    },
    {
      label: '未着手',
      count: summary.unattemptedCount,
      pct: Math.round((summary.unattemptedCount / total) * 1000) / 10,
      color: '#473e52',
      textClass: 'text-[#c9beae]',
    },
  ];

  // SVG Donut Pie geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let cumulativeFraction = 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        {/* Donut Pie Chart */}
        <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-5 flex flex-col sm:flex-row items-center justify-center gap-6">
          <svg
            viewBox="0 0 180 180"
            className="w-40 h-40 shrink-0 select-none"
            role="img"
            aria-label="全体の習得状況円グラフ"
          >
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="#241e2b"
              strokeWidth="24"
            />
            {slices.map((s) => {
              const frac = s.count / total;
              if (frac <= 0) return null;
              const dashLen = frac * circumference;
              const dashOffset = -cumulativeFraction * circumference;
              cumulativeFraction += frac;
              return (
                <circle
                  key={s.label}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="24"
                  strokeDasharray={`${dashLen} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 90 90)"
                />
              );
            })}
            <text
              x="90"
              y="84"
              textAnchor="middle"
              fill="#a69a8c"
              fontSize="11"
            >
              覚えた割合
            </text>
            <text
              x="90"
              y="105"
              textAnchor="middle"
              fill="#f3e5ab"
              fontSize="20"
              fontWeight="bold"
            >
              {summary.learnedPercent}%
            </text>
          </svg>

          <div className="space-y-2.5 w-full">
            <h4 className="text-xs font-bold text-[#d4af37] tracking-wider">
              全収録問題（{summary.totalUniqueQuestions}問）の構成比
            </h4>
            {slices.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between text-xs border-b border-[#c5a059]/15 pb-1.5"
              >
                <span className="inline-flex items-center gap-2 text-[#dfd7c8]">
                  <span
                    className="w-3 h-3 rounded-sm inline-block"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </span>
                <span className={`font-bold ${s.textClass}`}>
                  {s.count}問 ({s.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Band Charts (帯グラフ) */}
        <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-5 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#d4af37]">
                帯グラフ①：全問題の習得ステータス
              </span>
              <span className="text-[#9e9285]">
                計 {summary.totalUniqueQuestions} 問
              </span>
            </div>
            <div className="h-7 w-full rounded-lg overflow-hidden border border-[#c5a059]/40 flex bg-[#1a151f] text-[10px] font-bold">
              {slices.map((s) =>
                s.pct > 0 ? (
                  <div
                    key={s.label}
                    style={{
                      width: `${s.pct}%`,
                      backgroundColor: s.color,
                    }}
                    title={`${s.label}: ${s.count}問 (${s.pct}%)`}
                    className="h-full flex items-center justify-center text-white/95 truncate px-1 transition-all duration-300"
                  >
                    {s.pct >= 12 ? `${s.label} ${s.pct}%` : ''}
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#d4af37]">
                帯グラフ②：平均正解率・不正解率
              </span>
              <span className="text-[#9e9285]">
                総解答 {summary.totalAttempts} 回
              </span>
            </div>
            {summary.totalAttempts > 0 ? (
              <>
                <div className="h-7 w-full rounded-lg overflow-hidden border border-[#c5a059]/40 flex bg-[#1a151f] text-[10px] font-bold">
                  <div
                    style={{ width: `${summary.avgAccuracyPercent ?? 0}%` }}
                    className="h-full bg-emerald-600 flex items-center justify-center text-white px-1 truncate"
                  >
                    {(summary.avgAccuracyPercent ?? 0) >= 14
                      ? `正解 ${summary.avgAccuracyPercent}%`
                      : ''}
                  </div>
                  <div
                    style={{ width: `${summary.avgWrongPercent ?? 0}%` }}
                    className="h-full bg-rose-600 flex items-center justify-center text-white px-1 truncate"
                  >
                    {(summary.avgWrongPercent ?? 0) >= 14
                      ? `不正解 ${summary.avgWrongPercent}%`
                      : ''}
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-[#a69a8c]">
                  <span className="text-emerald-300">
                    正解 {summary.totalCorrect} 回 ({summary.avgAccuracyPercent}%)
                  </span>
                  <span className="text-rose-300">
                    不正解 {summary.totalWrong} 回 ({summary.avgWrongPercent}%)
                  </span>
                </div>
              </>
            ) : (
              <div className="h-7 w-full rounded-lg border border-[#c5a059]/25 bg-[#17121c] flex items-center justify-center text-[11px] text-[#8c8075]">
                解答履歴が増えると正誤比率の帯グラフが表示されます
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StackedBarChartSection({
  summary,
}: {
  summary: LearningAnalyticsSummary;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const genreStats = summary.genreStats;
  const maxAttempts = Math.max(
    4,
    ...genreStats.map((g) => g.attempts)
  );
  const yCeiling = Math.ceil(maxAttempts / 4) * 4;

  const w = 680;
  const h = 300;
  const padL = 46;
  const padR = 20;
  const padT = 26;
  const padB = 64;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const slotW = innerW / Math.max(1, genreStats.length);
  const barW = Math.min(42, slotW * 0.48);

  const hovered = hoveredIdx !== null ? genreStats[hoveredIdx] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a69a8c]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-emerald-200">正解回数</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
            <span className="text-rose-200">不正解回数</span>
          </span>
        </div>
        <span className="text-[11px] text-[#9e9285]">
          合計解答数と正誤の内訳を積み上げて表示
        </span>
      </div>

      <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-3 sm:p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full min-w-[520px] h-auto select-none"
          role="img"
          aria-label="ジャンル別解答数の積み上げ棒グラフ"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(yCeiling * ratio);
            const y = padT + innerH - ratio * innerH;
            return (
              <g key={ratio}>
                <line
                  x1={padL}
                  y1={y}
                  x2={w - padR}
                  y2={y}
                  stroke="rgba(197,160,89,0.16)"
                  strokeDasharray={ratio === 0 ? undefined : '3 3'}
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#9e9285"
                  fontSize="11"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {genreStats.map((g, i) => {
            const cx = padL + slotW * i + slotW / 2;
            const correctH = (g.correct / yCeiling) * innerH;
            const wrongH = (g.wrong / yCeiling) * innerH;
            const totalH = correctH + wrongH;
            const isActive = hoveredIdx === i;

            return (
              <g
                key={g.genre}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={padL + slotW * i + 2}
                  y={padT}
                  width={slotW - 4}
                  height={innerH}
                  rx={6}
                  fill={isActive ? 'rgba(212,175,55,0.08)' : 'transparent'}
                />
                {/* Correct base segment */}
                {g.correct > 0 && (
                  <rect
                    x={cx - barW / 2}
                    y={padT + innerH - correctH}
                    width={barW}
                    height={correctH}
                    fill="#10b981"
                  />
                )}
                {/* Wrong top segment */}
                {g.wrong > 0 && (
                  <rect
                    x={cx - barW / 2}
                    y={padT + innerH - totalH}
                    width={barW}
                    height={wrongH}
                    fill="#f43f5e"
                  />
                )}
                {g.attempts === 0 && (
                  <rect
                    x={cx - barW / 2}
                    y={padT + innerH - 3}
                    width={barW}
                    height={3}
                    fill="rgba(197,160,89,0.22)"
                  />
                )}
                <text
                  x={cx}
                  y={padT + innerH - totalH - 6}
                  textAnchor="middle"
                  fill={g.attempts > 0 ? '#f3e5ab' : '#7d7267'}
                  fontSize="11"
                  fontWeight="bold"
                >
                  {g.attempts}回
                </text>
                <text
                  x={cx}
                  y={padT + innerH + 20}
                  textAnchor="middle"
                  fill={isActive ? '#ffd700' : '#dfd7c8'}
                  fontSize="11"
                  fontWeight="bold"
                >
                  {g.shortLabel}
                </text>
                <text
                  x={cx}
                  y={padT + innerH + 36}
                  textAnchor="middle"
                  fill="#8c8075"
                  fontSize="10"
                >
                  (収録{g.totalQuestionsInBank}問)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hovered && (
        <div className="rounded-lg border border-[#c5a059]/40 bg-[#17121c] px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <span className="font-bold text-[#f3e5ab]">{hovered.genre}</span>
          <span className="text-[#dfd7c8]">
            合計 <strong className="text-[#f3e5ab]">{hovered.attempts}回</strong>{' '}
            （正解 <strong className="text-emerald-300">{hovered.correct}</strong>{' '}
            ／ 不正解 <strong className="text-rose-300">{hovered.wrong}</strong>）
          </span>
        </div>
      )}
    </div>
  );
}

function ScatterChartSection({
  summary,
}: {
  summary: LearningAnalyticsSummary;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);
  const points = summary.scatterPoints;

  if (points.length === 0) {
    return (
      <EmptyChartNotice message="まだ解答履歴がありません。問題に回答すると、解答時間（秒）と正誤スコアの相関が散布図としてプロットされます。" />
    );
  }

  const w = 680;
  const h = 285;
  const padL = 56;
  const padR = 26;
  const padT = 24;
  const padB = 48;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const maxSec = Math.max(20, ...points.map((p) => p.durationSec));
  const xCeiling = Math.ceil(maxSec / 10) * 10;

  const getX = (sec: number) => padL + (Math.min(sec, xCeiling) / xCeiling) * innerW;
  const getY = (p: ScatterPoint) => {
    // Spread vertically within Correct band (72-92) and Wrong band (8-28) deterministically to prevent overlap
    const offset = ((p.index * 11) % 17) - 8;
    const scoreY = p.isCorrect ? 82 + offset : 18 + offset;
    return padT + innerH - (scoreY / 100) * innerH;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a69a8c]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            <span className="text-emerald-200">正解</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
            <span className="text-rose-200">不正解</span>
          </span>
        </div>
        <span className="text-xs font-semibold text-[#f3e5ab]">
          直近 {points.length} 問 ／ 時間×正答 相関係数 r ={' '}
          {summary.scatterCorrelation !== null
            ? summary.scatterCorrelation.toFixed(2)
            : '計測中 (3問以上)'}
        </span>
      </div>

      <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-3 sm:p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full min-w-[500px] h-auto select-none"
          role="img"
          aria-label="解答時間と正誤の散布図"
        >
          {/* Reference bands */}
          <line
            x1={padL}
            y1={padT + innerH * 0.5}
            x2={w - padR}
            y2={padT + innerH * 0.5}
            stroke="rgba(197,160,89,0.22)"
            strokeDasharray="4 4"
          />
          <text
            x={padL - 8}
            y={padT + innerH * 0.18 + 4}
            textAnchor="end"
            fill="#34d399"
            fontSize="11"
            fontWeight="bold"
          >
            正解群
          </text>
          <text
            x={padL - 8}
            y={padT + innerH * 0.82 + 4}
            textAnchor="end"
            fill="#fb7185"
            fontSize="11"
            fontWeight="bold"
          >
            不正解群
          </text>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const sec = Math.round(xCeiling * ratio);
            const x = padL + ratio * innerW;
            return (
              <g key={ratio}>
                <line
                  x1={x}
                  y1={padT}
                  x2={x}
                  y2={padT + innerH}
                  stroke="rgba(197,160,89,0.12)"
                  strokeDasharray="3 3"
                />
                <text
                  x={x}
                  y={padT + innerH + 18}
                  textAnchor="middle"
                  fill="#9e9285"
                  fontSize="11"
                >
                  {sec}秒
                </text>
              </g>
            );
          })}

          <text
            x={padL + innerW / 2}
            y={h - 8}
            textAnchor="middle"
            fill="#c5a059"
            fontSize="11"
          >
            解答時間（秒）
          </text>

          {points.map((p) => {
            const cx = getX(p.durationSec);
            const cy = getY(p);
            const isActive = hoveredPoint?.index === p.index;
            return (
              <circle
                key={`${p.label}-${p.index}`}
                cx={cx}
                cy={cy}
                r={isActive ? 7.5 : 5}
                fill={p.isCorrect ? '#34d399' : '#fb7185'}
                fillOpacity={0.85}
                stroke={isActive ? '#ffd700' : '#0d0a11'}
                strokeWidth={isActive ? 2 : 1.2}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer transition-all"
              />
            );
          })}
        </svg>
      </div>

      {hoveredPoint && (
        <div className="rounded-lg border border-[#c5a059]/40 bg-[#17121c] px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <span className="font-bold text-[#f3e5ab]">
            解答 {hoveredPoint.label}（{hoveredPoint.genre}）
          </span>
          <span className="text-[#dfd7c8]">
            結果:{' '}
            <strong
              className={
                hoveredPoint.isCorrect ? 'text-emerald-300' : 'text-rose-300'
              }
            >
              {hoveredPoint.isCorrect ? '正解' : '不正解'}
            </strong>{' '}
            ／ 所要時間:{' '}
            <strong className="text-[#ffd700]">
              {hoveredPoint.durationSec}秒
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

function HistogramAndBoxPlotSection({
  summary,
}: {
  summary: LearningAnalyticsSummary;
}) {
  if (summary.totalAttempts === 0) {
    return (
      <EmptyChartNotice message="まだ解答履歴がありません。解答時間のデータが蓄積されると、度数分布ヒストグラムと四分位数（箱ひげ図）が表示されます。" />
    );
  }

  const bins = summary.histogramBins;
  const maxCount = Math.max(4, ...bins.map((b) => b.count));
  const yMax = Math.ceil(maxCount / 4) * 4;

  const hw = 680;
  const hh = 240;
  const hPadL = 44;
  const hPadR = 20;
  const hPadT = 22;
  const hPadB = 42;
  const hInnerW = hw - hPadL - hPadR;
  const hInnerH = hh - hPadT - hPadB;
  const binW = hInnerW / Math.max(1, bins.length);

  // Box plot axis scale
  const allBoxMax = Math.max(10, ...summary.boxPlots.map((b) => b.max));
  const bxMax = Math.ceil(allBoxMax / 10) * 10;
  const bw = 680;
  const bh = 68 + summary.boxPlots.length * 46;
  const bPadL = 78;
  const bPadR = 28;
  const bPadT = 18;
  const bInnerW = bw - bPadL - bPadR;
  const scaleX = (v: number) => bPadL + (Math.min(v, bxMax) / bxMax) * bInnerW;

  return (
    <div className="space-y-5">
      {/* Histogram */}
      <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-3 sm:p-4 space-y-2 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#d4af37]">
            ヒストグラム：解答時間帯ごとの問題数分布
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              正解
            </span>
            <span className="inline-flex items-center gap-1 text-rose-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
              不正解
            </span>
          </div>
        </div>
        <svg
          viewBox={`0 0 ${hw} ${hh}`}
          className="w-full min-w-[500px] h-auto select-none"
          role="img"
          aria-label="解答時間のヒストグラム"
        >
          {[0, 0.5, 1].map((ratio) => {
            const val = Math.round(yMax * ratio);
            const y = hPadT + hInnerH - ratio * hInnerH;
            return (
              <g key={ratio}>
                <line
                  x1={hPadL}
                  y1={y}
                  x2={hw - hPadR}
                  y2={y}
                  stroke="rgba(197,160,89,0.16)"
                  strokeDasharray={ratio === 0 ? undefined : '3 3'}
                />
                <text
                  x={hPadL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#9e9285"
                  fontSize="11"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {bins.map((bin, i) => {
            const x = hPadL + i * binW + 2;
            const width = Math.max(8, binW - 4);
            const cH = (bin.correctCount / yMax) * hInnerH;
            const wH = (bin.wrongCount / yMax) * hInnerH;
            const totH = cH + wH;

            return (
              <g key={bin.label}>
                {bin.correctCount > 0 && (
                  <rect
                    x={x}
                    y={hPadT + hInnerH - cH}
                    width={width}
                    height={cH}
                    fill="#10b981"
                    fillOpacity={0.85}
                  />
                )}
                {bin.wrongCount > 0 && (
                  <rect
                    x={x}
                    y={hPadT + hInnerH - totH}
                    width={width}
                    height={wH}
                    fill="#f43f5e"
                    fillOpacity={0.85}
                  />
                )}
                <text
                  x={x + width / 2}
                  y={hPadT + hInnerH - totH - 6}
                  textAnchor="middle"
                  fill={bin.count > 0 ? '#f3e5ab' : '#7d7267'}
                  fontSize="11"
                  fontWeight="bold"
                >
                  {bin.count}
                </text>
                <text
                  x={x + width / 2}
                  y={hPadT + hInnerH + 20}
                  textAnchor="middle"
                  fill="#dfd7c8"
                  fontSize="11"
                >
                  {bin.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Box Plots */}
      <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-3 sm:p-4 space-y-3 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#d4af37]">
            箱ひげ図：解答時間のばらつき（最小・Q1・中央値・Q3・最大）
          </span>
          <span className="text-[11px] text-[#9e9285]">
            太線＝中央値 ／ ◆＝平均値 ／ 箱＝四分位範囲 (Q1–Q3)
          </span>
        </div>

        <svg
          viewBox={`0 0 ${bw} ${bh}`}
          className="w-full min-w-[500px] h-auto select-none"
          role="img"
          aria-label="解答時間の箱ひげ図"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(bxMax * ratio);
            const x = scaleX(val);
            return (
              <g key={ratio}>
                <line
                  x1={x}
                  y1={bPadT}
                  x2={x}
                  y2={bh - 34}
                  stroke="rgba(197,160,89,0.16)"
                  strokeDasharray="3 3"
                />
                <text
                  x={x}
                  y={bh - 14}
                  textAnchor="middle"
                  fill="#9e9285"
                  fontSize="11"
                >
                  {val}秒
                </text>
              </g>
            );
          })}

          {summary.boxPlots.map((bp: BoxPlotSummary, idx: number) => {
            const cy = bPadT + 24 + idx * 46;
            const xMin = scaleX(bp.min);
            const xQ1 = scaleX(bp.q1);
            const xMed = scaleX(bp.median);
            const xQ3 = scaleX(bp.q3);
            const xMax = scaleX(bp.max);
            const xMean = scaleX(bp.mean);
            const boxFill =
              bp.label === '正解時'
                ? 'rgba(16,185,129,0.3)'
                : bp.label === '不正解時'
                  ? 'rgba(244,63,94,0.3)'
                  : 'rgba(212,175,55,0.28)';
            const boxStroke =
              bp.label === '正解時'
                ? '#34d399'
                : bp.label === '不正解時'
                  ? '#fb7185'
                  : '#d4af37';

            return (
              <g key={bp.label}>
                <text
                  x={bPadL - 10}
                  y={cy + 4}
                  textAnchor="end"
                  fill="#f3e5ab"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {bp.label}
                </text>
                {/* Whisker line */}
                <line
                  x1={xMin}
                  y1={cy}
                  x2={xMax}
                  y2={cy}
                  stroke="#c5a059"
                  strokeWidth="1.8"
                />
                {/* Min / Max caps */}
                <line
                  x1={xMin}
                  y1={cy - 8}
                  x2={xMin}
                  y2={cy + 8}
                  stroke="#c5a059"
                  strokeWidth="1.8"
                />
                <line
                  x1={xMax}
                  y1={cy - 8}
                  x2={xMax}
                  y2={cy + 8}
                  stroke="#c5a059"
                  strokeWidth="1.8"
                />
                {/* IQR Box */}
                <rect
                  x={xQ1}
                  y={cy - 12}
                  width={Math.max(4, xQ3 - xQ1)}
                  height={24}
                  rx={3}
                  fill={boxFill}
                  stroke={boxStroke}
                  strokeWidth="2"
                />
                {/* Median Line */}
                <line
                  x1={xMed}
                  y1={cy - 13}
                  x2={xMed}
                  y2={cy + 13}
                  stroke="#ffd700"
                  strokeWidth="3"
                />
                {/* Mean Diamond */}
                <polygon
                  points={`${xMean},${cy - 5} ${xMean + 5},${cy} ${xMean},${cy + 5} ${xMean - 5},${cy}`}
                  fill="#ffffff"
                  stroke="#0d0a11"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          {summary.boxPlots.map((bp) => (
            <div
              key={bp.label}
              className="rounded-lg border border-[#c5a059]/25 bg-[#151118] px-3 py-2 space-y-1"
            >
              <div className="flex justify-between font-bold text-[#f3e5ab]">
                <span>{bp.label}</span>
                <span>({bp.count}回)</span>
              </div>
              <div className="text-[#c9beae]">
                最小 {bp.min}s ／ Q1 {bp.q1}s ／ 中央{' '}
                <strong className="text-[#ffd700]">{bp.median}s</strong>
              </div>
              <div className="text-[#c9beae]">
                Q3 {bp.q3}s ／ 最大 {bp.max}s ／ 平均 {bp.mean}s
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RadarChartSection({ genreStats }: { genreStats: GenreStats[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const n = Math.max(3, genreStats.length);
  const cx = 250;
  const cy = 185;
  const maxR = 122;

  const angleFor = (idx: number) => -Math.PI / 2 + (idx / n) * Math.PI * 2;
  const pointAt = (idx: number, pct: number) => {
    const r = (pct / 100) * maxR;
    const ang = angleFor(idx);
    return {
      x: cx + Math.cos(ang) * r,
      y: cy + Math.sin(ang) * r,
    };
  };

  const accPolygon = genreStats
    .map((g, i) => {
      const p = pointAt(i, g.accuracyPct ?? 0);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const masPolygon = genreStats
    .map((g, i) => {
      const p = pointAt(i, g.masteryPct);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const hovered = hoveredIdx !== null ? genreStats[hoveredIdx] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a69a8c]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#ffd700]/70 border border-[#ffd700] inline-block" />
            <span className="text-[#f3e5ab]">正解率 (%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-400/50 border border-emerald-400 inline-block" />
            <span className="text-emerald-200">習得率 (%)</span>
          </span>
        </div>
        <span className="text-[11px] text-[#9e9285]">
          6分野の強み・弱みバランスを多角的に表示
        </span>
      </div>

      <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-3 sm:p-4 flex justify-center">
        <svg
          viewBox="0 0 500 370"
          className="w-full max-w-[520px] h-auto select-none"
          role="img"
          aria-label="6ジャンルバランスのレーダーチャート"
        >
          {/* Rings */}
          {[20, 40, 60, 80, 100].map((ring) => {
            const pts = genreStats
              .map((_, i) => {
                const p = pointAt(i, ring);
                return `${p.x},${p.y}`;
              })
              .join(' ');
            return (
              <g key={ring}>
                <polygon
                  points={pts}
                  fill="none"
                  stroke="rgba(197,160,89,0.2)"
                  strokeWidth={ring === 100 ? 1.5 : 1}
                />
                <text
                  x={cx + 5}
                  y={cy - (ring / 100) * maxR + 4}
                  fill="#8c8075"
                  fontSize="9.5"
                >
                  {ring}%
                </text>
              </g>
            );
          })}

          {/* Axes & Labels */}
          {genreStats.map((g, i) => {
            const outer = pointAt(i, 100);
            const labelPos = pointAt(i, 123);
            const ang = angleFor(i);
            const cos = Math.cos(ang);
            const anchor =
              Math.abs(cos) < 0.25 ? 'middle' : cos > 0 ? 'start' : 'end';
            const isActive = hoveredIdx === i;

            return (
              <g key={g.genre}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="rgba(197,160,89,0.25)"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y + 4}
                  textAnchor={anchor}
                  fill={isActive ? '#ffd700' : '#f3e5ab'}
                  fontSize="11.5"
                  fontWeight="bold"
                >
                  {g.shortLabel}
                </text>
              </g>
            );
          })}

          {/* Mastery Polygon */}
          <polygon
            points={masPolygon}
            fill="rgba(52,211,153,0.18)"
            stroke="#34d399"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          {/* Accuracy Polygon */}
          <polygon
            points={accPolygon}
            fill="rgba(255,215,0,0.22)"
            stroke="#ffd700"
            strokeWidth="2.4"
          />

          {/* Interactive vertices */}
          {genreStats.map((g, i) => {
            const pAcc = pointAt(i, g.accuracyPct ?? 0);
            const pMas = pointAt(i, g.masteryPct);
            const isActive = hoveredIdx === i;
            return (
              <g
                key={`${g.genre}-pts`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pMas.x}
                  cy={pMas.y}
                  r={isActive ? 5.5 : 4}
                  fill="#34d399"
                  stroke="#0d0a11"
                  strokeWidth="1.2"
                />
                <circle
                  cx={pAcc.x}
                  cy={pAcc.y}
                  r={isActive ? 6 : 4.5}
                  fill="#ffd700"
                  stroke="#0d0a11"
                  strokeWidth="1.2"
                />
                <circle cx={pAcc.x} cy={pAcc.y} r={14} fill="transparent" />
              </g>
            );
          })}
        </svg>
      </div>

      {hovered && (
        <div className="rounded-lg border border-[#c5a059]/40 bg-[#17121c] px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <span className="font-bold text-[#f3e5ab]">{hovered.genre}</span>
          <span className="text-[#dfd7c8]">
            正解率:{' '}
            <strong className="text-[#ffd700]">
              {hovered.accuracyPct !== null ? `${hovered.accuracyPct}%` : '未解答'}
            </strong>{' '}
            ／ 習得率:{' '}
            <strong className="text-emerald-300">{hovered.masteryPct}%</strong>
          </span>
        </div>
      )}
    </div>
  );
}

export function LearningAnalyticsView({
  summary,
}: LearningAnalyticsViewProps) {
  const [selectedChart, setSelectedChart] = useState<AnalyticsChartType>('all');
  const currentOption = useMemo(
    () =>
      CHART_OPTIONS.find((opt) => opt.value === selectedChart) ??
      CHART_OPTIONS[0],
    [selectedChart]
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="antique-card rounded-2xl p-6 sm:p-8 space-y-7">
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-[#d4af37] font-bold px-4 py-1 bg-[#261829] rounded-full border border-[#c5a059]/40">
            ✦ 叡智の分析録 ✦
          </span>
          <h2 className="classic-title text-2xl sm:text-3xl font-bold text-[#f3e5ab]">
            学習データ分析
          </h2>
          <p className="text-xs sm:text-sm text-[#a69a8c]">
            全 {summary.totalUniqueQuestions}{' '}
            問に対する習得進捗・平均正誤率・ジャンル別の得意不得意を7種類の基本グラフで確認できます。
          </p>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* KPI 1: Mastery */}
          <div className="rounded-xl border border-[#c5a059]/40 bg-[#120e16]/90 p-4 space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#c5a059] tracking-wider">
                📚 覚えた割合（全体習得率）
              </span>
              <span className="text-[11px] text-[#9e9285]">
                {summary.masteredCount} / {summary.totalUniqueQuestions} 問
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#f3e5ab]">
                {summary.learnedPercent}%
              </span>
              <span className="text-xs text-[#a69a8c]">
                （復習中 {summary.inReviewCount}問 ／ 未着手{' '}
                {summary.unattemptedCount}問）
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden bg-[#241c2d] flex">
              <div
                style={{ width: `${summary.learnedPercent}%` }}
                className="bg-emerald-500 h-full"
              />
              <div
                style={{
                  width: `${
                    summary.totalUniqueQuestions > 0
                      ? (summary.inReviewCount / summary.totalUniqueQuestions) *
                        100
                      : 0
                  }%`,
                }}
                className="bg-rose-500 h-full"
              />
            </div>
          </div>

          {/* KPI 2: Avg Accuracy / Wrong */}
          <div className="rounded-xl border border-[#c5a059]/40 bg-[#120e16]/90 p-4 space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#c5a059] tracking-wider">
                ⚖️ 平均正解率 ／ 平均不正解率
              </span>
              <span className="text-[11px] text-[#9e9285]">
                総解答 {summary.totalAttempts} 回
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-[11px] text-emerald-300 block">正解</span>
                <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
                  {summary.avgAccuracyPercent !== null
                    ? `${summary.avgAccuracyPercent}%`
                    : '--%'}
                </span>
              </div>
              <span className="text-[#6e6359] text-lg">/</span>
              <div>
                <span className="text-[11px] text-rose-300 block">不正解</span>
                <span className="text-2xl sm:text-3xl font-bold text-rose-400">
                  {summary.avgWrongPercent !== null
                    ? `${summary.avgWrongPercent}%`
                    : '--%'}
                </span>
              </div>
              <span className="text-xs text-[#a69a8c] ml-auto">
                正解 {summary.totalCorrect} ・ 不正解 {summary.totalWrong}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden bg-[#241c2d] flex">
              <div
                style={{ width: `${summary.avgAccuracyPercent ?? 0}%` }}
                className="bg-emerald-500 h-full"
              />
              <div
                style={{ width: `${summary.avgWrongPercent ?? 0}%` }}
                className="bg-rose-500 h-full"
              />
            </div>
          </div>

          {/* KPI 3: Best Genre */}
          <div className="rounded-xl border border-emerald-500/35 bg-[#0f1d18]/85 p-4 space-y-1.5 shadow-inner">
            <span className="text-xs font-bold text-emerald-300 tracking-wider block">
              👑 得意なジャンル
            </span>
            <p className="text-base sm:text-lg font-bold text-[#f3e5ab]">
              {summary.bestGenre ? summary.bestGenre.genre : '計測待ち'}
            </p>
            <p className="text-xs text-[#b8cfc6]">
              {summary.bestGenre
                ? `正解率 ${summary.bestGenre.accuracyPct}%（${summary.bestGenre.correct}/${summary.bestGenre.attempts}問） ／ 習得率 ${summary.bestGenre.masteryPct}%`
                : '問題に挑戦すると最も正答率の高いジャンルが表示されます'}
            </p>
          </div>

          {/* KPI 4: Weakest Genre */}
          <div className="rounded-xl border border-rose-500/35 bg-[#221118]/85 p-4 space-y-1.5 shadow-inner">
            <span className="text-xs font-bold text-rose-300 tracking-wider block">
              🕯️ 苦手なジャンル
            </span>
            <p className="text-base sm:text-lg font-bold text-[#f3e5ab]">
              {summary.weakestGenre
                ? summary.weakestGenre.genre
                : summary.bestGenre
                  ? '目立った苦手なし'
                  : '計測待ち'}
            </p>
            <p className="text-xs text-[#d6b8c0]">
              {summary.weakestGenre
                ? `正解率 ${summary.weakestGenre.accuracyPct}%（不正解 ${summary.weakestGenre.wrong}回 ／ 復習 ${summary.weakestGenre.inReviewCount}問）`
                : summary.bestGenre
                  ? '複数ジャンルに挑戦すると弱点分析がより精密になります'
                  : '問題に挑戦すると重点的に復習すべきジャンルが表示されます'}
            </p>
          </div>
        </div>

        {/* Study Calendar (Automatic Solving Time) */}
        <StudyCalendarPanel dailyQuizStats={summary.dailyQuizStats} />

        {/* Dropdown Chart Selector */}
        <div className="rounded-xl border border-[#c5a059]/45 bg-[#120e16]/90 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label
                htmlFor="analytics-chart-select"
                className="text-xs font-bold text-[#d4af37] tracking-wider block"
              >
                表示するグラフを選択
              </label>
              <p className="text-xs text-[#a69a8c]">{currentOption.subtitle}</p>
            </div>
            <select
              id="analytics-chart-select"
              value={selectedChart}
              onChange={(e) => {
                playRadioButtonSfx('ui_click');
                setSelectedChart(e.target.value as AnalyticsChartType);
              }}
              className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl bg-[#1b1522] border border-[#c5a059]/70 text-[#f3e5ab] text-xs sm:text-sm font-bold focus:outline-none focus:border-[#ffd700] cursor-pointer"
            >
              {CHART_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {selectedChart === 'bar' && (
            <BarChartSection genreStats={summary.genreStats} />
          )}
          {selectedChart === 'line' && <LineChartSection summary={summary} />}
          {selectedChart === 'pie_band' && (
            <PieAndBandChartSection summary={summary} />
          )}
          {selectedChart === 'stacked_bar' && (
            <StackedBarChartSection summary={summary} />
          )}
          {selectedChart === 'scatter' && (
            <ScatterChartSection summary={summary} />
          )}
          {selectedChart === 'hist_box' && (
            <HistogramAndBoxPlotSection summary={summary} />
          )}
          {selectedChart === 'radar' && (
            <RadarChartSection genreStats={summary.genreStats} />
          )}
          {selectedChart === 'all' && (
            <div className="space-y-8 pt-2">
              <div className="space-y-2 border-t border-[#c5a059]/25 pt-5">
                <h3 className="text-sm font-bold text-[#f3e5ab]">
                  1. 棒グラフ（ジャンル別の正解率・習得率比較）
                </h3>
                <BarChartSection genreStats={summary.genreStats} />
              </div>
              <div className="space-y-2 border-t border-[#c5a059]/25 pt-5">
                <h3 className="text-sm font-bold text-[#f3e5ab]">
                  2. 折れ線グラフ（時間経過によるトレンド）
                </h3>
                <LineChartSection summary={summary} />
              </div>
              <div className="space-y-2 border-t border-[#c5a059]/25 pt-5">
                <h3 className="text-sm font-bold text-[#f3e5ab]">
                  3. 円グラフ・帯グラフ（全体に対する割合・構成比）
                </h3>
                <PieAndBandChartSection summary={summary} />
              </div>
              <div className="space-y-2 border-t border-[#c5a059]/25 pt-5">
                <h3 className="text-sm font-bold text-[#f3e5ab]">
                  4. 積み上げ棒グラフ（合計値と内訳の比較）
                </h3>
                <StackedBarChartSection summary={summary} />
              </div>
              <div className="space-y-2 border-t border-[#c5a059]/25 pt-5">
                <h3 className="text-sm font-bold text-[#f3e5ab]">
                  5. 散布図（解答時間と正誤の相関）
                </h3>
                <ScatterChartSection summary={summary} />
              </div>
              <div className="space-y-2 border-t border-[#c5a059]/25 pt-5">
                <h3 className="text-sm font-bold text-[#f3e5ab]">
                  6. ヒストグラム・箱ひげ図（分布・中央値・四分位数）
                </h3>
                <HistogramAndBoxPlotSection summary={summary} />
              </div>
              <div className="space-y-2 border-t border-[#c5a059]/25 pt-5">
                <h3 className="text-sm font-bold text-[#f3e5ab]">
                  7. レーダーチャート（複数ジャンルのバランス）
                </h3>
                <RadarChartSection genreStats={summary.genreStats} />
              </div>
            </div>
          )}
        </div>

        {/* Genre Breakdown Table */}
        <div className="rounded-xl border border-[#c5a059]/35 bg-[#120e16]/90 p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#d4af37] tracking-wider">
            📑 ジャンル別 詳細データ
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-[#c5a059]/30 text-[#c5a059]">
                  <th className="py-2 pr-3 font-bold">ジャンル</th>
                  <th className="py-2 px-2 text-right font-bold">収録</th>
                  <th className="py-2 px-2 text-right font-bold">習得</th>
                  <th className="py-2 px-2 text-right font-bold">復習</th>
                  <th className="py-2 px-2 text-right font-bold">解答数</th>
                  <th className="py-2 px-2 text-right font-bold">正解率</th>
                  <th className="py-2 pl-2 text-right font-bold">平均時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5a059]/15">
                {summary.genreStats.map((g) => (
                  <tr
                    key={g.genre}
                    className="hover:bg-[#1c1624]/70 transition-colors"
                  >
                    <td className="py-2.5 pr-3 font-semibold text-[#f3e5ab]">
                      {g.genre}
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#a69a8c]">
                      {g.totalQuestionsInBank}問
                    </td>
                    <td className="py-2.5 px-2 text-right text-emerald-300 font-semibold">
                      {g.masteredCount}問
                    </td>
                    <td className="py-2.5 px-2 text-right text-rose-300 font-semibold">
                      {g.inReviewCount}問
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#dfd7c8]">
                      {g.attempts}回
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-[#ffd700]">
                      {g.accuracyPct !== null ? `${g.accuracyPct}%` : '--'}
                    </td>
                    <td className="py-2.5 pl-2 text-right text-[#c9beae]">
                      {g.avgDurationSec !== null ? `${g.avgDurationSec}秒` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
