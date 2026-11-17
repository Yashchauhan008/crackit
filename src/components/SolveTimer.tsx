import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fmtSolve, readSolveTime, saveSolveTime } from '../lib/solveTimer';

type Status = 'idle' | 'running' | 'paused';

type Ctx = {
  questionKey: string | null;
  setQuestionKey: (key: string | null) => void;
};

const SolveTimerCtx = createContext<Ctx | null>(null);

export function SolveTimerProvider({ children }: { children: ReactNode }) {
  const [questionKey, setQuestionKey] = useState<string | null>(null);
  const value = useMemo(() => ({ questionKey, setQuestionKey }), [questionKey]);
  return <SolveTimerCtx.Provider value={value}>{children}</SolveTimerCtx.Provider>;
}

/** Bind the sidebar timer to the active question on this screen. */
export function useSolveTimerQuestion(key: string | null) {
  const ctx = useContext(SolveTimerCtx);
  useEffect(() => {
    if (!ctx) return;
    ctx.setQuestionKey(key);
  }, [ctx, key]);
  useEffect(() => {
    if (!ctx) return;
    return () => ctx.setQuestionKey(null);
  }, [ctx]);
}

function useTimerCore(questionKey: string | null) {
  const [status, setStatus] = useState<Status>('idle');
  const [displayMs, setDisplayMs] = useState(0);
  const [lastMs, setLastMs] = useState<number | null>(() => readSolveTime(questionKey));
  const accum = useRef(0);
  const startedAt = useRef<number | null>(null);
  const questionKeyRef = useRef(questionKey);
  questionKeyRef.current = questionKey;

  const freeze = useCallback(() => {
    if (startedAt.current != null) {
      accum.current += Date.now() - startedAt.current;
      startedAt.current = null;
    }
    return accum.current;
  }, []);

  const tick = useCallback(() => {
    const live = startedAt.current != null ? Date.now() - startedAt.current : 0;
    setDisplayMs(accum.current + live);
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [status, tick]);

  // Only refresh "Last" for the open question — never start/stop the clock.
  useEffect(() => {
    setLastMs(readSolveTime(questionKey));
  }, [questionKey]);

  const start = useCallback(() => {
    if (status === 'running') return;
    if (!questionKeyRef.current) return;
    if (status === 'idle') {
      accum.current = 0;
      setDisplayMs(0);
    }
    startedAt.current = Date.now();
    setStatus('running');
  }, [status]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    freeze();
    setDisplayMs(accum.current);
    setStatus('paused');
  }, [status, freeze]);

  const stop = useCallback(() => {
    if (status === 'idle') return;
    const ms = freeze();
    setDisplayMs(ms);
    setStatus('idle');
    const key = questionKeyRef.current;
    if (key && ms >= 500) {
      saveSolveTime(key, ms);
      setLastMs(ms);
    }
    accum.current = 0;
  }, [status, freeze]);

  return { status, displayMs, lastMs, start, pause, stop, hasQuestion: Boolean(questionKey) };
}

export function SideSolveTimer() {
  const ctx = useContext(SolveTimerCtx);
  const questionKey = ctx?.questionKey ?? null;
  const { status, displayMs, lastMs, start, pause, stop, hasQuestion } = useTimerCore(questionKey);

  const liveLabel = status === 'idle' ? null : fmtSolve(displayMs);
  const lastLabel = lastMs != null ? fmtSolve(lastMs) : null;
  const canStop = status !== 'idle';

  return (
    <div className={`side-timer ${status}`} title={hasQuestion ? 'Solve timer for this question' : 'Open a question to time it'}>
      <div className="side-timer-btns">
        <button
          type="button"
          className={`side-timer-btn diamond ${status === 'running' ? 'on' : ''}`}
          aria-label={status === 'paused' ? 'Resume timer' : 'Start timer'}
          disabled={!hasQuestion || status === 'running'}
          onClick={start}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className={`side-timer-btn pause ${status === 'paused' ? 'on' : ''}`}
          aria-label={status === 'paused' ? 'Paused' : 'Pause timer'}
          disabled={status !== 'running'}
          onClick={pause}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
            <rect x="5" y="4" width="5" height="16" rx="1.5" fill="currentColor" />
            <rect x="14" y="4" width="5" height="16" rx="1.5" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className={`side-timer-btn circle ${canStop ? 'on' : ''}`}
          aria-label="Stop timer and save time"
          disabled={!canStop}
          onClick={stop}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
            {canStop && <circle cx="12" cy="12" r="3.2" fill="currentColor" />}
          </svg>
        </button>
      </div>
      <div className="side-timer-readout" aria-live="polite">
        {liveLabel ? <span className="side-timer-live">{liveLabel}</span> : <span className="side-timer-idle">{hasQuestion ? 'Ready' : '—'}</span>}
        {lastLabel && <span className="side-timer-last">Last {lastLabel}</span>}
      </div>
    </div>
  );
}
