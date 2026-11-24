import type { QuizDataset, QuizQuestion } from '../types/quiz';
import {
  ALL_STUDY_GENRES,
  classifyQuestionGenre,
  type StudyAttemptRecord,
  type StudyGenre,
} from './analyticsUtils';

type CompactMatchedAttempt = [
  dsIdx: number,
  qIdx: number,
  isCorrect: 0 | 1,
  durationSec: number,
  timestamp: number,
];

type CompactFallbackAttempt = [
  questionKey: string,
  datasetId: string,
  datasetTitle: string,
  genreIdx: number,
  isCorrect: 0 | 1,
  durationSec: number,
  timestamp: number,
];

type CompactStudyAttemptEntry = CompactMatchedAttempt | CompactFallbackAttempt;

export interface TransferPayload {
  v: 1 | 2;
  /** Compact [datasetIndex, questionIndex] references into quizDatasets */
  r: [number, number][];
  /** Fallback raw questions if not found in built-in datasets */
  x?: QuizQuestion[];
  /** Compact study attempt history for learning analytics */
  h?: CompactStudyAttemptEntry[];
}

export interface ImportedTransferData {
  reviewQuestions: QuizQuestion[];
  studyHistory: StudyAttemptRecord[];
  hasStudyHistory: boolean;
}

export function getQuestionKey(q: QuizQuestion): string {
  return `${q.diagram ?? ''}::${q.type ?? 'choice'}::${q.question}`;
}

