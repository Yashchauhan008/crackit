import { useEffect, useRef, useState } from 'react';
import type { ArrangementPuzzle } from '../../lib/arrangements/types';
import { highlightAtStep, seatsAtStep, seatsFinal } from '../../lib/arrangements/state';
import SeatDiagram from './SeatDiagram';

const STEP_MS = 2400;

type Props = { puzzle: ArrangementPuzzle; onClose: () => void };

function howToRead(puzzle: ArrangementPuzzle): { title: string; lines: string[] } {
  if (puzzle.layout === 'circular' && puzzle.dualFacing) {
    return {
      title: 'How to read the circle',
      lines: [
        'Arrow = where that person is looking.',
        'R on their shoulder = their right hand.',
        'Facing the table: right goes anti-clockwise. Facing away: right goes clockwise.',
      ],
    };
  }
  if (puzzle.layout === 'circular') {
    return {
      title: 'How to read the circle',
      lines: [
        'Everyone looks at the table. The arrow points inward.',
        'R is their right hand — it travels anti-clockwise (against the clock).',
        '“Second to the right” means two seats along that R direction.',
      ],
    };
  }
  if (puzzle.dualFacing) {
    return {
      title: 'How to read the row',
      lines: [
        'Arrow up = facing North. Arrow down = facing South.',
        'R is that person’s right hand. It flips when they turn around.',
        'Left end and right end are labelled under the row.',
      ],
    };
  }
  return {
    title: 'How to read the row',
    lines: [
      'Everyone faces North (up the page).',
      'Their right is the right side of the screen. R marks it.',
      '“Second to the right of B” is two seats toward the right end from B.',
    ],
  };
}

export default function SolvePlayer({ puzzle, onClose }: Props) {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const max = puzzle.steps.length;
  const timer = useRef(0);

  useEffect(() => () => window.clearInterval(timer.current), []);

  useEffect(() => {
    if (!playing) {
      window.clearInterval(timer.current);
      return;
    }
    timer.current = window.setInterval(() => {
      setStep(s => {
        if (s >= max) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, STEP_MS);
    return () => window.clearInterval(timer.current);
  }, [playing, max]);

  const showFinal = step >= max;
  const seats = showFinal ? seatsFinal(puzzle) : seatsAtStep(puzzle, step);
  const highlight = showFinal ? [] : highlightAtStep(puzzle, step);
  const guide = howToRead(puzzle);
  const condition =
    step < 0
      ? 'Seats are empty. Press Play and watch one clue place people at a time. Gold seats are the ones just added.'
      : showFinal
        ? 'That is the full arrangement. Gold marks are gone — every seat is settled. Replay if you want to see the clues again.'
        : puzzle.steps[step]!.condition;

  const jump = (n: number) => {
    setPlaying(false);
    setStep(n);
  };

  return (
    <section className="arr-solve">
      <div className="cardhead">
        <div>
          <p className="arr-kicker">Solve animation</p>
          <h2>One clue at a time</h2>
        </div>
        <button className="btn ghost" onClick={onClose}>
          Close
        </button>
      </div>

      <ol className="arr-rail" aria-label="Clues">
        <li>
          <button type="button" className={step < 0 ? 'on' : 'done'} onClick={() => jump(-1)}>
            Start
          </button>
        </li>
        {puzzle.steps.map((_, i) => (
          <li key={i}>
            <button
              type="button"
              className={step === i ? 'on' : step > i ? 'done' : ''}
              onClick={() => jump(i)}
            >
              {i + 1}
            </button>
          </li>
        ))}
        <li>
          <button type="button" className={showFinal ? 'on' : ''} onClick={() => jump(max)}>
            Final
          </button>
        </li>
      </ol>

      <div className="arr-key">
        <p className="arr-kicker">{guide.title}</p>
        <ul>
          {guide.lines.map(line => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="arr-swatches">
          <span><i className="swatch hi" /> in this clue</span>
          <span><i className="swatch fresh" /> just placed</span>
        </p>
      </div>

      <div className="arr-stage">
        <SeatDiagram layout={puzzle.layout} seats={seats} highlight={highlight} dualFacing={puzzle.dualFacing} />
      </div>

      <div className="arr-condition">
        <span className="arr-step-label">
          {step < 0 ? 'Before any clue' : showFinal ? 'Finished' : `Clue ${step + 1} of ${puzzle.steps.length}`}
        </span>
        <p>{condition}</p>
      </div>

      <div className="arr-controls">
        <button className="btn ghost" disabled={step <= -1} onClick={() => jump(Math.max(-1, step - 1))}>
          Previous clue
        </button>
        {playing ? (
          <button className="btn" onClick={() => setPlaying(false)}>
            Pause
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => {
              if (step >= max) setStep(-1);
              setPlaying(true);
            }}
          >
            {step >= max ? 'Replay' : 'Play clues'}
          </button>
        )}
        <button className="btn ghost" disabled={step >= max} onClick={() => jump(Math.min(max, step + 1))}>
          Next clue
        </button>
      </div>
    </section>
  );
}
