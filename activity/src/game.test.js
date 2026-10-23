import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Grid, boardSize } from './game.js';

function fixedGrid(boxes, destinations) {
  const g = new Grid(1);
  g.boxes = boxes.map(([x, y]) => ({ x, y, ox: x, oy: y }));
  g.destinations = destinations.map(([x, y]) => ({ x, y }));
  g.boxCount = boxes.length;
  g.player = { x: 2, y: 2 };
  return g;
}

test('Spielfeldgröße wächst bis 13x8', () => {
  assert.deepEqual(boardSize(1), { width: 9, height: 6 });
  assert.deepEqual(boardSize(2), { width: 11, height: 7 });
  assert.deepEqual(boardSize(20), { width: 13, height: 8 });
});

test('Zufällige Level sind gültig', () => {
  for (let level = 1; level <= 12; level++) {
    for (let n = 0; n < 50; n++) {
      const g = new Grid(level);
      assert.equal(g.boxes.length, Math.min(level, 8));
      assert.equal(g.destinations.length, g.boxes.length);
      for (const b of g.boxes) assert.ok(!g.isWall(b.x, b.y) && !g.isDestination(b.x, b.y));
      assert.ok(!g.boxAt(2, 2));
    }
  }
});

test('Rand blockiert, Kiste wird geschoben', () => {
  const g = fixedGrid([[3, 2]], [[6, 3]]);
  g.player = { x: 1, y: 2 };
  assert.equal(g.move(-1, 0), false);
  g.player = { x: 2, y: 2 };
  assert.equal(g.move(1, 0), true);
  assert.deepEqual(g.player, { x: 3, y: 2 });
  assert.deepEqual(g.boxAt(4, 2) && { x: 4, y: 2 }, { x: 4, y: 2 });
});

test('Kiste auf Ziel wird fest und gewinnt', () => {
  const g = fixedGrid([[3, 2]], [[4, 2]]);
  assert.equal(g.hasWon(), false);
  assert.equal(g.move(1, 0), true);
  assert.equal(g.hasWon(), true);
  assert.equal(g.isWall(4, 2), true);
  assert.equal(g.move(1, 0), false);
});

test('Zwei Kisten hintereinander lassen sich nicht schieben', () => {
  const g = fixedGrid([[3, 2], [4, 2]], [[6, 3], [6, 4]]);
  assert.equal(g.move(1, 0), false);
});

test('Reset stellt Kisten und Spieler zurück', () => {
  const g = fixedGrid([[3, 2]], [[6, 3]]);
  g.move(1, 0);
  g.reset();
  assert.deepEqual(g.player, { x: 2, y: 2 });
  assert.ok(g.boxAt(3, 2));
});
