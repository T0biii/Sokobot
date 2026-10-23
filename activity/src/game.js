// Sokoban-Logik, portiert aus der alten Java-Version (Grid/Player/Box).
// Eine Kiste, die auf einem Ziel landet, wird zur festen Wand.

const MAX_BOXES = 8;

export function boardSize(level) {
  let width = 9;
  let height = 6;
  for (let i = 1; i < level; i++) {
    if (width < 13) width += 2;
    if (height < 8) height += 1;
  }
  return { width, height };
}

export class Grid {
  constructor(level, random = Math.random) {
    this.level = level;
    this.random = random;
    const { width, height } = boardSize(level);
    this.width = width;
    this.height = height;
    this.boxCount = Math.min(level, MAX_BOXES);
    this.generate();
  }

  int(n) {
    return Math.floor(this.random() * n);
  }

  generate() {
    this.color = this.int(6);
    this.boxes = [];
    this.destinations = [];
    this.player = { x: 2, y: 2 };

    while (this.boxes.length < this.boxCount) {
      const x = this.int(this.width - 4) + 2;
      const y = this.int(this.height - 4) + 2;
      const blocked = (x === 2 && y === 2) || this.boxes.some((b) => b.y === y && Math.abs(b.x - x) <= 1);
      if (!blocked) this.boxes.push({ x, y, ox: x, oy: y });
    }

    while (this.destinations.length < this.boxCount) {
      const x = this.int(this.width - 2) + 1;
      const y = this.int(this.height - 2) + 1;
      const taken = this.boxes.some((b) => b.x === x && b.y === y)
        || this.destinations.some((d) => d.x === x && d.y === y);
      if (!taken) this.destinations.push({ x, y });
    }
  }

  reset() {
    for (const b of this.boxes) {
      b.x = b.ox;
      b.y = b.oy;
    }
    this.player = { x: 2, y: 2 };
  }

  isDestination(x, y) {
    return this.destinations.some((d) => d.x === x && d.y === y);
  }

  boxAt(x, y) {
    return this.boxes.find((b) => b.x === x && b.y === y) ?? null;
  }

  // Rand und Kisten auf einem Ziel sind nicht mehr passierbar.
  isWall(x, y) {
    if (x <= 0 || y <= 0 || x >= this.width - 1 || y >= this.height - 1) return true;
    const box = this.boxAt(x, y);
    return box !== null && this.isDestination(x, y);
  }

  isBox(x, y) {
    return this.boxAt(x, y) !== null && !this.isDestination(x, y);
  }

  move(dx, dy) {
    const nx = this.player.x + dx;
    const ny = this.player.y + dy;
    if (this.isWall(nx, ny)) return false;
    if (this.isBox(nx, ny)) {
      const bx = nx + dx;
      const by = ny + dy;
      if (this.isWall(bx, by) || this.isBox(bx, by)) return false;
      const box = this.boxAt(nx, ny);
      box.x = bx;
      box.y = by;
    }
    this.player = { x: nx, y: ny };
    return true;
  }

  hasWon() {
    return this.destinations.every((d) => this.boxAt(d.x, d.y) !== null);
  }
}
