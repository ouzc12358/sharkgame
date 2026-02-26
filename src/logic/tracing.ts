import { Point, StrokeGuide } from '../../types';
import { MissionItem } from './missions';
import { clampToViewBox, parseViewBox } from './viewBox';

export type LearningCategory = 'letters' | 'numbers' | 'shapes';

export const dist = (p1: Point, p2: Point) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getPathPoints = (svgPathString: string, numPoints = 100): Point[] => {
  if (!svgPathString) return [];
  try {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', svgPathString);
    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) return [];

    const points: Point[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const p = path.getPointAtLength((i / numPoints) * length);
      points.push({ x: p.x, y: p.y });
    }
    return points;
  } catch {
    return [];
  }
};

export const splitPathStrokes = (d: string): string[] => {
  if (!d || !d.trim()) return [];
  const matches = d.match(/[Mm][^Mm]*/g);
  if (!matches || matches.length === 0) return [d];
  return matches.map((segment) => segment.trim()).filter(Boolean);
};

export const getStrokeGuides = (d: string, viewBox?: string): StrokeGuide[] => {
  if (!d) return [];
  const bounds = parseViewBox(viewBox);
  const segments = splitPathStrokes(d);

  try {
    const rawGuides = segments
      .map((seg, i) => {
        try {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', seg);
          const len = path.getTotalLength();
          if (!Number.isFinite(len) || len <= 0) return null;

          const start = path.getPointAtLength(0);
          const offset = Math.min(bounds.width * 0.08, len / 2);
          const end = path.getPointAtLength(offset);
          const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

          return {
            id: i + 1,
            x: start.x,
            y: start.y,
            angle,
          };
        } catch {
          return null;
        }
      })
      .filter((g): g is StrokeGuide => Boolean(g));

    const overlapDistance = Math.max(2.5, Math.min(bounds.width, bounds.height) * 0.04);
    const spreadOffset = Math.max(4.5, Math.min(bounds.width, bounds.height) * 0.07);
    const pad = Math.max(1, Math.min(bounds.width, bounds.height) * 0.06);

    return rawGuides.map((guide, index) => {
      const overlapping = rawGuides
        .slice(0, index)
        .filter((g) => dist({ x: g.x, y: g.y }, { x: guide.x, y: guide.y }) < overlapDistance).length;

      if (overlapping === 0) return guide;

      const radialAngle = (guide.angle + overlapping * 70) * (Math.PI / 180);
      const offset = spreadOffset * overlapping;
      const moved = clampToViewBox(
        guide.x + Math.cos(radialAngle) * offset,
        guide.y + Math.sin(radialAngle) * offset,
        bounds,
        pad
      );
      return {
        ...guide,
        x: moved.x,
        y: moved.y,
      };
    });
  } catch {
    return [];
  }
};

export const getPracticeItemKey = (
  char: string,
  category: LearningCategory | MissionItem['type']
) => {
  if (category === 'numbers' || category === 'number') return `number:${char}`;
  if (category === 'shapes' || category === 'shape') return `shape:${char}`;
  return `letter:${char}`;
};

export const missionTypeToCategory = (type: MissionItem['type']): LearningCategory => {
  if (type === 'number') return 'numbers';
  if (type === 'shape') return 'shapes';
  return 'letters';
};
