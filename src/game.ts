export const SIZE = 4;
export type Direction = 'up' | 'down' | 'left' | 'right';
export interface Tile { id: number; value: number; row: number; col: number; merged?: boolean; isNew?: boolean; }
export interface GameState { tiles: Tile[]; score: number; won: boolean; over: boolean; keepPlaying: boolean; }

let nextId = 1;
export const newId = () => nextId++;

export type Rng = () => number;

export function emptyCells(tiles: Tile[]): [number, number][] {
  const occ = new Set(tiles.map(t => t.row * SIZE + t.col));
  const res: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!occ.has(r * SIZE + c)) res.push([r, c]);
  return res;
}

export function spawnTile(tiles: Tile[], rng: Rng = Math.random): Tile[] {
  const cells = emptyCells(tiles);
  if (!cells.length) return tiles;
  const [row, col] = cells[Math.floor(rng() * cells.length)];
  const value = rng() < 0.9 ? 2 : 4;
  return [...tiles, { id: newId(), value, row, col, isNew: true }];
}

export function newGame(rng: Rng = Math.random): GameState {
  return { tiles: spawnTile(spawnTile([], rng), rng), score: 0, won: false, over: false, keepPlaying: false };
}

/** Build a state from a 2D grid of values (0 = empty). Useful for tests. */
export function fromGrid(grid: number[][]): Tile[] {
  const tiles: Tile[] = [];
  grid.forEach((row, r) => row.forEach((v, c) => { if (v) tiles.push({ id: newId(), value: v, row: r, col: c }); }));
  return tiles;
}

export function toGrid(tiles: Tile[]): number[][] {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  tiles.forEach(t => (g[t.row][t.col] = t.value));
  return g;
}

export interface MoveResult { tiles: Tile[]; gained: number; moved: boolean; }

/** Slide tiles in a direction. Each tile merges at most once per move. Merged-away tiles are dropped. */
export function slide(tiles: Tile[], dir: Direction): MoveResult {
  const out: Tile[] = [];
  let gained = 0, moved = false;
  for (let line = 0; line < SIZE; line++) {
    // collect tiles in this line ordered from the edge they move toward
    const inLine = tiles.filter(t => (dir === 'left' || dir === 'right' ? t.row : t.col) === line);
    const key = (t: Tile) => (dir === 'left' || dir === 'right' ? t.col : t.row);
    inLine.sort((a, b) => (dir === 'left' || dir === 'up' ? key(a) - key(b) : key(b) - key(a)));
    let pos = 0;
    let last: Tile | null = null;
    for (const t of inLine) {
      if (last && last.value === t.value && !last.merged) {
        last.value *= 2; last.merged = true; gained += last.value; moved = true;
        continue;
      }
      const idx = dir === 'left' || dir === 'up' ? pos : SIZE - 1 - pos;
      const row = dir === 'left' || dir === 'right' ? line : idx;
      const col = dir === 'left' || dir === 'right' ? idx : line;
      if (row !== t.row || col !== t.col) moved = true;
      last = { id: t.id, value: t.value, row, col };
      out.push(last);
      pos++;
    }
  }
  return { tiles: out, gained, moved };
}

export function canMove(tiles: Tile[]): boolean {
  if (tiles.length < SIZE * SIZE) return true;
  const g = toGrid(tiles);
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (c + 1 < SIZE && g[r][c] === g[r][c + 1]) return true;
    if (r + 1 < SIZE && g[r][c] === g[r + 1][c]) return true;
  }
  return false;
}

export function move(state: GameState, dir: Direction, rng: Rng = Math.random): GameState {
  if (state.over || (state.won && !state.keepPlaying)) return state;
  const res = slide(state.tiles, dir);
  if (!res.moved) return state;
  const tiles = spawnTile(res.tiles, rng);
  const won = state.won || tiles.some(t => t.value >= 2048);
  return { ...state, tiles, score: state.score + res.gained, won, over: !canMove(tiles) };
}
