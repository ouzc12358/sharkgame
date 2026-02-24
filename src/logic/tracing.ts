import { Point } from '../../types';
import { MissionItem } from './missions';

export type LearningCategory = 'letters' | 'numbers' | 'shapes';

export const dist = (p1: Point, p2: Point) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getPathPoints = (svgPathString: string, numPoints = 100): Point[] => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', svgPathString);
  const length = path.getTotalLength();
  const points: Point[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const p = path.getPointAtLength((i / numPoints) * length);
    points.push({ x: p.x, y: p.y });
  }
  return points;
};

export const getStrokeGuides = (d: string) => {
  if (!d) return [];
  const segments = d.split(/(?=[Mm])/).filter((s) => s.trim().length > 0);

  const rawGuides = segments
    .map((seg, i) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', seg);
      const len = path.getTotalLength();
      if (len === 0) return null;

      const start = path.getPointAtLength(0);
      const offset = Math.min(8, len / 2);
      const end = path.getPointAtLength(offset);
      const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

      return {
        id: i + 1,
        x: start.x,
        y: start.y,
        angle,
      };
    })
    .filter((g): g is { id: number; x: number; y: number; angle: number } => Boolean(g));

  return rawGuides.map((guide, index) => {
    const overlapping = rawGuides
      .slice(0, index)
      .filter((g) => dist({ x: g.x, y: g.y }, { x: guide.x, y: guide.y }) < 4).length;

    if (overlapping === 0) return guide;

    const radialAngle = (guide.angle + overlapping * 70) * (Math.PI / 180);
    const offset = 7 * overlapping;
    return {
      ...guide,
      x: Math.max(8, Math.min(92, guide.x + Math.cos(radialAngle) * offset)),
      y: Math.max(8, Math.min(92, guide.y + Math.sin(radialAngle) * offset)),
    };
  });
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
