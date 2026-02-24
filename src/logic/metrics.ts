import { Point } from '../../types';

export interface TraceMetricScores {
  follow: number;
  smoothness: number;
  continuity: number;
}

export interface TraceMetricLevels {
  follow: 1 | 2 | 3 | 4 | 5;
  smoothness: 1 | 2 | 3 | 4 | 5;
  continuity: 1 | 2 | 3 | 4 | 5;
}

export interface TraceAttempt {
  at: number;
  scores: TraceMetricScores;
  levels: TraceMetricLevels;
}

export interface TraceMetricsStore {
  attempts: Record<string, TraceAttempt[]>;
}

const STORAGE_KEY = 'sharkgame.metrics.v1';
const MAX_ATTEMPTS_PER_ITEM = 10;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const pointDistance = (a: Point, b: Point) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const nearestPathPoint = (point: Point, pathPoints: Point[]) => {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestIndex = 0;
  for (let i = 0; i < pathPoints.length; i++) {
    const d = pointDistance(point, pathPoints[i]);
    if (d < bestDistance) {
      bestDistance = d;
      bestIndex = i;
    }
  }
  return { index: bestIndex, distance: bestDistance };
};

const flattenPoints = (strokes: Point[][]) => strokes.flat().filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

const toLevel = (score: number): 1 | 2 | 3 | 4 | 5 => {
  const raw = Math.round(clamp01(score) * 4) + 1;
  return Math.max(1, Math.min(5, raw)) as 1 | 2 | 3 | 4 | 5;
};

export const emptyMetricsStore = (): TraceMetricsStore => ({ attempts: {} });

export const loadMetricsStore = (): TraceMetricsStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyMetricsStore();
    const parsed = JSON.parse(raw) as TraceMetricsStore;
    if (!parsed || typeof parsed !== 'object' || !parsed.attempts) return emptyMetricsStore();
    return parsed;
  } catch {
    return emptyMetricsStore();
  }
};

export const saveMetricsStore = (store: TraceMetricsStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const getLatestAttempt = (store: TraceMetricsStore, itemKey: string): TraceAttempt | null => {
  const list = store.attempts[itemKey];
  if (!list || list.length === 0) return null;
  return list[list.length - 1];
};

export const addAttempt = (store: TraceMetricsStore, itemKey: string, attempt: TraceAttempt): TraceMetricsStore => {
  const previous = store.attempts[itemKey] || [];
  const next = [...previous, attempt].slice(-MAX_ATTEMPTS_PER_ITEM);
  return {
    ...store,
    attempts: {
      ...store.attempts,
      [itemKey]: next,
    },
  };
};

const computeFollow = (points: Point[], pathPoints: Point[]) => {
  if (points.length === 0 || pathPoints.length === 0) return 0;
  let total = 0;
  for (const point of points) {
    total += nearestPathPoint(point, pathPoints).distance;
  }
  const averageDistance = total / points.length;
  return clamp01(1 - averageDistance / 14);
};

const computeSmoothness = (points: Point[]) => {
  if (points.length < 3) return 0.45;
  let totalTurn = 0;
  let turns = 0;
  for (let i = 2; i < points.length; i++) {
    const a = points[i - 2];
    const b = points[i - 1];
    const c = points[i];
    const v1x = b.x - a.x;
    const v1y = b.y - a.y;
    const v2x = c.x - b.x;
    const v2y = c.y - b.y;
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
    if (mag1 < 0.5 || mag2 < 0.5) continue;
    const dot = (v1x * v2x + v1y * v2y) / (mag1 * mag2);
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
    totalTurn += Math.abs(angle);
    turns += 1;
  }
  if (turns === 0) return 0.55;
  const avgTurn = totalTurn / turns;
  return clamp01(1 - avgTurn / 1.5);
};

const computeContinuity = (strokes: Point[][], pathPoints: Point[]) => {
  const points = flattenPoints(strokes);
  if (points.length === 0) return 0;

  const penLifts = Math.max(0, strokes.length - 1);
  let pauses = 0;
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i++) {
      const prev = stroke[i - 1].t;
      const next = stroke[i].t;
      if (prev && next && next - prev > 550) pauses += 1;
    }
  }

  let backtracks = 0;
  let lastIndex = -1;
  for (const point of points) {
    const { index } = nearestPathPoint(point, pathPoints);
    if (lastIndex >= 0 && index + 4 < lastIndex) backtracks += 1;
    lastIndex = index;
  }

  const liftPenalty = Math.min(1, penLifts / 3);
  const pausePenalty = Math.min(1, pauses / 6);
  const backtrackPenalty = Math.min(1, backtracks / 12);
  const penalty = liftPenalty * 0.45 + pausePenalty * 0.2 + backtrackPenalty * 0.35;
  return clamp01(1 - penalty);
};

