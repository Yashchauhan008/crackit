import { useEffect, useState } from 'react';
import { clampRange } from '../lib/engine';

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map(([v, label]) => (
        <button key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

/** From/To inputs: edit freely, commit (clamped and ordered) on blur or Enter. */
export function RangeInputs({ value, onChange }: { value: [number, number]; onChange: (r: [number, number]) => void }) {
  const [lo, setLo] = useState(String(value[0]));
  const [hi, setHi] = useState(String(value[1]));
  useEffect(() => {
    setLo(String(value[0]));
    setHi(String(value[1]));
  }, [value]);
  const commit = () => onChange(clampRange(Number(lo), Number(hi)));
  const keys = (e: React.KeyboardEvent) => e.key === 'Enter' && (e.target as HTMLInputElement).blur();
  return (
    <>
      <label className="field">
        From <input type="number" min={1} max={200} value={lo} onChange={e => setLo(e.target.value)} onBlur={commit} onKeyDown={keys} aria-label="From" />
      </label>
      <label className="field">
        To <input type="number" min={1} max={200} value={hi} onChange={e => setHi(e.target.value)} onBlur={commit} onKeyDown={keys} aria-label="To" />
      </label>
    </>
  );
}

export const fmtTime = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
export const pct = (v: number | null) => (v == null ? '–' : `${v}%`);
export const secs = (ms: number | null) => (ms == null ? '–' : `${(ms / 1000).toFixed(1)}s`);
export const signed = (v: number | null, unit = '') => (v == null ? '–' : `${v > 0 ? '+' : ''}${v}${unit}`);
