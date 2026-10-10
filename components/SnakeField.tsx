"use client";

import { useEffect, useRef, type RefObject } from "react";

const CELL = 16;
const STROKE = 2;
const CORNER = 2;
const INSET = 1;
const MATERIALIZE_MS = 420;
const LOCK_MS = 320;
const BLINK_MS = 360;
const FADE_MS = 180;
const LOCK_START = MATERIALIZE_MS - 120;
const SPAWN_MS = LOCK_START + LOCK_MS + BLINK_MS + FADE_MS;
// The field fills itself up to this many snakes once, then never auto-spawns
// again; after that, new snakes only come from the + snake button.
const SNAKE_TARGET = 18;
// The winner of a collision grows by this share of the loser's length.
const MEAL_SHARE = 0.5;
// Snakes longer than this stop steering around themselves and can self-destruct.
const SELF_DESTRUCT_LEN = 25;
const SPAWN_EVERY = 1000;

type Cell = { x: number; y: number };

type Snake = {
  color: string;
  body: Cell[];
  dir: Cell;
  interval: number;
  acc: number;
  grow: number;
  hold: number;
};

type Edge = { x: number; y: number; w: number; h: number };

type Bit = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  delay: number;
  life: number;
  rank: number;
};

type DeathAnim = {
  color: string;
  bits: Bit[];
  elapsed: number;
};

type DeathEvent = {
  color: string;
  body: Cell[];
  impact: Cell;
};

type Spark = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  delay: number;
};

type SpawnAnim = {
  snake: Snake;
  sparks: Spark[];
  lock: boolean;
  elapsed: number;
};

const PALETTE = [
  "#2dd4bf",
  "#f5c518",
  "#e23b3b",
  "#e14ea0",
  "#60a5fa",
  "#c084fc",
  "#fb923c",
  "#4ade80",
  "#a3e635",
  "#22d3ee",
  "#fda4af",
  "#818cf8",
  "#fef08a",
  "#f0abfc",
  "#d6d3d1",
];

const SPECS: {
  color: string;
  length: number;
  interval: number;
  dir: Cell;
  band: number;
}[] = [
  { color: "#2dd4bf", length: 5, interval: 320, dir: { x: 1, y: 0 }, band: 0.28 },
  { color: "#f5c518", length: 7, interval: 280, dir: { x: -1, y: 0 }, band: 0.52 },
  { color: "#e23b3b", length: 6, interval: 250, dir: { x: 1, y: 0 }, band: 0.76 },
];

const RESERVED = new Set(SPECS.map((spec) => spec.color));

function cellKey(cell: Cell) {
  return `${cell.x},${cell.y}`;
}

function inGrid(cell: Cell, cols: number, rows: number) {
  return cell.x >= 0 && cell.y >= 0 && cell.x < cols && cell.y < rows;
}

function sideDirs(dir: Cell): [Cell, Cell] {
  const left = { x: -dir.y, y: dir.x };
  const right = { x: dir.y, y: -dir.x };
  return Math.random() < 0.5 ? [left, right] : [right, left];
}

function pushDir(list: Cell[], dir: Cell) {
  if (dir.x === 0 && dir.y === 0) return;
  if (list.some((item) => item.x === dir.x && item.y === dir.y)) return;
  list.push(dir);
}

function trail(head: Cell, length: number, dir: Cell): Cell[] {
  const body: Cell[] = [];
  for (let i = 0; i < length; i += 1) {
    body.push({ x: head.x - dir.x * i, y: head.y - dir.y * i });
  }
  return body;
}

function fits(body: Cell[], cols: number, rows: number, occupied: Set<string>) {
  return body.every(
    (cell) => inGrid(cell, cols, rows) && !occupied.has(cellKey(cell)),
  );
}

