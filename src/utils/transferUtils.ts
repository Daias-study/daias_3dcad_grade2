import type { QuizDataset, QuizQuestion } from '../types/quiz';

export interface TransferPayload {
  v: 1;
  /** Compact [datasetIndex, questionIndex] references into quizDatasets */
  r: [number, number][];
  /** Fallback raw questions if not found in built-in datasets */
  x?: QuizQuestion[];
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

export function exportReviewToBase64Url(
  reviewQuestions: QuizQuestion[],
  datasets: QuizDataset[]
): string {
  const indexLookup = new Map<string, [number, number]>();
  datasets.forEach((ds, dsIdx) => {
    ds.questions.forEach((q, qIdx) => {
      const key = getQuestionKey(q);
      if (!indexLookup.has(key)) {
        indexLookup.set(key, [dsIdx, qIdx]);
      }
    });
  });

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

  const payload: TransferPayload =
    extras.length > 0 ? { v: 1, r: refs, x: extras } : { v: 1, r: refs };

  return encodeBase64Url(JSON.stringify(payload));
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

export function importReviewFromBase64Url(
  rawInput: string,
  datasets: QuizDataset[]
): QuizQuestion[] {
  const token = extractBase64UrlToken(rawInput);
  if (!token) {
    throw new Error('Empty input');
  }
  const jsonText = decodeBase64Url(token);
  const parsed = JSON.parse(jsonText) as Partial<TransferPayload>;

  if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.r)) {
    throw new Error('Invalid payload structure');
  }

  const result: QuizQuestion[] = [];
  const seen = new Set<string>();

  for (const entry of parsed.r) {
    if (!Array.isArray(entry) || entry.length !== 2) continue;
    const [dsIdx, qIdx] = entry;
    const q = datasets[dsIdx]?.questions[qIdx];
    if (!q) continue;
    const key = getQuestionKey(q);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(q);
    }
  }

  if (Array.isArray(parsed.x)) {
    for (const q of parsed.x) {
      if (!q || typeof q.question !== 'string') continue;
      const key = getQuestionKey(q);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(q);
      }
    }
  }

  return result;
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
