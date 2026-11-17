import { useCallback, useMemo, useState } from 'react';
import { listFavoriteEntries, type FavoriteEntry } from '../lib/favorites';
import FavoriteStar from './FavoriteStar';

export default function FavoritesPage() {
  const [tick, setTick] = useState(0);
  const items = useMemo(() => listFavoriteEntries(), [tick]);
  const refresh = useCallback(() => setTick(n => n + 1), []);

  return (
    <div className="fav-page">
      <div className="card fav-page-bar">
        <div className="topic-learn-bar-copy">
          <strong>Favourites</strong>
          <span>
            {items.length
              ? `${items.length} starred question${items.length === 1 ? '' : 's'} · only favourites shown here`
              : 'Star a question on any topic or arrangement to collect it here'}
          </span>
        </div>
      </div>

      {!items.length ? (
        <div className="card topic-missing-banner">
          <strong>No favourites yet</strong>
          <p>Open a question and tap the star. They all land in this one list.</p>
        </div>
      ) : (
        <div className="topic-q-list fav-list">
          {items.map(item => (
            <FavoriteRow key={item.key} item={item} onChange={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}

function FavoriteRow({ item, onChange }: { item: FavoriteEntry; onChange: () => void }) {
  const label = item.kind === 'topic' ? item.topic : item.title;
  const kindLabel = item.kind === 'topic' ? item.section : 'Arrangements';

  return (
    <article className="topic-q-item fav-row">
      <div className="topic-q-head">
        <a className="topic-q-summary fav-row-link" href={item.href}>
          <span className="topic-q-num fav-row-kind" title={kindLabel}>
            {item.kind === 'topic' ? 'Q' : 'A'}
          </span>
          <span className="topic-q-preview">
            <strong>{item.stem}</strong>
            <small>
              {label}
              {item.source ? ` · ${item.source}` : ''}
            </small>
          </span>
          <span className="topic-q-chevron" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
        </a>
        <FavoriteStar questionKey={item.key} className="topic-q-fav" onChange={onChange} />
      </div>
    </article>
  );
}