function placeSnake(
  cols: number,
  rows: number,
  length: number,
  dir: Cell,
  preferredY: number,
  occupied: Set<string>,
): Cell[] | null {
  const yOrder = Array.from({ length: rows }, (_, y) => y).sort(
    (a, b) => Math.abs(a - preferredY) - Math.abs(b - preferredY),
  );
  for (const y of yOrder) {
    if (dir.x > 0) {
      for (let headX = length - 1; headX < cols; headX += 1) {
        const body = trail({ x: headX, y }, length, dir);
        if (fits(body, cols, rows, occupied)) return body;
      }
    } else if (dir.x < 0) {
      for (let headX = cols - length; headX >= 0; headX -= 1) {
        const body = trail({ x: headX, y }, length, dir);
        if (fits(body, cols, rows, occupied)) return body;
      }
    }
  }
  return null;
}

function createSnakes(cols: number, rows: number): Snake[] {
  const occupied = new Set<string>();
  const snakes: Snake[] = [];
  SPECS.forEach((spec) => {
    const preferredY = Math.min(rows - 1, Math.max(0, Math.floor(rows * spec.band)));
    const body = placeSnake(
      cols,
      rows,
      spec.length,
      spec.dir,
      preferredY,
      occupied,
    );
    if (!body) return;
    for (const cell of body) occupied.add(cellKey(cell));
    snakes.push({
      color: spec.color,
      body,
      dir: spec.dir,
      interval: spec.interval,
      acc: 0,
      grow: 0,
      hold: 0,
    });
  });
  return snakes;
}

function occupiedCells(snakes: Snake[]) {
  const occupied = new Set<string>();
  for (const snake of snakes) {
    for (const cell of snake.body) occupied.add(cellKey(cell));
  }
  return occupied;
}

function padCells(cells: Set<string>, pad: number) {
  const out = new Set<string>();
  for (const key of cells) {
    const [x, y] = key.split(",").map(Number);
    for (let dy = -pad; dy <= pad; dy += 1) {
      for (let dx = -pad; dx <= pad; dx += 1) out.add(`${x + dx},${y + dy}`);
    }
  }
  return out;
}

// Random spot for a new snake, kept clear of other snakes and of whatever
// covers the canvas, so the spawn is visible. Null when nothing fits.
function findSpawn(
  cols: number,
  rows: number,
  length: number,
  avoid: Set<string>,
  [yMin, yMax]: [number, number],
): { body: Cell[]; dir: Cell } | null {
  for (let tries = 0; tries < 240; tries += 1) {
    const dir = Math.random() < 0.5 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    const y = yMin + Math.floor(Math.random() * (yMax - yMin + 1));
    if (y < 0 || y >= rows) continue;
    const headX =
      dir.x > 0
        ? length - 1 + Math.floor(Math.random() * Math.max(1, cols - length + 1))
        : Math.floor(Math.random() * Math.max(1, cols - length + 1));
    const body = trail({ x: headX, y }, length, dir);
    if (!fits(body, cols, rows, avoid)) continue;
    // Leave room ahead so it doesn't spawn into an instant crash.
    const ahead = { x: headX + dir.x * 2, y };
    if (!inGrid(ahead, cols, rows) || avoid.has(cellKey(ahead))) continue;
    return { body, dir };
  }
  return null;
}

function canSelfDestruct(snake: Snake) {
  return snake.body.length > SELF_DESTRUCT_LEN;
}

function chooseDir(snake: Snake, cols: number, rows: number): Cell | null {
  const self = new Set(canSelfDestruct(snake) ? [] : snake.body.map(cellKey));
  const tailKey = cellKey(snake.body[snake.body.length - 1]);
  const freeTail = snake.grow <= 0;
  const [left, right] = sideDirs(snake.dir);
  const candidates: Cell[] = [];

  if (Math.random() < 0.22) {
    pushDir(candidates, Math.random() < 0.5 ? left : right);
  }

  pushDir(candidates, snake.dir);
  pushDir(candidates, left);
  pushDir(candidates, right);

  const head = snake.body[0];
  for (const dir of candidates) {
    if (dir.x === -snake.dir.x && dir.y === -snake.dir.y) continue;
    const next = { x: head.x + dir.x, y: head.y + dir.y };
    if (!inGrid(next, cols, rows)) continue;
    const key = cellKey(next);
    if (self.has(key) && !(freeTail && key === tailKey)) continue;
    return dir;
  }
  return null;
}

