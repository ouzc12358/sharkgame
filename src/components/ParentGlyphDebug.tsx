import React, { useMemo } from 'react';
import { LETTER_ITEMS, NUMBER_ITEMS, SHAPE_ITEMS } from '../../constants';
import { getPathPoints, getStrokeGuides } from '../logic/tracing';

interface GlyphDebugItem {
  key: string;
  category: 'letters' | 'numbers' | 'shapes';
  char: string;
  word: string;
  svgPath: string;
  viewBox: string;
  manualGuides: Array<{ id: number; x: number; y: number; angle?: number }>;
}

const categoryLabel: Record<GlyphDebugItem['category'], string> = {
  letters: '字母',
  numbers: '数字',
  shapes: '线条',
};

const ParentGlyphDebug: React.FC = () => {
  const items = useMemo<GlyphDebugItem[]>(
    () => [
      ...LETTER_ITEMS.map((item) => ({
        key: `letter:${item.char}`,
        category: 'letters' as const,
        char: item.char,
        word: item.word,
        svgPath: item.svgPath,
        viewBox: item.viewBox,
        manualGuides: item.strokeGuides || [],
      })),
      ...NUMBER_ITEMS.map((item) => ({
        key: `number:${item.char}`,
        category: 'numbers' as const,
        char: item.char,
        word: item.word,
        svgPath: item.svgPath,
        viewBox: item.viewBox,
        manualGuides: item.strokeGuides || [],
      })),
      ...SHAPE_ITEMS.map((item) => ({
        key: `shape:${item.char}`,
        category: 'shapes' as const,
        char: item.char,
        word: item.word,
        svgPath: item.svgPath,
        viewBox: item.viewBox,
        manualGuides: item.strokeGuides || [],
      })),
    ],
    []
  );

  const debugRows = useMemo(
    () =>
      items.map((item) => {
        const points = getPathPoints(item.svgPath, 120);
        const computedGuides = getStrokeGuides(item.svgPath, item.viewBox);
        const hasInvalidPath = points.length === 0;
        const hasNoGuide = computedGuides.length === 0 && item.manualGuides.length === 0;
        return {
          ...item,
          pointsCount: points.length,
          computedGuides,
          hasInvalidPath,
          hasNoGuide,
        };
      }),
    [items]
  );

  const invalidCount = debugRows.filter((row) => row.hasInvalidPath || row.hasNoGuide).length;

  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-black text-ocean-900">Glyph Debug</h3>
        <p className="text-xs font-black text-gray-600">
          总数 {debugRows.length} · 异常 {invalidCount}
        </p>
      </div>

      <p className="text-xs font-bold text-gray-500 mb-3">
        灰色=模板路径，蓝点=自动起笔点，橙点=手动起笔点。红框表示路径或引导异常。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto pr-1">
        {debugRows.map((row) => {
          const hasIssue = row.hasInvalidPath || row.hasNoGuide;
          return (
            <div
              key={row.key}
              className={`rounded-xl border p-3 ${
                hasIssue ? 'border-red-300 bg-red-50' : 'border-emerald-200 bg-emerald-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-black text-ocean-900">
                  {row.char} <span className="text-xs text-gray-500">{row.word}</span>
                </p>
                <span className="text-[11px] font-black text-gray-600">{categoryLabel[row.category]}</span>
              </div>

              <div className="rounded-xl bg-white border border-gray-200 p-2 mb-2">
                <svg viewBox={row.viewBox} className="w-full h-24 bg-gray-50 rounded-lg">
                  <path
                    d={row.svgPath}
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                  {row.computedGuides.map((guide) => (
                    <g key={`auto-${row.key}-${guide.id}`}>
                      <circle cx={guide.x} cy={guide.y} r="3.8" fill="#0ea5e9" stroke="white" strokeWidth="1.5" />
                      <text x={guide.x} y={guide.y + 1.5} textAnchor="middle" fontSize="4" fill="white" fontWeight="700">
                        {guide.id}
                      </text>
                    </g>
                  ))}
                  {row.manualGuides.map((guide) => (
                    <g key={`manual-${row.key}-${guide.id}`}>
                      <circle cx={guide.x} cy={guide.y} r="3.8" fill="#fb923c" stroke="white" strokeWidth="1.5" />
                      <text x={guide.x} y={guide.y + 1.5} textAnchor="middle" fontSize="4" fill="white" fontWeight="700">
                        {guide.id}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <p className="text-[11px] font-bold text-gray-700 break-all">viewBox: {row.viewBox}</p>
              <p className="text-[11px] font-bold text-gray-700">path points: {row.pointsCount}</p>
              <p className="text-[11px] font-bold text-gray-700">auto guides: {row.computedGuides.length}</p>
              <p className="text-[11px] font-bold text-gray-700">manual guides: {row.manualGuides.length}</p>

              {row.hasInvalidPath && (
                <p className="text-[11px] font-black text-red-600 mt-1">路径读取失败：getTotalLength 返回空。</p>
              )}
              {row.hasNoGuide && (
                <p className="text-[11px] font-black text-red-600 mt-1">无起笔点：请补充手动 strokeGuides 或修正 path。</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParentGlyphDebug;