export const computeTraceMetrics = (strokes: Point[][], pathPoints: Point[]) => {
  const points = flattenPoints(strokes);
  const scores: TraceMetricScores = {
    follow: computeFollow(points, pathPoints),
    smoothness: computeSmoothness(points),
    continuity: computeContinuity(strokes, pathPoints),
  };
  const levels: TraceMetricLevels = {
    follow: toLevel(scores.follow),
    smoothness: toLevel(scores.smoothness),
    continuity: toLevel(scores.continuity),
  };
  return { scores, levels };
};

export const getDisplayLevels = (store: TraceMetricsStore, itemKey: string): TraceMetricLevels => {
  const attempts = store.attempts[itemKey];
  if (!attempts || attempts.length === 0) {
    return { follow: 2, smoothness: 2, continuity: 2 };
  }

  const totals = attempts.reduce(
    (acc, attempt) => ({
      follow: acc.follow + attempt.levels.follow,
      smoothness: acc.smoothness + attempt.levels.smoothness,
      continuity: acc.continuity + attempt.levels.continuity,
    }),
    { follow: 0, smoothness: 0, continuity: 0 }
  );
  const count = attempts.length;
  return {
    follow: Math.max(1, Math.min(5, Math.round(totals.follow / count))) as 1 | 2 | 3 | 4 | 5,
    smoothness: Math.max(1, Math.min(5, Math.round(totals.smoothness / count))) as 1 | 2 | 3 | 4 | 5,
    continuity: Math.max(1, Math.min(5, Math.round(totals.continuity / count))) as 1 | 2 | 3 | 4 | 5,
  };
};

const POSITIVE_PROMPTS = {
  follow: ['今天更贴近啦', '和小线更合拍啦', '越来越贴线啦'],
  smoothness: ['今天更顺啦', '线条更流畅啦', '写得更稳更顺啦'],
  continuity: ['今天更连贯啦', '一口气写得更好了', '停顿更少啦'],
  general: ['真不错，我们再来一次', '你越来越熟练啦', '小鲨鱼很喜欢你的线条'],
};

export const pickPraiseMessage = (previous: TraceAttempt | null, current: TraceAttempt) => {
  if (!previous) {
    return POSITIVE_PROMPTS.general[0];
  }

  const deltas: Array<{ key: keyof TraceMetricScores; delta: number }> = [
    { key: 'follow', delta: current.scores.follow - previous.scores.follow },
    { key: 'smoothness', delta: current.scores.smoothness - previous.scores.smoothness },
    { key: 'continuity', delta: current.scores.continuity - previous.scores.continuity },
  ];
  deltas.sort((a, b) => b.delta - a.delta);
  const best = deltas[0];
  if (best.delta > 0.03) {
    const options = POSITIVE_PROMPTS[best.key];
    const index = Math.floor(Math.random() * options.length);
    return options[index];
  }
  return POSITIVE_PROMPTS.general[Math.floor(Math.random() * POSITIVE_PROMPTS.general.length)];
};
