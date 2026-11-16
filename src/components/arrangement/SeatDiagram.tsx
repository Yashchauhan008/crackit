import type { CSSProperties } from 'react';
import type { Facing, Layout, SeatState } from '../../lib/arrangements/types';

type Props = {
  layout: Layout;
  seats: SeatState[];
  highlight?: number[];
  dualFacing: boolean;
};

/** Degrees clockwise from screen-up. Facing centre: nose points inward. */
function noseDeg(theta: number, facing: Facing | null, layout: Layout): number | null {
  if (!facing) return null;
  if (layout === 'linear') return facing === 'south' ? 180 : 0;
  const inward = facing !== 'out';
  const sign = inward ? -1 : 1;
  const dx = sign * Math.cos(theta);
  const dy = sign * Math.sin(theta);
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

function Seat({
  seat,
  i,
  on,
  nose,
  style,
}: {
  seat: SeatState;
  i: number;
  on: boolean;
  nose: number | null;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`arr-seat ${seat.person ? 'filled' : ''} ${seat.fresh ? 'fresh' : ''} ${on ? 'hi' : ''}`}
      style={style}
    >
      {nose != null && (
        <span className="arr-dir" style={{ transform: `rotate(${nose}deg)` }} aria-hidden>
          <i className="arr-nose" />
          <i className="arr-hand">R</i>
        </span>
      )}
      <span className="arr-who">{seat.person ?? ''}</span>
      {!seat.person && <span className="arr-empty">empty</span>}
      {seat.fresh && <span className="arr-new">new</span>}
    </div>
  );
}

export default function SeatDiagram({ layout, seats, highlight = [], dualFacing }: Props) {
  const hi = new Set(highlight);

  if (layout === 'circular') {
    const n = seats.length;
    const r = 36;
    return (
      <div className="arr-diagram arr-circular" data-dual={dualFacing ? '1' : '0'}>
        <div className="arr-table" aria-hidden>
          <span>table</span>
        </div>
        {seats.map((seat, i) => {
          const theta = (i / n) * 2 * Math.PI - Math.PI / 2;
          const left = 50 + r * Math.cos(theta);
          const top = 50 + r * Math.sin(theta);
          return (
            <Seat
              key={i}
              seat={seat}
              i={i}
              on={hi.has(i)}
              nose={noseDeg(theta, seat.facing, 'circular')}
              style={{ left: `${left}%`, top: `${top}%` }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="arr-diagram arr-linear" data-dual={dualFacing ? '1' : '0'}>
      <div className="arr-compass" aria-hidden>
        N
      </div>
      <div className="arr-row">
        {seats.map((seat, i) => (
          <Seat
            key={i}
            seat={seat}
            i={i}
            on={hi.has(i)}
            nose={seat.person ? noseDeg(0, seat.facing ?? (dualFacing ? null : 'north'), 'linear') : null}
          />
        ))}
      </div>
      <div className="arr-ends">
        <span>left end</span>
        <span>right end</span>
      </div>
    </div>
  );
}