export function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeBase64Url(code: string): string {
  const normalized = code.trim().replace(/-/g, '+').replace(/_/g, '/');
  if (!normalized || !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) {
    throw new Error('Invalid Base64URL format');
  }
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function buildDatasetQuestionLookup(
  datasets: QuizDataset[]
): Map<string, [number, number]> {
  const indexLookup = new Map<string, [number, number]>();
  datasets.forEach((ds, dsIdx) => {
    ds.questions.forEach((q, qIdx) => {
      const key = getQuestionKey(q);
      if (!indexLookup.has(key)) {
        indexLookup.set(key, [dsIdx, qIdx]);
      }
    });
  });
  return indexLookup;
}

export function exportTransferToBase64Url(
  reviewQuestions: QuizQuestion[],
  studyHistory: StudyAttemptRecord[],
  datasets: QuizDataset[]
): string {
  const indexLookup = buildDatasetQuestionLookup(datasets);

  const refs: [number, number][] = [];
  const extras: QuizQuestion[] = [];

  for (const q of reviewQuestions) {
    const key = getQuestionKey(q);
    const ref = indexLookup.get(key);
    if (ref) {
      refs.push(ref);
    } else {
      extras.push(q);
    }
  }

  const trimmedHistory =
    studyHistory.length > 3000 ? studyHistory.slice(-3000) : studyHistory;
  const compactHistory: CompactStudyAttemptEntry[] = trimmedHistory.map(
    (att) => {
      const ref = indexLookup.get(att.questionKey);
      const okFlag: 0 | 1 = att.isCorrect ? 1 : 0;
      const dur = Math.max(1, Math.round(att.durationSec));
      const ts = Math.round(att.timestamp);
      if (ref) {
        return [ref[0], ref[1], okFlag, dur, ts];
      }
      const gIdx = ALL_STUDY_GENRES.indexOf(att.genre);
      return [
        att.questionKey,
        att.datasetId,
        att.datasetTitle,
        gIdx >= 0 ? gIdx : ALL_STUDY_GENRES.length - 1,
        okFlag,
        dur,
        ts,
      ];
    }
  );

  const payload: TransferPayload = {
    v: 2,
    r: refs,
    ...(extras.length > 0 ? { x: extras } : {}),
    h: compactHistory,
  };

  return encodeBase64Url(JSON.stringify(payload));
}

export function exportReviewToBase64Url(
  reviewQuestions: QuizQuestion[],
  datasets: QuizDataset[]
): string {
  return exportTransferToBase64Url(reviewQuestions, [], datasets);
}

export function extractBase64UrlToken(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.includes('save=')) {
    try {
      const url = new URL(trimmed);
      const param = url.searchParams.get('save');
      if (param) return param.trim();
    } catch {
      const match = trimmed.match(/[?&]save=([^&#\s]+)/);
      if (match?.[1]) return decodeURIComponent(match[1]).trim();
    }
  }
  return trimmed.replace(/\s+/g, '');
}

export function importTransferFromBase64Url(
  rawInput: string,
  datasets: QuizDataset[]
): ImportedTransferData {
  const token = extractBase64UrlToken(rawInput);
  if (!token) {
    throw new Error('Empty input');
  }
  const jsonText = decodeBase64Url(token);
  const parsed = JSON.parse(jsonText) as Partial<TransferPayload>;

  if (
    !parsed ||
    (parsed.v !== 1 && parsed.v !== 2) ||
    !Array.isArray(parsed.r)
  ) {
    throw new Error('Invalid payload structure');
  }

  const reviewQuestions: QuizQuestion[] = [];
  const seenReview = new Set<string>();

  for (const entry of parsed.r) {
    if (!Array.isArray(entry) || entry.length !== 2) continue;
    const [dsIdx, qIdx] = entry;
    const q = datasets[dsIdx]?.questions[qIdx];
    if (!q) continue;
    const key = getQuestionKey(q);
    if (!seenReview.has(key)) {
      seenReview.add(key);
      reviewQuestions.push(q);
    }
  }

  if (Array.isArray(parsed.x)) {
    for (const q of parsed.x) {
      if (!q || typeof q.question !== 'string') continue;
      const key = getQuestionKey(q);
      if (!seenReview.has(key)) {
        seenReview.add(key);
        reviewQuestions.push(q);
      }
    }
  }

  const hasStudyHistory = Array.isArray(parsed.h);
  const studyHistory: StudyAttemptRecord[] = [];

  if (Array.isArray(parsed.h)) {
    for (const entry of parsed.h) {
      if (!Array.isArray(entry)) continue;

      if (entry.length === 5 && typeof entry[0] === 'number') {
        const [dsIdx, qIdx, okFlag, dur, ts] = entry;
        const ds = datasets[dsIdx];
        const q = ds?.questions[qIdx];
        if (!ds || !q) continue;
        if (typeof dur !== 'number' || typeof ts !== 'number') continue;
        studyHistory.push({
          questionKey: getQuestionKey(q),
          datasetId: ds.id,
          datasetTitle: ds.title,
          genre: classifyQuestionGenre(q),
          isCorrect: okFlag === 1,
          durationSec: Math.max(1, Math.round(dur)),
          timestamp: ts,
        });
      } else if (entry.length === 7 && typeof entry[0] === 'string') {
        const [qKey, dsId, dsTitle, gIdx, okFlag, dur, ts] = entry;
        if (
          typeof dsId !== 'string' ||
          typeof dsTitle !== 'string' ||
          typeof gIdx !== 'number' ||
          typeof dur !== 'number' ||
          typeof ts !== 'number'
        ) {
          continue;
        }
        const genre: StudyGenre =
          ALL_STUDY_GENRES[gIdx] ?? 'CAD基礎・設計管理・運用';
        studyHistory.push({
          questionKey: qKey,
          datasetId: dsId,
          datasetTitle: dsTitle,
          genre,
          isCorrect: okFlag === 1,
          durationSec: Math.max(1, Math.round(dur)),
          timestamp: ts,
        });
      }
    }
  }

  return {
    reviewQuestions,
    studyHistory,
    hasStudyHistory,
  };
}

export function importReviewFromBase64Url(
  rawInput: string,
  datasets: QuizDataset[]
): QuizQuestion[] {
  return importTransferFromBase64Url(rawInput, datasets).reviewQuestions;
}

export function mergeReviewQuestions(
  current: QuizQuestion[],
  incoming: QuizQuestion[]
): QuizQuestion[] {
  const merged = [...current];
  const seen = new Set(current.map(getQuestionKey));
  for (const q of incoming) {
    const key = getQuestionKey(q);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(q);
    }
  }
  return merged;
}

function getAttemptIdentityKey(r: StudyAttemptRecord): string {
  return `${r.timestamp}::${r.questionKey}::${r.isCorrect ? 1 : 0}::${r.durationSec}`;
}

export function mergeStudyHistory(
  current: StudyAttemptRecord[],
  incoming: StudyAttemptRecord[]
): StudyAttemptRecord[] {
  const merged = [...current];
  const seen = new Set(current.map(getAttemptIdentityKey));
  for (const rec of incoming) {
    const key = getAttemptIdentityKey(rec);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(rec);
    }
  }
  merged.sort((a, b) => a.timestamp - b.timestamp);
  return merged.length > 3000 ? merged.slice(-3000) : merged;
}