function tailExtension(snake: Snake): Cell {
  const tail = snake.body[snake.body.length - 1];
  const before = snake.body[snake.body.length - 2];
  if (!before) return { x: tail.x - snake.dir.x, y: tail.y - snake.dir.y };
  return {
    x: tail.x + (tail.x - before.x),
    y: tail.y + (tail.y - before.y),
  };
}

function grantGrowth(
  snake: Snake,
  amount: number,
  cellOwner: Map<string, Snake>,
  cols: number,
  rows: number,
) {
  let left = amount;
  while (left > 0) {
    const cell = tailExtension(snake);
    const key = cellKey(cell);
    if (!inGrid(cell, cols, rows) || cellOwner.has(key)) {
      snake.grow += left;
      return;
    }
    snake.body.push(cell);
    cellOwner.set(key, snake);
    left -= 1;
  }
}

function stepSnakes(
  snakes: Snake[],
  dt: number,
  cols: number,
  rows: number,
): DeathEvent[] {
  const deaths: DeathEvent[] = [];
  const dead = new Set<Snake>();
  const cellOwner = new Map<string, Snake>();
  for (const snake of snakes) {
    for (const cell of snake.body) cellOwner.set(cellKey(cell), snake);
  }

  for (const snake of snakes) {
    if (dead.has(snake)) continue;
    if (snake.hold > 0) {
      snake.hold -= dt;
      continue;
    }
    snake.acc += dt;
    if (snake.acc < snake.interval) continue;
    snake.acc -= snake.interval;

    const dir = chooseDir(snake, cols, rows);
    if (!dir) {
      const tail = snake.body[snake.body.length - 1];
      const before = snake.body[snake.body.length - 2];
      if (!before) continue;
      snake.body.reverse();
      snake.dir = { x: tail.x - before.x, y: tail.y - before.y };
      continue;
    }

    const head = snake.body[0];
    const tail = snake.body[snake.body.length - 1];
    const next = { x: head.x + dir.x, y: head.y + dir.y };
    const growing = snake.grow > 0;
    const tailKey = cellKey(tail);
    if (!growing) cellOwner.delete(tailKey);

    // On a collision the longer snake eats the shorter one, whoever ran into
    // whom, and grows by half its length. Ties go against the one that hit.
    // Long snakes that run into themselves just die.
    let meal = 0;
    const owner = cellOwner.get(cellKey(next));
    if (owner === snake) {
      for (const cell of snake.body) {
        if (cellOwner.get(cellKey(cell)) === snake) cellOwner.delete(cellKey(cell));
      }
      dead.add(snake);
      deaths.push({
        color: snake.color,
        body: snake.body.map((cell) => ({ x: cell.x, y: cell.y })),
        impact: next,
      });
      continue;
    }
    if (owner) {
      const victim = snake.body.length > owner.body.length ? owner : snake;
      const eater = victim === snake ? owner : snake;
      for (const cell of victim.body) {
        if (cellOwner.get(cellKey(cell)) === victim) cellOwner.delete(cellKey(cell));
      }
      dead.add(victim);
      deaths.push({
        color: victim.color,
        body: victim.body.map((cell) => ({ x: cell.x, y: cell.y })),
        impact: next,
      });
      const gain = Math.max(1, Math.round(victim.body.length * MEAL_SHARE));
      if (eater !== snake) {
        grantGrowth(eater, gain, cellOwner, cols, rows);
        continue;
      }
      meal = gain;
    }

    if (growing) snake.grow -= 1;
    snake.body = growing
      ? [next, ...snake.body]
      : [next, ...snake.body.slice(0, -1)];
    snake.dir = dir;
    cellOwner.set(cellKey(next), snake);
    if (meal > 0) grantGrowth(snake, meal, cellOwner, cols, rows);
  }

  for (let i = snakes.length - 1; i >= 0; i -= 1) {
    if (dead.has(snakes[i])) snakes.splice(i, 1);
  }
  return deaths;
}

