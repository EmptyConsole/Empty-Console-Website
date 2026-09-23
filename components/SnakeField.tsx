"use client";

import { useEffect, useRef, type RefObject } from "react";

const CELL = 16;
const STROKE = 2;
const INSET = 1;
const RESPAWN_GAP = 160;

type Cell = { x: number; y: number };

type Snake = {
  color: string;
  body: Cell[];
  dir: Cell;
  interval: number;
  acc: number;
  grow: number;
  origin: number | null;
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
  origin: number | null;
  elapsed: number;
};

type DeathEvent = {
  color: string;
  body: Cell[];
  impact: Cell;
  origin: number | null;
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
  SPECS.forEach((spec, origin) => {
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
      origin,
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

function spawnOrigin(
  origin: number,
  cols: number,
  rows: number,
  snakes: Snake[],
): boolean {
  const spec = SPECS[origin];
  if (!spec) return true;
  if (snakes.some((snake) => snake.origin === origin)) return true;
  const preferredY = Math.min(rows - 1, Math.max(0, Math.floor(rows * spec.band)));
  const body = placeSnake(
    cols,
    rows,
    spec.length,
    spec.dir,
    preferredY,
    occupiedCells(snakes),
  );
  if (!body) return false;
  snakes.push({
    color: spec.color,
    body,
    dir: spec.dir,
    interval: spec.interval,
    acc: 0,
    grow: 0,
    origin,
  });
  return true;
}

function chooseDir(snake: Snake, cols: number, rows: number): Cell | null {
  const self = new Set(snake.body.map(cellKey));
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

    const owner = cellOwner.get(cellKey(next));
    if (owner && owner !== snake) {
      for (const cell of snake.body) {
        if (cellOwner.get(cellKey(cell)) === snake) cellOwner.delete(cellKey(cell));
      }
      dead.add(snake);
      if (!dead.has(owner)) {
        const bonus = Math.max(1, Math.round(snake.body.length * 0.3));
        grantGrowth(owner, bonus, cellOwner, cols, rows);
      }
      deaths.push({
        color: snake.color,
        body: snake.body.map((cell) => ({ x: cell.x, y: cell.y })),
        impact: next,
        origin: snake.origin,
      });
      continue;
    }

    if (growing) snake.grow -= 1;
    snake.body = growing
      ? [next, ...snake.body]
      : [next, ...snake.body.slice(0, -1)];
    snake.dir = dir;
    cellOwner.set(cellKey(next), snake);
  }

  for (let i = snakes.length - 1; i >= 0; i -= 1) {
    if (dead.has(snakes[i])) snakes.splice(i, 1);
  }
  return deaths;
}

function cellStrokes(cell: Cell): Edge[] {
  const x = cell.x * CELL + INSET;
  const y = cell.y * CELL + INSET;
  const size = CELL - INSET * 2;
  const span = size - STROKE * 2;
  return [
    { x, y, w: size, h: STROKE },
    { x, y: y + size - STROKE, w: size, h: STROKE },
    { x, y: y + STROKE, w: STROKE, h: span },
    { x: x + size - STROKE, y: y + STROKE, w: STROKE, h: span },
  ];
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
    for (const edge of cellStrokes(cell)) emitBits(bits, edge, index);
  });
  if (!occupied.has(cellKey(event.impact))) {
    for (const edge of cellStrokes(event.impact)) emitBits(bits, edge, 0);
  }
  return { color: event.color, bits, origin: event.origin, elapsed: 0 };
}

function deathDuration(anim: DeathAnim) {
  return anim.bits.reduce((max, bit) => Math.max(max, bit.delay + bit.life), 640);
}

function drawSnakes(ctx: CanvasRenderingContext2D, snakes: Snake[]) {
  for (const snake of snakes) {
    ctx.fillStyle = snake.color;
    for (const cell of snake.body) {
      for (const edge of cellStrokes(cell)) {
        ctx.fillRect(edge.x, edge.y, edge.w, edge.h);
      }
    }
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

export default function SnakeField({
  addRef,
}: {
  addRef: RefObject<(() => void) | null>;
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
    let respawns: { origin: number; left: number }[] = [];
    let last = performance.now();
    let raf = 0;

    const queueRespawn = (origin: number, delay: number) => {
      if (snakes.some((snake) => snake.origin === origin)) return;
      const pending = respawns.find((job) => job.origin === origin);
      if (pending) {
        pending.left = Math.max(pending.left, delay);
        return;
      }
      respawns.push({ origin, left: delay });
    };

    const addSnake = () => {
      const occupied = occupiedCells(snakes);
      const used = new Set(snakes.map((snake) => snake.color));
      const color =
        PALETTE.find((item) => !used.has(item) && !RESERVED.has(item)) ??
        PALETTE.find((item) => !used.has(item)) ??
        PALETTE[snakes.length % PALETTE.length];
      const length = 5 + Math.floor(Math.random() * 3);
      const dir = Math.random() < 0.5 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      const preferredY = Math.floor(Math.random() * Math.max(1, rows));
      const body = placeSnake(cols, rows, length, dir, preferredY, occupied);
      if (!body) return;
      snakes.push({
        color,
        body,
        dir,
        interval: 240 + Math.floor(Math.random() * 120),
        acc: 0,
        grow: 0,
        origin: null,
      });
    };

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
      const holdMissingOrigins = () => {
        for (let origin = 0; origin < SPECS.length; origin += 1) {
          if (snakes.some((snake) => snake.origin === origin)) continue;
          queueRespawn(origin, 280);
        }
      };
      if (inside.length !== snakes.length) {
        if (inside.length > 0) {
          for (const snake of snakes) {
            if (inside.includes(snake)) continue;
            if (snake.origin !== null) queueRespawn(snake.origin, 280);
          }
          snakes = inside;
        } else {
          snakes = createSnakes(nextCols, nextRows);
          deaths = [];
          respawns = [];
          holdMissingOrigins();
        }
      } else if (snakes.length === 0 && respawns.length === 0) {
        snakes = createSnakes(nextCols, nextRows);
        holdMissingOrigins();
      }
      cols = nextCols;
      rows = nextRows;
    };

    const draw = () => {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, host.clientWidth, host.clientHeight);
      drawSnakes(ctx, snakes);
      drawDeaths(ctx, deaths);
    };

    const frame = (now: number) => {
      const dt = Math.min(80, now - last);
      last = now;
      if (!reduceMotion) {
        const events = stepSnakes(snakes, dt, cols, rows);
        for (const event of events) deaths.push(createDeath(event));

        const finished: DeathAnim[] = [];
        for (const anim of deaths) anim.elapsed += dt;
        deaths = deaths.filter((anim) => {
          if (anim.elapsed < deathDuration(anim)) return true;
          finished.push(anim);
          return false;
        });
        for (const anim of finished) {
          if (anim.origin !== null) queueRespawn(anim.origin, RESPAWN_GAP);
        }

        respawns = respawns.filter((job) => {
          job.left -= dt;
          if (job.left > 0) return true;
          if (spawnOrigin(job.origin, cols, rows, snakes)) return false;
          job.left = 280;
          return true;
        });
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
