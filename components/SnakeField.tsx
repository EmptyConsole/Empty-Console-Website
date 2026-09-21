"use client";

import { useEffect, useRef, type RefObject } from "react";

const CELL = 16;
const STROKE = 2;
const CORNER = 2;

type Cell = { x: number; y: number };

type Snake = {
  color: string;
  body: Cell[];
  dir: Cell;
  interval: number;
  acc: number;
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
  for (const spec of SPECS) {
    const preferredY = Math.min(rows - 1, Math.max(0, Math.floor(rows * spec.band)));
    const body = placeSnake(
      cols,
      rows,
      spec.length,
      spec.dir,
      preferredY,
      occupied,
    );
    if (!body) continue;
    for (const cell of body) occupied.add(cellKey(cell));
    snakes.push({
      color: spec.color,
      body,
      dir: spec.dir,
      interval: spec.interval,
      acc: 0,
    });
  }
  return snakes;
}

function chooseDir(
  snake: Snake,
  occupied: Set<string>,
  cols: number,
  rows: number,
): Cell | null {
  const head = snake.body[0];
  const tail = snake.body[snake.body.length - 1];
  const tailKey = cellKey(tail);
  const [left, right] = sideDirs(snake.dir);
  const candidates: Cell[] = [];

  if (Math.random() < 0.22) {
    pushDir(candidates, Math.random() < 0.5 ? left : right);
  }

  pushDir(candidates, snake.dir);
  pushDir(candidates, left);
  pushDir(candidates, right);

  for (const dir of candidates) {
    if (dir.x === -snake.dir.x && dir.y === -snake.dir.y) continue;
    const next = { x: head.x + dir.x, y: head.y + dir.y };
    if (!inGrid(next, cols, rows)) continue;
    const key = cellKey(next);
    if (occupied.has(key) && key !== tailKey) continue;
    return dir;
  }
  return null;
}

function stepSnakes(
  snakes: Snake[],
  dt: number,
  cols: number,
  rows: number,
) {
  const occupied = new Set<string>();
  for (const snake of snakes) {
    for (const cell of snake.body) occupied.add(cellKey(cell));
  }

  for (const snake of snakes) {
    snake.acc += dt;
    if (snake.acc < snake.interval) continue;
    snake.acc -= snake.interval;

    const dir = chooseDir(snake, occupied, cols, rows);
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
    occupied.delete(cellKey(tail));
    occupied.add(cellKey(next));
    snake.body = [next, ...snake.body.slice(0, -1)];
    snake.dir = dir;
  }
}

function drawSnakes(ctx: CanvasRenderingContext2D, snakes: Snake[]) {
  for (const snake of snakes) {
    const occupied = new Set(snake.body.map(cellKey));
    ctx.fillStyle = snake.color;
    for (const cell of snake.body) {
      const n = occupied.has(`${cell.x},${cell.y - 1}`);
      const e = occupied.has(`${cell.x + 1},${cell.y}`);
      const s = occupied.has(`${cell.x},${cell.y + 1}`);
      const w = occupied.has(`${cell.x - 1},${cell.y}`);
      const convTL = !n && !w && !occupied.has(`${cell.x - 1},${cell.y - 1}`);
      const convTR = !n && !e && !occupied.has(`${cell.x + 1},${cell.y - 1}`);
      const convBL = !s && !w && !occupied.has(`${cell.x - 1},${cell.y + 1}`);
      const convBR = !s && !e && !occupied.has(`${cell.x + 1},${cell.y + 1}`);
      const x = cell.x * CELL;
      const y = cell.y * CELL;

      if (!n) {
        const x0 = x + (convTL ? CORNER : 0);
        const x1 = x + CELL - (convTR ? CORNER : 0);
        ctx.fillRect(x0, y, x1 - x0, STROKE);
      }
      if (!s) {
        const x0 = x + (convBL ? CORNER : 0);
        const x1 = x + CELL - (convBR ? CORNER : 0);
        ctx.fillRect(x0, y + CELL - STROKE, x1 - x0, STROKE);
      }
      if (!w) {
        const y0 = y + (convTL ? CORNER : 0);
        const y1 = y + CELL - (convBL ? CORNER : 0);
        ctx.fillRect(x, y0, STROKE, y1 - y0);
      }
      if (!e) {
        const y0 = y + (convTR ? CORNER : 0);
        const y1 = y + CELL - (convBR ? CORNER : 0);
        ctx.fillRect(x + CELL - STROKE, y0, STROKE, y1 - y0);
      }
    }
  }
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
    let last = performance.now();
    let raf = 0;

    const addSnake = () => {
      const occupied = new Set<string>();
      for (const snake of snakes) {
        for (const cell of snake.body) occupied.add(cellKey(cell));
      }
      const used = new Set(snakes.map((snake) => snake.color));
      const color =
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
      if (inside.length !== snakes.length) {
        snakes = inside.length > 0 ? inside : createSnakes(nextCols, nextRows);
      } else if (snakes.length === 0) {
        snakes = createSnakes(nextCols, nextRows);
      }
      cols = nextCols;
      rows = nextRows;
    };

    const draw = () => {
      ctx.clearRect(0, 0, host.clientWidth, host.clientHeight);
      drawSnakes(ctx, snakes);
    };

    const frame = (now: number) => {
      const dt = Math.min(80, now - last);
      last = now;
      if (!reduceMotion) stepSnakes(snakes, dt, cols, rows);
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