type Side = "n" | "e" | "s" | "w";

type Links = Record<Side, boolean>;

const OPEN: Links = { n: false, e: false, s: false, w: false };

function linkSide(from: Cell, to: Cell | undefined): Side | null {
  if (!to) return null;
  if (to.x === from.x && to.y === from.y - 1) return "n";
  if (to.x === from.x + 1 && to.y === from.y) return "e";
  if (to.x === from.x && to.y === from.y + 1) return "s";
  if (to.x === from.x - 1 && to.y === from.y) return "w";
  return null;
}

function chainLinks(body: Cell[], index: number): Links {
  const links: Links = { n: false, e: false, s: false, w: false };
  const prev = linkSide(body[index], body[index - 1]);
  const next = linkSide(body[index], body[index + 1]);
  if (prev) links[prev] = true;
  if (next) links[next] = true;
  return links;
}

function cellStrokes(cell: Cell, links: Links, occupied: Set<string>): Edge[] {
  const touch: Links = {
    n: occupied.has(`${cell.x},${cell.y - 1}`),
    e: occupied.has(`${cell.x + 1},${cell.y}`),
    s: occupied.has(`${cell.x},${cell.y + 1}`),
    w: occupied.has(`${cell.x - 1},${cell.y}`),
  };
  const inset: Links = {
    n: !links.n && touch.n,
    e: !links.e && touch.e,
    s: !links.s && touch.s,
    w: !links.w && touch.w,
  };
  const pad = {
    n: inset.n ? INSET : 0,
    e: inset.e ? INSET : 0,
    s: inset.s ? INSET : 0,
    w: inset.w ? INSET : 0,
  };
  const convTL = !links.n && !links.w;
  const convTR = !links.n && !links.e;
  const convBL = !links.s && !links.w;
  const convBR = !links.s && !links.e;
  const x = cell.x * CELL;
  const y = cell.y * CELL;
  const edges: Edge[] = [];

  if (!links.n) {
    const x0 = x + pad.w + (convTL ? CORNER : 0);
    const x1 = x + CELL - pad.e - (convTR ? CORNER : 0);
    if (x1 > x0) edges.push({ x: x0, y: y + pad.n, w: x1 - x0, h: STROKE });
  }
  if (!links.s) {
    const x0 = x + pad.w + (convBL ? CORNER : 0);
    const x1 = x + CELL - pad.e - (convBR ? CORNER : 0);
    if (x1 > x0) edges.push({ x: x0, y: y + CELL - pad.s - STROKE, w: x1 - x0, h: STROKE });
  }
  if (!links.w) {
    const y0 = y + pad.n + (convTL ? CORNER : 0);
    const y1 = y + CELL - pad.s - (convBL ? CORNER : 0);
    if (y1 > y0) edges.push({ x: x + pad.w, y: y0, w: STROKE, h: y1 - y0 });
  }
  if (!links.e) {
    const y0 = y + pad.n + (convTR ? CORNER : 0);
    const y1 = y + CELL - pad.s - (convBR ? CORNER : 0);
    if (y1 > y0) edges.push({ x: x + CELL - pad.e - STROKE, y: y0, w: STROKE, h: y1 - y0 });
  }
  return edges;
}

function emitBits(bits: Bit[], edge: Edge, segIndex: number) {
  for (let y = edge.y; y < edge.y + edge.h; y += 2) {
    for (let x = edge.x; x < edge.x + edge.w; x += 2) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.012 + Math.random() * 0.028;
      bits.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 0.014,
        delay: segIndex * 34 + Math.random() * 80,
        life: 420 + Math.random() * 200,
        rank: Math.random(),
      });
    }
  }
}

