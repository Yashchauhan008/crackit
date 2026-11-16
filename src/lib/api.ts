/** Thin client for the backend. No login: a random deviceId identifies this browser. */
import { load, save } from './storage';

const BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:3007').replace(/\/$/, '');

export const uuid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 3) | 8).toString(16);
      });

export type AnswerLog = {
  quizId: string;
  itemKey: string;
  prompt: string;
  correctAnswer: number;
  givenAnswer: number;
  timeMs: number;
  answeredAt: string;
};
export type AttemptPayload = {
  clientId: string;
  kind: 'practice' | 'tournament';
  mode: 'input' | 'options' | 'mixed';
  startedAt: string;
  durationMs: number;
  answers: AnswerLog[];
};

export type Overview = {
  days: number;
  totals: { attempts: number; answered: number; correct: number; accuracy: number | null; avgTimeMs: number | null; activeDays: number; streakDays: number };
  quizzes: { quizId: string; answered: number; correct: number; accuracy: number | null; avgTimeMs: number | null; mastery: { items: number; weak: number; recovered: number; solid: number } }[];
};
type Bucket = { answered: number; accuracy: number | null; avgTimeMs: number | null };
export type Progress = {
  daily: { day: string; answered: number; correct: number; accuracy: number | null; avgTimeMs: number | null }[];
  trend: { current: Bucket; previous: Bucket; accuracyDelta: number | null; speedChangePct: number | null; volumeDelta: number };
};
export type MistakeItem = {
  quizId: string;
  itemKey: string;
  prompt: string;
  status: 'weak' | 'ok' | 'recovered' | 'solid';
  correctAnswer: number;
  attempts: number;
  wrong: number;
  errorRate: number;
  avgTimeMs: number;
  commonWrongAnswers: { answer: number; times: number }[];
};

class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

let deviceId = load<string | null>('rrb.deviceId', null);
if (!deviceId) {
  deviceId = uuid();
  save('rrb.deviceId', deviceId);
}
let token = load<string | null>('rrb.token', null);
const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

async function raw<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError((body as { message?: string }).message ?? res.statusText, res.status);
  return body as T;
}
async function login() {
  const r = await raw<{ token: string }>('/learners/session', { method: 'POST', body: JSON.stringify({ deviceId }) });
  token = r.token;
  save('rrb.token', token);
}
async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (!token) await login();
  try {
    return await raw<T>(path, init);
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      await login();
      return raw<T>(path, init);
    }
    throw e;
  }
}
const qs = (o: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== undefined && v !== '' && p.set(k, String(v)));
  return `?${p}`;
};

// Attempts that could not be saved (server down) wait in the queue and are retried later.
let flushing: Promise<void> | null = null;
export function flush(): Promise<void> {
  flushing ??= (async () => {
    const queue = load<AttemptPayload[]>('rrb.queue', []);
    const left: AttemptPayload[] = [];
    for (const a of queue) {
      try {
        await call('/attempts', { method: 'POST', body: JSON.stringify(a) });
      } catch (e) {
        const permanent = e instanceof HttpError && e.status >= 400 && e.status < 500 && e.status !== 401;
        if (!permanent) left.push(a); // bad data is dropped, network errors are kept
      }
    }
    save('rrb.queue', left);
  })().finally(() => (flushing = null));
  return flushing;
}
export async function saveAttempt(a: AttemptPayload) {
  save('rrb.queue', [...load<AttemptPayload[]>('rrb.queue', []), a]); // write first so nothing is lost
  await flush();
}
export const pending = () => load<AttemptPayload[]>('rrb.queue', []).length;

export const getOverview = (days: number) => call<Overview>('/analytics/overview' + qs({ days, tz: tz() }));
export const getProgress = (days: number, quizId?: string) => call<Progress>('/analytics/progress' + qs({ days, quizId, tz: tz() }));
export const getMistakes = (quizId?: string, limit = 30) => call<{ items: MistakeItem[] }>('/analytics/weak-items' + qs({ quizId, limit }));
