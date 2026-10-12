import { useCallback, useEffect, useRef, useState } from 'react';
import { Direction, GameState, move, newGame } from './game';

const BEST_KEY = '2048-best';
const KEYS: Record<string, Direction> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};

export default function App() {
  const [state, setState] = useState<GameState>(() => newGame());
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY)) || 0);
  const boardRef = useRef<HTMLDivElement>(null);

  const doMove = useCallback((d: Direction) => setState(s => move(s, d)), []);

  useEffect(() => {
    if (state.score > best) { setBest(state.score); localStorage.setItem(BEST_KEY, String(state.score)); }
  }, [state.score, best]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = KEYS[e.key];
      if (d) { e.preventDefault(); doMove(d); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doMove]);

  useEffect(() => {
    const el = boardRef.current!;
    let sx = 0, sy = 0, active = false;
    const start = (e: TouchEvent) => { if (e.touches.length !== 1) return; active = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const mv = (e: TouchEvent) => { if (active) e.preventDefault(); };
    const end = (e: TouchEvent) => {
      if (!active) return; active = false;
      const t = e.changedTouches[0]; const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', mv, { passive: false });
    el.addEventListener('touchend', end);
    return () => { el.removeEventListener('touchstart', start); el.removeEventListener('touchmove', mv); el.removeEventListener('touchend', end); };
  }, [doMove]);

  const showWin = state.won && !state.keepPlaying;
  return (
    <div className="app">
      <header>
        <h1>2048</h1>
        <div className="scores">
          <div className="score"><span>Score</span>{state.score}</div>
          <div className="score"><span>Best</span>{best}</div>
        </div>
      </header>
      <div className="bar">
        <p>Join the tiles, get to <b>2048!</b></p>
        <button onClick={() => setState(newGame())}>New Game</button>
      </div>
      <div className="board" ref={boardRef}>
        {Array.from({ length: 16 }, (_, i) => <div key={i} className="cell" style={{ ['--r' as string]: Math.floor(i / 4), ['--c' as string]: i % 4 }} />)}
        {state.tiles.map(t => (
          <div key={t.id} className="tile" style={{ ['--r' as string]: t.row, ['--c' as string]: t.col }}>
            <div className={`inner v${t.value > 2048 ? 'super' : t.value}${t.merged ? ' merged' : ''}${t.isNew ? ' new' : ''}`}
              key={`${t.id}-${t.value}`}>{t.value}</div>
          </div>
        ))}
        {(showWin || state.over) && (
          <div className={`overlay ${showWin ? 'win' : ''}`}>
            <h2>{showWin ? 'You win!' : 'Game over!'}</h2>
            <div>
              {showWin && <button onClick={() => setState(s => ({ ...s, keepPlaying: true }))}>Keep going</button>}
              <button onClick={() => setState(newGame())}>Try again</button>
            </div>
          </div>
        )}
      </div>
      <p className="help">Use <b>arrow keys</b> or <b>WASD</b> — or swipe on mobile.</p>
    </div>
  );
}
