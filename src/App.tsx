import { useCallback, useEffect, useState } from 'react';
import { useConfig } from './lib/config';
import type { Q } from './lib/engine';
import { applyTheme, readTheme, toggleTheme, type Theme } from './lib/theme';
import Practice from './components/Practice';
import Tournament from './components/Tournament';
import Progress from './components/Progress';
import QuizRunner, { type Session } from './components/QuizRunner';
import ArrangementList from './components/arrangement/ArrangementList';
import ArrangementPuzzle from './components/arrangement/ArrangementPuzzle';
import TopicList from './components/topics/TopicList';
import TopicQuiz from './components/topics/TopicQuiz';
import { getArrangement } from './lib/arrangements/puzzles';
import { getTopic } from './lib/topicBank';

const TABS = [
  ['practice', 'Practice', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  ['tournament', 'Tournament', 'M8 4h8v3a4 4 0 0 1-8 0zM6 6H4a3 3 0 0 0 3 4M18 6h2a3 3 0 0 1-3 4M12 14v3M9 20h6'],
  ['progress', 'Progress', 'M4 19V10M10 19V5M16 19v-7M22 19H2'],
] as const;
type Tab = (typeof TABS)[number][0];
type Route = { tab: Tab | 'arrangements' | 'topics'; param?: string };

const readRoute = (): Route => {
  const [h, param] = location.hash.replace('#', '').split('/');
  if (h === 'arrangements') return { tab: 'arrangements', param };
  if (h === 'topics') return { tab: 'topics', param };
  // old Learn tab removed — fall back to practice
  if (h === 'learn') return { tab: 'practice' };
  return { tab: TABS.some(([t]) => t === h) ? (h as Tab) : 'practice', param };
};

const TITLES: Record<string, [string, string]> = {
  practice: ['Practice', 'Pick a set and start.'],
  tournament: ['Tournament', 'Mix the quizzes you select.'],
  progress: ['Progress', 'Prep checklist + practice analytics.'],
  arrangements: ['Arrangements', 'Learn puzzles · notes on the right · Solve to animate.'],
  topics: ['Exam topics', 'One quiz per topic, taken from every 2025 paper.'],
};

function Glyph({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function App() {
  const [cfg, update] = useConfig();
  const [route, setRoute] = useState(readRoute);
  const { tab, param } = route;
  const [session, setSession] = useState<Session | null>(null);
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute());
      setSession(null);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const start = useCallback((qs: Q[], title: string, tourney: boolean, rebuild?: () => Q[]) => {
    if (qs.length) setSession(s => ({ key: (s?.key ?? 0) + 1, qs, title, tourney, rebuild }));
  }, []);
  const exit = useCallback(() => setSession(null), []);
  const retry = useCallback((qs: Q[]) => setSession(s => (s ? { ...s, key: s.key + 1, qs } : s)), []);

  const navOn = tab === 'arrangements' || tab === 'topics' ? 'practice' : tab;
  const topicLive = tab === 'topics' && param ? getTopic(param) : undefined;
  const arrLive = tab === 'arrangements' && param ? getArrangement(param) : undefined;
  // Immersive chrome only for timed drills / active quiz runner — topic learn keeps the page header
  const inLesson = Boolean(session);
  const heading = session
    ? ([session.title, session.tourney ? 'Tournament' : 'Practice'] as [string, string])
    : topicLive
      ? ([topicLive.topic, 'Practice questions · formulas on the right · quiz from the top bar.'] as [string, string])
      : arrLive
        ? ([arrLive.title, 'Answer questions · notes on the right · Solve to animate.'] as [string, string])
        : (TITLES[tab] ?? TITLES.practice!);
  const [title, blurb] = heading;

  return (
    <div className={`app ${inLesson ? 'in-lesson' : ''}`}>
      <aside className="side">
        <a className="logo" href="#practice" aria-label="CrackIt">
          C
        </a>
        {TABS.map(([id, label, d]) => (
          <button key={id} className={`navbtn ${navOn === id ? 'on' : ''}`} title={label} aria-label={label} onClick={() => (location.hash = id)}>
            <Glyph d={d} />
          </button>
        ))}
        <button
          className="navbtn theme-toggle"
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          onClick={() => setTheme(t => toggleTheme(t))}
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          )}
        </button>
      </aside>
      <div className="maincol">
        {!inLesson && (
          <header className="pagehead">
            <div>
              <h1>{title}</h1>
              <p>{blurb}</p>
            </div>
          </header>
        )}
        {session ? (
          <QuizRunner key={session.key} session={session} onExit={exit} onRetry={retry} />
        ) : tab === 'arrangements' ? (
          param ? (
            <ArrangementPuzzle puzzleId={param} onBack={() => (location.hash = 'arrangements')} />
          ) : (
            <ArrangementList onOpen={id => (location.hash = `arrangements/${id}`)} onBack={() => (location.hash = 'practice')} />
          )
        ) : tab === 'topics' ? (
          param ? (
            <TopicQuiz topicId={param} onBack={() => (location.hash = 'practice')} />
          ) : (
            <TopicList onOpen={id => (location.hash = `topics/${id}`)} onBack={() => (location.hash = 'practice')} />
          )
        ) : tab === 'tournament' ? (
          <Tournament cfg={cfg} update={update} start={start} />
        ) : tab === 'progress' ? (
          <Progress cfg={cfg} start={start} />
        ) : (
          <Practice cfg={cfg} update={update} start={start} />
        )}
      </div>
    </div>
  );
}