function createDeath(event: DeathEvent): DeathAnim {
  const bits: Bit[] = [];
  const occupied = new Set(event.body.map(cellKey));
  event.body.forEach((cell, index) => {
    for (const edge of cellStrokes(cell, chainLinks(event.body, index), occupied)) {
      emitBits(bits, edge, index);
    }
  });
  if (!occupied.has(cellKey(event.impact))) {
    for (const edge of cellStrokes(event.impact, OPEN, new Set())) {
      emitBits(bits, edge, 0);
    }
  }
  return { color: event.color, bits, elapsed: 0 };
}

function deathDuration(anim: DeathAnim) {
  return anim.bits.reduce((max, bit) => Math.max(max, bit.delay + bit.life), 640);
}

function drawSnakes(ctx: CanvasRenderingContext2D, snakes: Snake[]) {
  for (const snake of snakes) {
    const occupied = new Set(snake.body.map(cellKey));
    ctx.fillStyle = snake.color;
    snake.body.forEach((cell, index) => {
      for (const edge of cellStrokes(cell, chainLinks(snake.body, index), occupied)) {
        ctx.fillRect(edge.x, edge.y, edge.w, edge.h);
      }
    });
  }
}

function drawDeaths(ctx: CanvasRenderingContext2D, anims: DeathAnim[]) {
  for (const anim of anims) {
    ctx.fillStyle = anim.color;
    for (const bit of anim.bits) {
      const fadeAt = Math.max(0, bit.delay - 140);
      if (anim.elapsed < fadeAt) {
        ctx.globalAlpha = 1;
        ctx.fillRect(bit.x, bit.y, 2, 2);
        continue;
      }
      if (anim.elapsed < bit.delay) {
        const span = bit.delay - fadeAt;
        const progress = span <= 0 ? 1 : (anim.elapsed - fadeAt) / span;
        if (bit.rank < progress * 0.5) continue;
        if (bit.rank > 0.84 && Math.floor(anim.elapsed / 48) % 2 === 0) continue;
        ctx.globalAlpha = 1;
        ctx.fillRect(bit.x, bit.y, 2, 2);
        continue;
      }
      const travel = anim.elapsed - bit.delay;
      if (travel >= bit.life) continue;
      const x = Math.round((bit.x + bit.vx * travel) / 2) * 2;
      const y = Math.round((bit.y + bit.vy * travel + 0.00002 * travel * travel) / 2) * 2;
      ctx.globalAlpha = 1 - travel / bit.life;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
}

function spawnDuration(anim: SpawnAnim) {
  return anim.lock ? SPAWN_MS : MATERIALIZE_MS;
}

function createSpawn(snake: Snake, lock: boolean): SpawnAnim {
  const sparks: Spark[] = [];
  const occupied = new Set(snake.body.map(cellKey));
  snake.body.forEach((cell, index) => {
    for (const edge of cellStrokes(cell, chainLinks(snake.body, index), occupied)) {
      for (let y = edge.y; y < edge.y + edge.h; y += 2) {
        for (let x = edge.x; x < edge.x + edge.w; x += 2) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 16 + Math.random() * 40;
          sparks.push({
            x,
            y,
            dx: Math.cos(angle) * dist,
            dy: Math.sin(angle) * dist,
            delay: index * 18 + Math.random() * 100,
          });
        }
      }
    }
  });
  return { snake, sparks, lock, elapsed: 0 };
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

function snap(value: number) {
  return Math.round(value / 2) * 2;
}

function drawBracket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sx: number,
  sy: number,
) {
  const arm = 8;
  ctx.fillRect(sx > 0 ? x : x - arm, sy > 0 ? y : y - STROKE, arm, STROKE);
  ctx.fillRect(sx > 0 ? x : x - STROKE, sy > 0 ? y : y - arm, STROKE, arm);
}

// New snakes fly together out of scattered pixels, then get a set of
// target brackets that snap onto them and blink.
function drawSpawns(ctx: CanvasRenderingContext2D, anims: SpawnAnim[]) {
  for (const anim of anims) {
    const { snake, elapsed } = anim;
    ctx.fillStyle = snake.color;

    if (elapsed < MATERIALIZE_MS) {
      for (const spark of anim.sparks) {
        const span = MATERIALIZE_MS - spark.delay;
        const t = Math.max(0, Math.min(1, (elapsed - spark.delay) / span));
        if (t <= 0) continue;
        const k = 1 - easeOut(t);
        ctx.globalAlpha = 0.35 + 0.65 * t;
        ctx.fillRect(snap(spark.x + spark.dx * k), snap(spark.y + spark.dy * k), 2, 2);
      }
      ctx.globalAlpha = 1;
    }

    if (!anim.lock || elapsed < LOCK_START) continue;
    const t = elapsed - LOCK_START;
    const fadeStart = LOCK_MS + BLINK_MS;
    if (t > LOCK_MS && t < fadeStart && Math.floor((t - LOCK_MS) / 90) % 2 === 1) {
      continue;
    }
    ctx.globalAlpha = t > fadeStart ? Math.max(0, 1 - (t - fadeStart) / FADE_MS) : 1;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const cell of snake.body) {
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    }
    const pad = snap(4 + 44 * (1 - easeOut(Math.min(1, t / LOCK_MS))));
    const left = minX * CELL - pad;
    const top = minY * CELL - pad;
    const right = (maxX + 1) * CELL + pad;
    const bottom = (maxY + 1) * CELL + pad;
    drawBracket(ctx, left, top, 1, 1);
    drawBracket(ctx, right, top, -1, 1);
    drawBracket(ctx, left, bottom, 1, -1);
    drawBracket(ctx, right, bottom, -1, -1);
    ctx.globalAlpha = 1;
  }
}

