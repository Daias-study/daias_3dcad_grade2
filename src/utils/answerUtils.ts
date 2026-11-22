import type { FillBlankItem, QuizQuestion, UserAnswer } from '../types/quiz';

export function normalizeAnswer(str: string | undefined | null): string {
  return String(str ?? '')
    .trim()
    .replace(/[Ａ-Ｚａ-ｚ０-９－]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    )
    .replace(/[‐‑‒–—―ー]/g, '-')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export function isSingleBlankCorrect(
  userVal: string | undefined,
  blank: FillBlankItem
): boolean {
  const normUser = normalizeAnswer(userVal);
  const list = blank.acceptedAnswers ?? [blank.correctAnswer];
  return list.some((ans) => normalizeAnswer(ans) === normUser);
}

export function isQuestionCorrect(
  userAns: UserAnswer,
  q: QuizQuestion
): boolean {
  if (userAns === null || userAns === undefined) return false;
  if (q.type === 'multi_fill') {
    if (!Array.isArray(userAns)) return false;
    return q.blanks.every((blank, idx) =>
      isSingleBlankCorrect(userAns[idx], blank)
    );
  }
  if (q.type === 'fill') {
    if (Array.isArray(userAns)) return false;
    const normUser = normalizeAnswer(userAns);
    const list = q.acceptedAnswers ?? [q.correctAnswer];
    return list.some((ans) => normalizeAnswer(ans) === normUser);
  }
  return userAns === q.correctAnswer;
}
