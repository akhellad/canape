import { CANVAS, PAPER, type Stroke } from './pad';

export interface Surface {
  context: CanvasRenderingContext2D;
  size: number;
}

type Drawable = Pick<Stroke, 'color' | 'size' | 'points' | 'fill'>;

/** How far a pixel's colour may be from the one under the bucket and still get painted (anti-aliased edges). */
const FILL_TOLERANCE = 96;

export function prepare(canvas: HTMLCanvasElement): Surface | null {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const size = Math.max(1, Math.round(canvas.clientWidth * ratio));
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size;
    canvas.height = size;
  }
  context.lineCap = 'round';
  context.lineJoin = 'round';
  return { context, size };
}

export function clear(surface: Surface): void {
  surface.context.fillStyle = PAPER;
  surface.context.fillRect(0, 0, surface.size, surface.size);
}

export function drawStroke(surface: Surface, stroke: Drawable, fromPoint = 0): void {
  if (stroke.fill) {
    if (fromPoint === 0) floodFill(surface, stroke.points[0], stroke.points[1], stroke.color);
    return;
  }
  const { context, size } = surface;
  const scale = size / CANVAS;
  const points = stroke.points;
  const count = points.length / 2;
  if (count === 0) return;
  context.strokeStyle = stroke.color;
  context.fillStyle = stroke.color;
  context.lineWidth = stroke.size * scale;
  if (count === 1) {
    context.beginPath();
    context.arc(points[0] * scale, points[1] * scale, (stroke.size * scale) / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }
  const start = Math.max(0, fromPoint - 1);
  context.beginPath();
  context.moveTo(points[start * 2] * scale, points[start * 2 + 1] * scale);
  for (let i = start + 1; i < count; i++) context.lineTo(points[i * 2] * scale, points[i * 2 + 1] * scale);
  context.stroke();
}

export function redraw(surface: Surface, strokes: readonly Drawable[]): void {
  clear(surface);
  for (const stroke of strokes) drawStroke(surface, stroke);
}

function parseColor(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Paints the region around (x, y), in canvas units, that has about the same colour as that point. */
export function floodFill(surface: Surface, x: number, y: number, color: string): void {
  const { context, size } = surface;
  const scale = size / CANVAS;
  const startX = Math.min(size - 1, Math.max(0, Math.floor(x * scale)));
  const startY = Math.min(size - 1, Math.max(0, Math.floor(y * scale)));
  const image = context.getImageData(0, 0, size, size);
  const data = image.data;
  const start = (startY * size + startX) * 4;
  const target = [data[start], data[start + 1], data[start + 2]];
  const [r, g, b] = parseColor(color);
  if (Math.abs(target[0] - r) + Math.abs(target[1] - g) + Math.abs(target[2] - b) < 8) return;

  const close = (offset: number) =>
    Math.abs(data[offset] - target[0]) + Math.abs(data[offset + 1] - target[1]) + Math.abs(data[offset + 2] - target[2]) <= FILL_TOLERANCE;
  const visited = new Uint8Array(size * size);
  const stack = [startY * size + startX];
  while (stack.length) {
    const pixel = stack.pop() as number;
    if (visited[pixel]) continue;
    // Walk left and right along the row, then queue the rows above and below.
    const row = Math.floor(pixel / size);
    let left = pixel;
    while (left > row * size && !visited[left - 1] && close((left - 1) * 4)) left--;
    let right = pixel;
    while (right < row * size + size - 1 && !visited[right + 1] && close((right + 1) * 4)) right++;
    for (let p = left; p <= right; p++) {
      visited[p] = 1;
      const offset = p * 4;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
      data[offset + 3] = 255;
      if (row > 0 && !visited[p - size] && close((p - size) * 4)) stack.push(p - size);
      if (row < size - 1 && !visited[p + size] && close((p + size) * 4)) stack.push(p + size);
    }
  }
  // Half-tint the one-pixel rim the fill stopped at, so no pale halo is left along anti-aliased lines.
  const grown = new Uint8Array(visited);
  for (let p = 0; p < visited.length; p++) {
    if (visited[p]) continue;
    const column = p % size;
    if (
      (column > 0 && visited[p - 1]) ||
      (column < size - 1 && visited[p + 1]) ||
      (p >= size && visited[p - size]) ||
      (p < visited.length - size && visited[p + size])
    ) {
      grown[p] = 1;
    }
  }
  for (let p = 0; p < grown.length; p++) {
    if (!grown[p] || visited[p]) continue;
    const offset = p * 4;
    data[offset] = Math.round((data[offset] + r) / 2);
    data[offset + 1] = Math.round((data[offset + 1] + g) / 2);
    data[offset + 2] = Math.round((data[offset + 2] + b) / 2);
  }
  context.putImageData(image, 0, 0);
}