export type AddSnake = () => string | null;

export default function SnakeField({
  addRef,
}: {
  addRef: RefObject<AddSnake | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const host = canvas.parentElement;
    if (!host) return;

    let cols = 0;
    let rows = 0;
    let snakes: Snake[] = [];
    let deaths: DeathAnim[] = [];
    let spawns: SpawnAnim[] = [];
    let last = performance.now();
    let raf = 0;
    let filling = true;
    let spawnAcc = 0;

    // Grid cells sitting under visible content (hero text, open windows).
    const coveredCells = () => {
      const covered = new Set<string>();
      const origin = host.getBoundingClientRect();
      const nodes = host.querySelectorAll<HTMLElement>(
        ".hero-copy > *, .hero-term:not([data-closed]), .scroll-hint",
      );
      nodes.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const x0 = Math.floor((rect.left - origin.left) / CELL);
        const x1 = Math.floor((rect.right - origin.left) / CELL);
        const y0 = Math.floor((rect.top - origin.top) / CELL);
        const y1 = Math.floor((rect.bottom - origin.top) / CELL);
        for (let y = y0; y <= y1; y += 1) {
          for (let x = x0; x <= x1; x += 1) covered.add(`${x},${y}`);
        }
      });
      return covered;
    };

    // Rows of the grid currently on screen (the hero can be taller than the
    // viewport on phones).
    const visibleRows = (): [number, number] => {
      const box = host.getBoundingClientRect();
      const chrome = document.querySelector<HTMLElement>(".chrome");
      const top = Math.max(box.top, chrome ? chrome.getBoundingClientRect().bottom : 0);
      const bottom = Math.min(box.bottom, window.innerHeight);
      const yMin = Math.max(0, Math.ceil((top - box.top) / CELL));
      const yMax = Math.min(rows - 1, Math.floor((bottom - box.top) / CELL) - 1);
      return yMax >= yMin ? [yMin, yMax] : [0, rows - 1];
    };

    // Button spawns get target brackets; automatic fill spawns don't.
    const spawnSnake = (lock: boolean) => {
      const occupied = occupiedCells(snakes);
      const used = new Set(snakes.map((snake) => snake.color));
      const color =
        PALETTE.find((item) => !used.has(item) && !RESERVED.has(item)) ??
        PALETTE.find((item) => !used.has(item)) ??
        PALETTE[snakes.length % PALETTE.length];
      const length = 4 + Math.floor(Math.random() * 3);
      const clear = padCells(occupied, 3);
      for (const key of coveredCells()) clear.add(key);
      let spot = findSpawn(cols, rows, length, clear, visibleRows());
      if (!spot) {
        const dir = Math.random() < 0.5 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        const preferredY = Math.floor(Math.random() * Math.max(1, rows));
        const body = placeSnake(cols, rows, length, dir, preferredY, occupied);
        spot = body ? { body, dir } : null;
      }
      if (!spot) return null;
      const snake: Snake = {
        color,
        body: spot.body,
        dir: spot.dir,
        interval: 240 + Math.floor(Math.random() * 120),
        acc: 0,
        grow: 0,
        hold: reduceMotion ? 0 : MATERIALIZE_MS,
      };
      snakes.push(snake);
      if (reduceMotion) draw();
      else spawns.push(createSpawn(snake, lock));
      return color;
    };

    const addSnake: AddSnake = () => spawnSnake(true);

    const resize = () => {
      const cssW = host.clientWidth;
      const cssH = host.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      const nextCols = Math.max(1, Math.floor(cssW / CELL));
      const nextRows = Math.max(1, Math.floor(cssH / CELL));
      const inside = snakes.filter((snake) =>
        snake.body.every((cell) => inGrid(cell, nextCols, nextRows)),
      );
      if (inside.length > 0) {
        snakes = inside;
      } else {
        snakes = createSnakes(nextCols, nextRows);
        deaths = [];
      }
      spawns = spawns.filter((anim) => snakes.includes(anim.snake));
      cols = nextCols;
      rows = nextRows;
    };

    const draw = () => {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, host.clientWidth, host.clientHeight);
      const forming = new Set(
        spawns
          .filter((anim) => anim.elapsed < MATERIALIZE_MS)
          .map((anim) => anim.snake),
      );
      drawSnakes(
        ctx,
        forming.size ? snakes.filter((snake) => !forming.has(snake)) : snakes,
      );
      drawSpawns(ctx, spawns);
      drawDeaths(ctx, deaths);
    };

    const frame = (now: number) => {
      const dt = Math.min(80, now - last);
      last = now;
      const events = stepSnakes(snakes, dt, cols, rows);
      for (const event of events) deaths.push(createDeath(event));

      for (const anim of deaths) anim.elapsed += dt;
      deaths = deaths.filter((anim) => anim.elapsed < deathDuration(anim));

      for (const anim of spawns) anim.elapsed += dt;
      spawns = spawns.filter(
        (anim) => anim.elapsed < spawnDuration(anim) && snakes.includes(anim.snake),
      );

      if (filling && snakes.length >= SNAKE_TARGET) {
        filling = false;
      } else if (filling) {
        spawnAcc += dt;
        if (spawnAcc >= SPAWN_EVERY) {
          spawnAcc -= SPAWN_EVERY;
          spawnSnake(false);
        }
      }

      draw();
      raf = window.requestAnimationFrame(frame);
    };

    const onResize = () => {
      resize();
      draw();
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(host);
    resize();
    draw();
    addRef.current = addSnake;
    window.addEventListener("resize", onResize);

    if (!reduceMotion) {
      raf = window.requestAnimationFrame(frame);
    }

    return () => {
      addRef.current = null;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [addRef]);

  return <canvas ref={canvasRef} className="snake-field" aria-hidden="true" />;
}
