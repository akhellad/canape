import { CANVAS, type Stroke } from './logic';

export interface Surface {
  context: CanvasRenderingContext2D;
  size: number;
}

export function prepare(canvas: HTMLCanvasElement): Surface | null {
  const context = canvas.getContext('2d');
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
  surface.context.clearRect(0, 0, surface.size, surface.size);
}

export function drawStroke(surface: Surface, stroke: Pick<Stroke, 'color' | 'size' | 'points'>, fromPoint = 0): void {
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

export function redraw(surface: Surface, strokes: readonly Pick<Stroke, 'color' | 'size' | 'points'>[]): void {
  clear(surface);
  for (const stroke of strokes) drawStroke(surface, stroke);
}
