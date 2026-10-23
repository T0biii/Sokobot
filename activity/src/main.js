import { DiscordSDK } from '@discord/embedded-app-sdk';
import { Grid } from './game.js';
import './style.css';

const WALL_COLORS = ['#ed4245', '#f0883e', '#fee75c', '#57f287', '#5865f2', '#9b59b6'];
const LEVEL_KEY = 'sokobot-level';

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const levelEl = document.getElementById('level');
const playerEl = document.getElementById('player');
const winEl = document.getElementById('win');
const nextLevelEl = document.getElementById('next-level');

let level = loadLevel();
let grid = new Grid(level);
let cell = 40;

function loadLevel() {
  try {
    return Math.max(1, parseInt(localStorage.getItem(LEVEL_KEY), 10) || 1);
  } catch {
    return 1;
  }
}

function saveLevel() {
  try {
    localStorage.setItem(LEVEL_KEY, String(level));
  } catch {
    // Speichern ist optional.
  }
}

function resize() {
  const wrap = document.getElementById('board-wrap');
  const availW = wrap.clientWidth;
  const availH = Math.max(120, window.innerHeight - wrap.getBoundingClientRect().top - 190);
  cell = Math.max(16, Math.floor(Math.min(availW / grid.width, availH / grid.height)));
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${cell * grid.width}px`;
  canvas.style.height = `${cell * grid.height}px`;
  canvas.width = cell * grid.width * dpr;
  canvas.height = cell * grid.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function glyph(text, x, y) {
  ctx.font = `${Math.floor(cell * 0.7)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x * cell + cell / 2, y * cell + cell / 2 + cell * 0.04);
}

function draw() {
  const wallColor = WALL_COLORS[grid.color];
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      ctx.fillStyle = grid.isWall(x, y) ? wallColor : '#1e1f22';
      ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
      if (grid.isDestination(x, y) && !grid.isWall(x, y)) glyph('❎', x, y);
    }
  }
  for (const b of grid.boxes) {
    if (grid.isDestination(b.x, b.y)) continue;
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(b.x * cell + 2, b.y * cell + 2, cell - 5, cell - 5);
  }
  glyph('😳', grid.player.x, grid.player.y);
  levelEl.textContent = `Level ${level}`;
}

function startLevel() {
  grid = new Grid(level);
  winEl.hidden = true;
  saveLevel();
  resize();
}

function act(action) {
  if (!winEl.hidden) {
    if (action === 'next') {
      level += 1;
      startLevel();
    }
    return;
  }
  const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  if (moves[action]) {
    if (!grid.move(...moves[action])) return;
  } else if (action === 'reset') {
    grid.reset();
  } else if (action === 'newmap') {
    grid = new Grid(level);
    resize();
    return;
  } else {
    return;
  }
  draw();
  if (grid.hasWon()) {
    nextLevelEl.textContent = level + 1;
    winEl.hidden = false;
  }
}

const KEYS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  r: 'reset', R: 'reset',
  n: 'newmap', N: 'newmap',
  Enter: 'next', ' ': 'next',
};

window.addEventListener('keydown', (e) => {
  const action = KEYS[e.key];
  if (!action) return;
  e.preventDefault();
  act(action);
});

document.getElementById('controls').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (btn) act(btn.dataset.move ?? btn.dataset.action);
});
document.getElementById('next').addEventListener('click', () => act('next'));
window.addEventListener('resize', resize);

async function setupDiscord() {
  // Außerhalb von Discord (lokaler Test im Browser) gibt es keine frame_id.
  if (!new URLSearchParams(window.location.search).has('frame_id')) return;
  const { clientId } = await (await fetch('/api/config')).json();
  const sdk = new DiscordSDK(clientId);
  await sdk.ready();
  const { code } = await sdk.commands.authorize({
    client_id: clientId,
    response_type: 'code',
    state: '',
    prompt: 'none',
    scope: ['identify'],
  });
  const res = await fetch('/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const { access_token } = await res.json();
  const auth = await sdk.commands.authenticate({ access_token });
  playerEl.textContent = auth.user.global_name ?? auth.user.username;
}

resize();
setupDiscord().catch((err) => console.error('Discord-Anmeldung fehlgeschlagen', err));
