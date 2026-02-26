export interface ViewBoxBounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
}

const DEFAULT_VIEWBOX = '0 0 100 100';

export const parseViewBox = (viewBox?: string | null): ViewBoxBounds => {
  const raw = (viewBox || DEFAULT_VIEWBOX).trim();
  const parts = raw.split(/\s+/).map((value) => Number(value));
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) {
    return parseViewBox(DEFAULT_VIEWBOX);
  }

  const [minX, minY, widthRaw, heightRaw] = parts;
  const width = widthRaw > 0 ? widthRaw : 100;
  const height = heightRaw > 0 ? heightRaw : 100;
  const maxX = minX + width;
  const maxY = minY + height;

  return {
    minX,
    minY,
    width,
    height,
    maxX,
    maxY,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  };
};

export const clampToViewBox = (x: number, y: number, bounds: ViewBoxBounds, padding = 0) => {
  const minX = bounds.minX + padding;
  const maxX = bounds.maxX - padding;
  const minY = bounds.minY + padding;
  const maxY = bounds.maxY - padding;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
};
