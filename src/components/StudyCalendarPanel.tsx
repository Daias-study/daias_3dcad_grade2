import { useMemo, useState } from 'react';
import {
  formatDateKey,
  toDateKey,
  type DailyQuizStats,
} from '../utils/analyticsUtils';
import { playRadioButtonSfx } from '../utils/radioSfx';

interface StudyCalendarPanelProps {
  dailyQuizStats: Record<string, DailyQuizStats>;
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;
const MIN_CALENDAR_YEAR = 2026;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function formatHoursMinutesDetailed(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0時間0分';
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const remSeconds = totalSeconds % 60;

  if (totalMinutes === 0) {
    return `0時間0分（${remSeconds}秒）`;
  }
  if (hours === 0) {
    return remSeconds > 0
      ? `${minutes}分${remSeconds}秒`
      : `${minutes}分`;
  }
  return `${hours}時間${minutes}分`;
}

function formatCompactCellDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '';
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes === 0) {
    return `${totalSeconds}秒`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}時間${minutes}分`;
  if (hours > 0) return `${hours}時間`;
  return `${minutes}分`;
}

export function StudyCalendarPanel({
  dailyQuizStats,
}: StudyCalendarPanelProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);

  const [selectedYear, setSelectedYear] = useState<number>(() =>
    Math.max(MIN_CALENDAR_YEAR, today.getFullYear())
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(() =>
    today.getFullYear() < MIN_CALENDAR_YEAR ? 1 : today.getMonth() + 1
  );
  const [selectedDay, setSelectedDay] = useState<number>(() =>
    today.getFullYear() < MIN_CALENDAR_YEAR ? 1 : today.getDate()
  );

  const daysInSelectedMonth = useMemo(
    () => getDaysInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const clampedDay = Math.min(selectedDay, daysInSelectedMonth);
  const selectedDateKey = formatDateKey(selectedYear, selectedMonth, clampedDay);
  const selectedWeekday =
    WEEKDAY_LABELS[
      new Date(selectedYear, selectedMonth - 1, clampedDay).getDay()
    ];

  // Dynamic year dropdown options from 2026 onward (up to current + 2 years, plus selected/recorded years >= 2026)
  const yearOptions = useMemo(() => {
    const baseYear = Math.max(MIN_CALENDAR_YEAR, today.getFullYear());
    const set = new Set<number>();
    for (let y = MIN_CALENDAR_YEAR; y <= baseYear + 2; y++) {
      set.add(y);
    }
    if (selectedYear >= MIN_CALENDAR_YEAR) {
      set.add(selectedYear);
    }
    for (const k of Object.keys(dailyQuizStats)) {
      const y = Number.parseInt(k.slice(0, 4), 10);
      if (!Number.isNaN(y) && y >= MIN_CALENDAR_YEAR) set.add(y);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [today, selectedYear, dailyQuizStats]);

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1),
    []
  );
  const dayOptions = useMemo(
    () => Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1),
    [daysInSelectedMonth]
  );

  // Build monthly calendar grid cells
  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const cells: Array<number | null> = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInSelectedMonth; d++) {
      cells.push(d);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [selectedYear, selectedMonth, daysInSelectedMonth]);

  // Monthly automatic totals from solved problems
  const monthlySummary = useMemo(() => {
    const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-`;
    let totalDurationSec = 0;
    let totalAttempts = 0;
    let studyDays = 0;

    for (let d = 1; d <= daysInSelectedMonth; d++) {
      const key = `${prefix}${String(d).padStart(2, '0')}`;
      const stat = dailyQuizStats[key];
      if (stat && stat.attempts > 0) {
        studyDays += 1;
        totalDurationSec += stat.durationSec;
        totalAttempts += stat.attempts;
      }
    }

    return {
      totalDurationSec,
      totalAttempts,
      studyDays,
    };
  }, [selectedYear, selectedMonth, daysInSelectedMonth, dailyQuizStats]);

  const selectedStat = dailyQuizStats[selectedDateKey];
  const selectedAccuracyPct =
    selectedStat && selectedStat.attempts > 0
      ? Math.round((selectedStat.correct / selectedStat.attempts) * 1000) / 10
      : null;

  const isAtMinMonth =
    selectedYear <= MIN_CALENDAR_YEAR && selectedMonth <= 1;

  const handleYearChange = (nextYear: number) => {
    playRadioButtonSfx('ui_click');
    const safeYear = Math.max(MIN_CALENDAR_YEAR, nextYear);
    const maxDay = getDaysInMonth(safeYear, selectedMonth);
    setSelectedYear(safeYear);
    if (selectedDay > maxDay) setSelectedDay(maxDay);
  };

  const handleMonthChange = (nextMonth: number) => {
    playRadioButtonSfx('ui_click');
    const maxDay = getDaysInMonth(selectedYear, nextMonth);
    setSelectedMonth(nextMonth);
    if (selectedDay > maxDay) setSelectedDay(maxDay);
  };

  const handleDayChange = (nextDay: number) => {
    playRadioButtonSfx('ui_click');
    setSelectedDay(nextDay);
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(selectedYear, selectedMonth - 1 + delta, 1);
    const nextY = d.getFullYear();
    if (nextY < MIN_CALENDAR_YEAR) return;
    playRadioButtonSfx('ui_click');
    const nextM = d.getMonth() + 1;
    const maxD = getDaysInMonth(nextY, nextM);
    setSelectedYear(nextY);
    setSelectedMonth(nextM);
    setSelectedDay((prev) => Math.min(prev, maxD));
  };

  const jumpToToday = () => {
    playRadioButtonSfx('ui_click');
    const now = new Date();
    if (now.getFullYear() < MIN_CALENDAR_YEAR) {
      setSelectedYear(MIN_CALENDAR_YEAR);
      setSelectedMonth(1);
      setSelectedDay(1);
      return;
    }
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
    setSelectedDay(now.getDate());
  };

  return (
    <div className="rounded-xl border border-[#c5a059]/45 bg-[#120e16]/90 p-4 sm:p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-bold text-[#d4af37] tracking-wider">
            📅 学習カレンダー（自動計測）
          </h3>
          <p className="text-xs text-[#a69a8c]">
            問題を解いた時間（何時間・何分）が日ごとに自動で記録されます。西暦・月・日付のドロップダウンまたはマス目から詳細を確認できます。
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-lg bg-[#1d1624] border border-[#c5a059]/40 text-[#f3e5ab] font-bold shrink-0">
          {selectedYear}年{selectedMonth}月 合計：{' '}
          <span className="text-[#ffd700]">
            {formatHoursMinutesDetailed(monthlySummary.totalDurationSec)}
          </span>
          <span className="text-[#a69a8c] font-normal ml-1.5">
            （{monthlySummary.studyDays}日 ／ {monthlySummary.totalAttempts}問）
          </span>
        </div>
      </div>

      {/* Year / Month / Day Dropdowns + Selected Day Auto Summary */}
      <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/85 p-3.5 sm:p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 flex-grow">
            <div>
              <label
                htmlFor="calendar-year-select"
                className="block text-[11px] font-bold text-[#c5a059] mb-1"
              >
                西暦
              </label>
              <select
                id="calendar-year-select"
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg bg-[#1b1522] border border-[#c5a059]/65 text-[#f3e5ab] text-xs sm:text-sm font-bold focus:outline-none focus:border-[#ffd700] cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="calendar-month-select"
                className="block text-[11px] font-bold text-[#c5a059] mb-1"
              >
                月
              </label>
              <select
                id="calendar-month-select"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg bg-[#1b1522] border border-[#c5a059]/65 text-[#f3e5ab] text-xs sm:text-sm font-bold focus:outline-none focus:border-[#ffd700] cursor-pointer"
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="calendar-day-select"
                className="block text-[11px] font-bold text-[#c5a059] mb-1"
              >
                日付
              </label>
              <select
                id="calendar-day-select"
                value={clampedDay}
                onChange={(e) => handleDayChange(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg bg-[#1b1522] border border-[#c5a059]/65 text-[#f3e5ab] text-xs sm:text-sm font-bold focus:outline-none focus:border-[#ffd700] cursor-pointer"
              >
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}日
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isAtMinMonth}
              onClick={() => shiftMonth(-1)}
              className="px-3 py-2 rounded-lg border border-[#c5a059]/45 bg-[#1a151f] hover:bg-[#2a2133] disabled:opacity-40 disabled:hover:bg-[#1a151f] disabled:cursor-not-allowed text-[#f3e5ab] text-xs font-bold transition cursor-pointer"
            >
              ◀ 前月
            </button>
            <button
              type="button"
              onClick={jumpToToday}
              className="px-3 py-2 rounded-lg border border-[#c5a059]/45 bg-[#1a151f] hover:bg-[#2a2133] text-[#d4af37] text-xs font-bold transition cursor-pointer"
            >
              今日
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="px-3 py-2 rounded-lg border border-[#c5a059]/45 bg-[#1a151f] hover:bg-[#2a2133] text-[#f3e5ab] text-xs font-bold transition cursor-pointer"
            >
              次月 ▶
            </button>
          </div>
        </div>

        {/* Selected Date Auto-Recorded Summary */}
        <div className="border-t border-[#c5a059]/20 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#f3e5ab]">
            🕰️ {selectedYear}年{selectedMonth}月{clampedDay}日（
            {selectedWeekday}）の学習記録
          </span>
          {selectedStat && selectedStat.attempts > 0 ? (
            <div className="flex flex-wrap items-center gap-3 text-[#dfd7c8]">
              <span>
                問題を解いた時間：{' '}
                <strong className="text-[#ffd700]">
                  {formatHoursMinutesDetailed(selectedStat.durationSec)}
                </strong>
              </span>
              <span className="text-emerald-300 font-semibold">
                {selectedStat.attempts}問解答（正解 {selectedStat.correct}問 ／{' '}
                {selectedAccuracyPct}%）
              </span>
            </div>
          ) : (
            <span className="text-[#8c8075]">
              この日に問題を解いた記録はまだありません（0時間0分）
            </span>
          )}
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="rounded-xl border border-[#c5a059]/30 bg-[#0d0a11]/90 p-2.5 sm:p-4 space-y-2">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[11px] font-bold pb-1 border-b border-[#c5a059]/20">
          {WEEKDAY_LABELS.map((w, idx) => (
            <div
              key={w}
              className={
                idx === 0
                  ? 'text-rose-300'
                  : idx === 6
                    ? 'text-sky-300'
                    : 'text-[#c5a059]'
              }
            >
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarCells.map((dayNum, cellIdx) => {
            if (dayNum === null) {
              return (
                <div
                  key={`empty-${cellIdx}`}
                  className="min-h-[56px] sm:min-h-[68px] rounded-lg bg-[#110d15]/40"
                />
              );
            }

            const dateKey = formatDateKey(selectedYear, selectedMonth, dayNum);
            const stat = dailyQuizStats[dateKey];
            const durationSec = stat?.durationSec ?? 0;
            const hasActivity = Boolean(stat && stat.attempts > 0);
            const isSelected = dayNum === clampedDay;
            const isToday = dateKey === todayKey;
            const weekdayIdx = cellIdx % 7;

            const compactDuration = formatCompactCellDuration(durationSec);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => handleDayChange(dayNum)}
                className={`min-h-[56px] sm:min-h-[68px] rounded-lg p-1.5 flex flex-col justify-between text-left transition cursor-pointer border ${
                  isSelected
                    ? 'border-[#ffd700] bg-[#2a1d2e] shadow-[0_0_12px_rgba(255,215,0,0.28)]'
                    : hasActivity
                      ? 'border-emerald-500/45 bg-[#11201a]/80 hover:border-[#d4af37]'
                      : 'border-[#c5a059]/15 bg-[#15111a]/75 hover:border-[#c5a059]/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold leading-none ${
                      isSelected
                        ? 'text-[#ffd700]'
                        : weekdayIdx === 0
                          ? 'text-rose-300'
                          : weekdayIdx === 6
                            ? 'text-sky-300'
                            : 'text-[#dfd7c8]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#3a1c24] text-[#ffd700] border border-[#c5a059]/50 leading-none">
                      今日
                    </span>
                  )}
                </div>

                {hasActivity ? (
                  <div className="w-full space-y-0.5">
                    <span className="block text-[9.5px] sm:text-[10.5px] font-bold text-emerald-300 truncate leading-tight">
                      {compactDuration}
                    </span>
                    <span className="hidden sm:block text-[9px] text-[#c5a059] truncate leading-none">
                      {stat.attempts}問
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-[#5e544c] leading-none">
                    —
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
