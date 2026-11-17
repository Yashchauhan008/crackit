import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { isFavorite, toggleFavorite } from '../lib/favorites';

type Props = {
  questionKey: string;
  className?: string;
  onChange?: (on: boolean) => void;
};

export default function FavoriteStar({ questionKey, className = '', onChange }: Props) {
  const [on, setOn] = useState(() => isFavorite(questionKey));

  useEffect(() => {
    setOn(isFavorite(questionKey));
  }, [questionKey]);

  const toggle = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = toggleFavorite(questionKey);
      setOn(next);
      onChange?.(next);
    },
    [questionKey, onChange],
  );

  return (
    <button
      type="button"
      className={`fav-star ${on ? 'on' : ''} ${className}`.trim()}
      aria-label={on ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={on}
      title={on ? 'Favourited' : 'Favourite'}
      onClick={toggle}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M12 3.6l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 15.9l-4.8 2.52.92-5.34-3.88-3.78 5.36-.78L12 3.6z"
          fill={on ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
