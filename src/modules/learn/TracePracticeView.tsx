import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DifficultyMode,
  LetterConfig,
  Point,
  SharkConfig,
  SharkTheme,
} from '../../../types';
import {
  TraceAttempt,
  TraceMetricLevels,
  computeTraceMetrics,
} from '../../logic/metrics';
import { dist, getPathPoints, getStrokeGuides, LearningCategory, splitPathStrokes } from '../../logic/tracing';
import { parseViewBox } from '../../logic/viewBox';
import { playSound, speak, speakItemPrimary, speakLetterName, speakLetterThenWord } from '../../logic/audio';
import FriendlyShark from '../../components/FriendlyShark';
import ImagePickerModal from '../../components/ImagePickerModal';
import AnimalEncouragement from '../../components/AnimalEncouragement';
import { pickAnyEncouragement } from '../../data/encouragement';

const DIFFICULTY_CONFIG: Record<
  DifficultyMode,
  { snapDistance: number; returnDistance: number; successCoverage: number; successFollow: number }
> = {
  guide: { snapDistance: 12, returnDistance: 18, successCoverage: 0.82, successFollow: 0.24 },
  practice: { snapDistance: 8, returnDistance: 14, successCoverage: 0.86, successFollow: 0.31 },
  challenge: { snapDistance: 4, returnDistance: 10, successCoverage: 0.9, successFollow: 0.38 },
};

const ProgressIcons: React.FC<{ levels: TraceMetricLevels }> = ({ levels }) => {
  const rows: Array<{ icon: string; label: string; level: number }> = [
    { icon: '🧲', label: '贴近', level: levels.follow },
    { icon: '🌊', label: '顺滑', level: levels.smoothness },
    { icon: '🔗', label: '连贯', level: levels.continuity },
  ];

  return (
    <div className="w-full max-w-md bg-ocean-50 rounded-2xl p-3 mb-4">
      <div className="grid grid-cols-3 gap-2">
        {rows.map((row) => (
          <div key={row.label} className="text-center">
            <div className="text-xl">{row.icon}</div>
            <div className="text-xs font-black text-ocean-900 mb-1">{row.label}</div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={`${row.label}-${index}`}
                  className={`w-1.5 h-1.5 rounded-full ${index < row.level ? 'bg-ocean-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TracePracticeViewProps {
  item: LetterConfig;
  category: LearningCategory;
  onBack: () => void;
  onComplete: () => void;
  sharkConfig: SharkConfig;
  customImage: string | null;
  customImageVoice?: string | null;
  onUpdateImage: (img: string, voiceLabel?: string) => void;
  progressLevels: TraceMetricLevels;
  onAttemptAnalyzed: (attempt: TraceAttempt) => void;
  difficultyMode: DifficultyMode;
  theme: SharkTheme;
  themeUpgradeLevel: number;
  successPreset?: 'normal' | 'easy';
  skipDemo?: boolean;
  allowStickerCustomization?: boolean;
}

const getViewportSize = () => ({
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  height: typeof window !== 'undefined' ? window.innerHeight : 768,
});

const TracePracticeView: React.FC<TracePracticeViewProps> = ({
  item,
  category,
  onBack,
  onComplete,
  sharkConfig,
  customImage,
  customImageVoice,
  onUpdateImage,
  progressLevels,
  onAttemptAnalyzed,
  difficultyMode,
  theme,
  themeUpgradeLevel,
  successPreset = 'normal',
  skipDemo = false,
  allowStickerCustomization = true,
}) => {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDemonstrating, setIsDemonstrating] = useState(true);
  const [guideFlash, setGuideFlash] = useState(false);
  const [helperMessage, setHelperMessage] = useState('请沿着线写');
  const [showLowercase, setShowLowercase] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [viewport, setViewport] = useState(getViewportSize);
  const supportsCaseToggle = /^[A-Z]$/.test(item.char);
  const isShapeChallenge = category === 'shapes';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const viewBoxBounds = useMemo(() => parseViewBox(item.viewBox), [item.viewBox]);
  const pathPoints = useMemo(() => getPathPoints(item.svgPath), [item.svgPath]);
  const strokePathPoints = useMemo(
    () => splitPathStrokes(item.svgPath).map((segment) => getPathPoints(segment, 70)).filter((points) => points.length > 0),
    [item.svgPath]
  );
  const computedGuides = useMemo(() => getStrokeGuides(item.svgPath, item.viewBox), [item.svgPath, item.viewBox]);
  const guides = useMemo(
    () => (item.strokeGuides && item.strokeGuides.length > 0 ? item.strokeGuides : computedGuides),
    [item.strokeGuides, computedGuides]
  );
  const expectedStrokeCount = Math.max(
    1,
    item.strokeCountHint || item.strokeGuides?.length || strokePathPoints.length || guides.length
  );
  const orderedGuides = guides.slice(0, expectedStrokeCount);
  const activeStrokeIndex = Math.min(strokes.length, expectedStrokeCount - 1);
  const activeGuidePoints =
    strokePathPoints[activeStrokeIndex] && strokePathPoints[activeStrokeIndex].length > 0
      ? strokePathPoints[activeStrokeIndex]
      : pathPoints;
  const activeGuide = orderedGuides[activeStrokeIndex] || orderedGuides[0] || null;
  const hasValidPath = pathPoints.length > 0;
  const unitScale = Math.max(0.5, Math.min(2.5, Math.min(viewBoxBounds.width, viewBoxBounds.height) / 100));
  const traceStrokeWidth = Math.max(5, 12 * unitScale);
  const guideStrokeWidth = Math.max(4, 10 * unitScale);
  const guideBubbleRadius = Math.max(3, 4 * unitScale);
  const difficultyConfig = DIFFICULTY_CONFIG[difficultyMode];
  const scaledDifficulty = {
    snapDistance: difficultyConfig.snapDistance * unitScale,
    returnDistance: difficultyConfig.returnDistance * unitScale,
  };
  const successConfig =
    successPreset === 'easy'
      ? {
          minPoints: 10,
          coverageThreshold: 9,
          successCoverage: Math.max(0.42, difficultyConfig.successCoverage - 0.35),
          successFollow: Math.max(0.1, difficultyConfig.successFollow - 0.12),
        }
      : {
          minPoints: 10,
          coverageThreshold: 7,
          successCoverage: difficultyConfig.successCoverage,
          successFollow: difficultyConfig.successFollow,
      };
  const isLandscape = viewport.width > viewport.height;
  const traceBoxSize = useMemo(() => {
    const byHeight = viewport.height * (isLandscape ? 0.3 : 0.34);
    const byWidth = viewport.width * 0.78;
    return Math.max(150, Math.min(380, byHeight, byWidth));
  }, [isLandscape, viewport.height, viewport.width]);

  const isDragging = useRef(false);
  const [nextGuideIndex, setNextGuideIndex] = useState(0);
  const [returnBubble, setReturnBubble] = useState<Point | null>(null);

  const spokenCue = (customImageVoice || item.word || '').trim();
  const cueIsEnglish = /^[A-Za-z][A-Za-z\s'-]*$/.test(spokenCue);

  const speakLetterWithCue = (delay = 0) => {
    if (!spokenCue) {
      speakLetterThenWord(item.char, item.word);
      return;
    }
    if (cueIsEnglish) {
      speakLetterThenWord(item.char, spokenCue);
      return;
    }
    speakLetterName(item.char);
    window.setTimeout(() => speak(spokenCue, 'zh-CN', 0.54), delay);
  };

  useEffect(() => {
    const updateViewport = () => setViewport(getViewportSize());
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  useEffect(() => {
    activePointerIdRef.current = null;
    isDragging.current = false;
    setStrokes([]);
    setCurrentStroke([]);
    setNextGuideIndex(0);
    setReturnBubble(null);
    setHelperMessage(isShapeChallenge ? '从第1笔开始画线' : '从第1笔起点开始写');
    setIsDemonstrating(!skipDemo);
    
    let wordTimer: number | null = null;
    if (supportsCaseToggle) {
      speakLetterWithCue(skipDemo ? 320 : 980);
    } else {
      speakItemPrimary(item);
      const wordDelay = skipDemo ? 320 : 1300;
      wordTimer = window.setTimeout(() => {
        speak(spokenCue || item.word, cueIsEnglish ? 'en-US' : 'zh-CN', 0.54);
      }, wordDelay);
    }

    let timer: number | null = null;
    if (!skipDemo) {
      timer = window.setTimeout(() => setIsDemonstrating(false), 3000);
    }

    return () => {
      if (timer !== null) window.clearTimeout(timer);
      if (wordTimer !== null) window.clearTimeout(wordTimer);
    };
  }, [item, isShapeChallenge, supportsCaseToggle, skipDemo, spokenCue, cueIsEnglish]);

  const handleReplay = () => {
    activePointerIdRef.current = null;
    isDragging.current = false;
    setStrokes([]);
    setCurrentStroke([]);
    setNextGuideIndex(0);
    setReturnBubble(null);
    setHelperMessage(isShapeChallenge ? '从第1笔开始画线' : '再试一次，从第1笔开始');
    setIsDemonstrating(!skipDemo);
    if (supportsCaseToggle) {
      speakLetterWithCue(skipDemo ? 320 : 980);
    } else {
      speakItemPrimary(item);
      window.setTimeout(() => {
        speak(spokenCue || item.word, cueIsEnglish ? 'en-US' : 'zh-CN', 0.54);
      }, skipDemo ? 260 : 980);
    }
    if (!skipDemo) {
      window.setTimeout(() => {
        setIsDemonstrating(false);
      }, 3000);
    }
  };

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, t: Date.now() };

    const rect = canvas.getBoundingClientRect();

    return {
      x: viewBoxBounds.minX + ((e.clientX - rect.left) / rect.width) * viewBoxBounds.width,
      y: viewBoxBounds.minY + ((e.clientY - rect.top) / rect.height) * viewBoxBounds.height,
      t: Date.now(),
    };
  };

  const findNearestPathPoint = (point: Point, sourcePoints: Point[]) => {
    if (sourcePoints.length === 0) {
      return { point, index: 0, distance: Number.POSITIVE_INFINITY };
    }
    let minDistance = Number.POSITIVE_INFINITY;
    let nearestPoint = sourcePoints[0];
    let nearestIndex = 0;
    for (let i = 0; i < sourcePoints.length; i++) {
      const candidate = sourcePoints[i];
      const d = dist(point, candidate);
      if (d < minDistance) {
        minDistance = d;
        nearestPoint = candidate;
        nearestIndex = i;
      }
    }
    return { point: nearestPoint, index: nearestIndex, distance: minDistance };
  };

  const handleStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDemonstrating) return;
    if (activePointerIdRef.current !== null) return;
    if (e.pointerType === 'touch' && !e.isPrimary) return;
    if (!hasValidPath) {
      setHelperMessage('这条线今天打盹啦，返回换一个试试');
      return;
    }
    e.preventDefault();
    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    playSound('start');
    const rawPoint = getCanvasPoint(e);
    const nearest = findNearestPathPoint(rawPoint, activeGuidePoints);
    if (nearest.distance <= scaledDifficulty.snapDistance) {
      setNextGuideIndex((prev) => Math.max(prev, nearest.index));
      setCurrentStroke([{ ...nearest.point, t: rawPoint.t }]);
      setReturnBubble(null);
      return;
    }
    if (nearest.distance > scaledDifficulty.returnDistance) {
      setReturnBubble(nearest.point);
      setHelperMessage('跟着蓝泡泡回到线条');
    }
    setCurrentStroke([rawPoint]);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || isDemonstrating || e.pointerId !== activePointerIdRef.current) return;
    e.preventDefault();
    const rawPoint = getCanvasPoint(e);
    const nearest = findNearestPathPoint(rawPoint, activeGuidePoints);
    let drawPoint = rawPoint;

    if (nearest.distance <= scaledDifficulty.snapDistance) {
      drawPoint = { ...nearest.point, t: rawPoint.t };
      setNextGuideIndex((prev) => Math.max(prev, nearest.index));
      setReturnBubble(null);
    } else if (nearest.distance > scaledDifficulty.returnDistance) {
      setReturnBubble(nearest.point);
      setHelperMessage(
        difficultyMode === 'challenge' ? '自由写也可以，想贴线就跟着蓝泡泡' : '跟着蓝泡泡回到线条'
      );
    } else {
      setReturnBubble(null);
    }

    setCurrentStroke((prev) => [...prev, drawPoint]);
  };

  const handleEnd = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || e.pointerId !== activePointerIdRef.current) return;
    e.preventDefault();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    activePointerIdRef.current = null;
    isDragging.current = false;
    if (currentStroke.length < 2) {
      setCurrentStroke([]);
      setHelperMessage(`第${Math.min(expectedStrokeCount, strokes.length + 1)}笔再写长一点`);
      return;
    }
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke([]);
    setNextGuideIndex(0);
    checkSuccess(newStrokes);
  };

  const handleCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointerIdRef.current) return;
    activePointerIdRef.current = null;
    isDragging.current = false;
    setCurrentStroke([]);
    setReturnBubble(null);
    setHelperMessage('小手准备好，再从蓝色起点开始');
  };

  const checkSuccess = (currentStrokes: Point[][]) => {
    if (!hasValidPath) {
      setHelperMessage('这条线今天打盹啦，返回换一个试试');
      return;
    }
    const allUserPoints = currentStrokes.flat();
    const drawnStrokeCount = currentStrokes.filter((stroke) => stroke.length > 1).length;

    if (allUserPoints.length < successConfig.minPoints) {
      playSound('guide');
      setGuideFlash(true);
      window.setTimeout(() => setGuideFlash(false), 380);
      setHelperMessage('还差一点点，再写一笔就完成啦');
      speak('还差一点点，再写一笔', 'zh-CN', 0.6);
      return;
    }

    if (drawnStrokeCount < expectedStrokeCount) {
      const nextStroke = Math.min(expectedStrokeCount, drawnStrokeCount + 1);
      setHelperMessage(`继续第${nextStroke}笔（共${expectedStrokeCount}笔）`);
      setReturnBubble(null);
      return;
    }

    const metrics = computeTraceMetrics(currentStrokes, pathPoints);
    const attempt: TraceAttempt = {
      at: Date.now(),
      scores: metrics.scores,
      levels: metrics.levels,
    };
    onAttemptAnalyzed(attempt);

    let coveredCount = 0;
    const coverageThreshold = successConfig.coverageThreshold * unitScale;

    for (const targetP of pathPoints) {
      let isCovered = false;
      for (const point of allUserPoints) {
        if (dist(point, targetP) < coverageThreshold) {
          isCovered = true;
          break;
        }
      }
      if (isCovered) coveredCount++;
    }

    const coverage = coveredCount / pathPoints.length;
    let minIndex = pathPoints.length;
    let maxIndex = 0;
    for (const point of allUserPoints) {
      const nearest = findNearestPathPoint(point, pathPoints);
      minIndex = Math.min(minIndex, nearest.index);
      maxIndex = Math.max(maxIndex, nearest.index);
    }
    const pathSpan = Math.max(1, pathPoints.length - 1);
    const progressRatio = (maxIndex - minIndex) / pathSpan;
    const startsNearStart = minIndex <= pathPoints.length * 0.2;
    const reachesPathTail = maxIndex >= pathPoints.length * 0.86;

    const guideStartTolerance = Math.max(8, 16 * unitScale);
    const orderedStartOk =
      orderedGuides.length === expectedStrokeCount
        ? currentStrokes.slice(0, expectedStrokeCount).every((stroke, index) => {
            if (!stroke[0]) return false;
            return dist(stroke[0], orderedGuides[index]) <= guideStartTolerance;
          })
        : true;

    const isSuccess =
      coverage > successConfig.successCoverage &&
      metrics.scores.follow > successConfig.successFollow &&
      progressRatio > 0.7 &&
      startsNearStart &&
      reachesPathTail &&
      orderedStartOk;

    if (isSuccess) {
      playSound('end');
      setHelperMessage(pickAnyEncouragement());
      setReturnBubble(null);
      window.setTimeout(onComplete, 450);
      return;
    }

    playSound('guide');
    setGuideFlash(true);
    window.setTimeout(() => setGuideFlash(false), 550);
    // Failed attempts should reset so wrong traces do not accumulate into a later pass.
    window.setTimeout(() => {
      setStrokes([]);
      setCurrentStroke([]);
      setNextGuideIndex(0);
      setReturnBubble(null);
    }, 280);
    if (!orderedStartOk) {
      setHelperMessage(`按 ${Array.from({ length: expectedStrokeCount }, (_, i) => i + 1).join('-')} 号顺序再来一次`);
      speak('按气泡顺序一笔一划来，我们再试一次', 'zh-CN', 0.58);
      return;
    }
    if (difficultyMode === 'challenge') {
      setHelperMessage('很棒的尝试，已清空，按右上角↺可再来一次');
      speak('很棒的尝试，已经清空，我们再来一次', 'zh-CN', 0.6);
    } else if (coverage > 0.72) {
      setHelperMessage('快完成啦，已清空，重新从起点写');
      speak('快完成啦，已经清空，从起点再试一笔', 'zh-CN', 0.62);
    } else {
      setHelperMessage('没关系，已清空，回到起点慢慢写');
      speak('没关系，已经清空，回到起点慢慢写', 'zh-CN', 0.6);
    }
  };

  return (
    <div className="h-full flex flex-col bg-ocean-500">
      <div className={`flex-none flex justify-between items-center ${isLandscape ? 'px-3 py-2' : 'p-4'}`}>
        <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
          🔙
        </button>
        <div className="flex gap-3">
          <span className="bg-white/20 px-3 py-2 rounded-xl text-white font-black text-sm flex items-center">
            {difficultyMode === 'guide' ? '引导模式' : difficultyMode === 'practice' ? '练习模式' : '挑战模式'}
          </span>
          {supportsCaseToggle && (
            <button
              onClick={() => setShowLowercase(!showLowercase)}
              className={`bg-white/20 px-4 py-2 rounded-xl text-white font-bold text-xl active:scale-95 border-2 ${
                showLowercase ? 'border-white bg-white/30' : 'border-transparent'
              }`}
            >
              Aa
            </button>
          )}
          <button onClick={handleReplay} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            ↺
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className={`min-h-full flex flex-col items-center justify-start ${isLandscape ? 'p-2 pb-3' : 'p-4'}`}>
          <div
            className={`bg-white rounded-[3rem] shadow-2xl flex flex-col items-center w-full max-w-2xl relative ${
              isLandscape ? 'p-4' : 'p-6'
            }`}
          >
            <div
              className={`absolute inset-0 rounded-[3rem] border-8 pointer-events-none transition-colors duration-300 ${
                guideFlash ? 'border-coral animate-pulse' : 'border-transparent'
              }`}
            ></div>

            <div className={`flex items-center ${isLandscape ? 'gap-4 mb-3' : 'gap-8 mb-4'}`}>
              <span
                className={`font-black text-ocean-900 select-none ${
                  isLandscape ? 'text-7xl md:text-8xl' : 'text-8xl md:text-9xl'
                }`}
              >
                {supportsCaseToggle && showLowercase ? `${item.char} ${item.char.toLowerCase()}` : item.char}
              </span>
              <div className="flex flex-col items-center relative group">
                <div className="relative">
                  {customImage ? (
                    <img
                      src={customImage}
                      alt={item.word}
                      className={`${isLandscape ? 'w-24 h-24' : 'w-28 h-28 md:w-32 md:h-32'} object-contain animate-bounce-gentle rounded-lg`}
                    />
                  ) : (
                    <span className={`${isLandscape ? 'text-6xl' : 'text-7xl md:text-8xl'} select-none animate-bounce-gentle block`}>{item.emoji}</span>
                  )}
                  {allowStickerCustomization && (
                    <button
                      onClick={() => setShowMagicModal(true)}
                      className="absolute -bottom-2 -right-2 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 hover:bg-purple-600"
                      title="Customize Image"
                    >
                      ✨
                    </button>
                  )}
                </div>
              </div>
            </div>

            <ProgressIcons levels={progressLevels} />

            <div
              className={`relative shrink-0 touch-none ${
                guideFlash ? 'animate-[shake_0.5s_ease-in-out]' : ''
              }`}
              style={{ width: `${traceBoxSize}px`, height: `${traceBoxSize}px` }}
            >
              <svg viewBox={item.viewBox} className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <path id="tracePath" d={item.svgPath} />
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d={item.svgPath}
                  stroke="#d1d5db"
                  strokeWidth={traceStrokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.92"
                />
                <path
                  d={item.svgPath}
                  stroke={guideFlash ? '#fb7185' : '#e5e7eb'}
                  strokeWidth={Math.max(2, traceStrokeWidth * 0.58)}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />

                {difficultyMode === 'guide' && !isDemonstrating && hasValidPath && activeGuidePoints.length > 0 && (
                  <polyline
                    points={activeGuidePoints
                      .slice(nextGuideIndex, Math.min(activeGuidePoints.length, nextGuideIndex + 18))
                      .map((point) => `${point.x},${point.y}`)
                      .join(' ')}
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth={guideStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.95"
                  />
                )}

                {isDemonstrating && hasValidPath && (
                  <>
                    <use
                      href="#tracePath"
                      stroke="#fbbf24"
                      strokeWidth={traceStrokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-[dash_3s_linear_forwards]"
                      strokeDasharray="300"
                      strokeDashoffset="300"
                    />
                    <circle r="8" fill="#fbbf24" stroke="white" strokeWidth="2" filter="url(#glow)">
                      <animateMotion dur="3s" fill="freeze" calcMode="linear">
                        <mpath href="#tracePath" />
                      </animateMotion>
                    </circle>
                  </>
                )}

                {strokes.map((stroke, index) => (
                  <polyline
                    key={index}
                    points={stroke.map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth={traceStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                <polyline
                  points={currentStroke.map((point) => `${point.x},${point.y}`).join(' ')}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth={traceStrokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {!isDemonstrating &&
                  hasValidPath &&
                  orderedGuides.map((guide, index) => {
                    const isActive = index === activeStrokeIndex;
                    return (
                      <g
                        key={guide.id}
                        transform={`translate(${guide.x}, ${guide.y})`}
                        className={`pointer-events-none transition-opacity duration-300 ${
                          isActive ? 'opacity-100' : index < activeStrokeIndex ? 'opacity-45' : 'opacity-20'
                        }`}
                      >
                        <circle
                          r={guideBubbleRadius + Math.max(1.8, 2.2 * unitScale)}
                          fill="white"
                          opacity={isActive ? 0.98 : 0.78}
                          className="drop-shadow-md"
                        />
                        <circle
                          r={guideBubbleRadius}
                          fill={isActive ? '#0ea5e9' : index < activeStrokeIndex ? '#22c55e' : '#94a3b8'}
                          stroke="white"
                          strokeWidth={Math.max(1.1, 1.3 * unitScale)}
                        />
                        <text
                          y={guideBubbleRadius * 0.35}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize={Math.max(4, 5 * unitScale)}
                          fontFamily="Varela Round, sans-serif"
                          fontWeight="bold"
                        >
                          {guide.id}
                        </text>

                        {isActive && (
                          <g transform={`rotate(${guide.angle}) translate(${Math.max(7, 9 * unitScale)}, 0)`}>
                            <path
                              d="M 0 -2 L 3 0 L 0 2"
                              fill="none"
                              stroke="white"
                              strokeWidth={Math.max(3, 3.2 * unitScale)}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M 0 -2 L 3 0 L 0 2"
                              fill="none"
                              stroke="#0ea5e9"
                              strokeWidth={Math.max(1.2, 1.5 * unitScale)}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        )}
                      </g>
                    );
                  })}

                {!isDemonstrating && returnBubble && hasValidPath && (
                  <g transform={`translate(${returnBubble.x}, ${returnBubble.y})`}>
                    <circle
                      r={Math.max(4.6, 5.6 * unitScale)}
                      fill="#38bdf8"
                      stroke="white"
                      strokeWidth={Math.max(1.2, 1.5 * unitScale)}
                      opacity="0.95"
                    />
                    <path
                      d="M -2 0 L 2 -4 M 2 -4 L 2 2"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
              </svg>

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair opacity-0 touch-none select-none"
                width={Math.round(traceBoxSize)}
                height={Math.round(traceBoxSize)}
                style={{
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                }}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={handleStart}
                onPointerMove={handleMove}
                onPointerUp={handleEnd}
                onPointerCancel={handleCancel}
                onLostPointerCapture={handleCancel}
              />
            </div>

            {!hasValidPath && (
              <div className="mt-5 rounded-2xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-center">
                <p className="text-sm font-black text-yellow-800">这条线今天打盹啦</p>
                <p className="text-xs font-bold text-yellow-700 mt-1">点左上角返回，换一个字母/数字/线条继续</p>
              </div>
            )}
            {isShapeChallenge && <p className="text-sm text-ocean-600 font-black mb-2">10-20 秒线条小挑战</p>}
            {activeGuide && !isDemonstrating && (
              <p className="mt-4 text-ocean-700 font-black text-sm">
                当前第{Math.min(expectedStrokeCount, activeStrokeIndex + 1)}笔，跟着 {activeGuide.id} 号气泡
              </p>
            )}
            <p className="mt-2 text-gray-400 font-bold text-lg">{isDemonstrating ? '看这里！' : helperMessage}</p>
            {!isDemonstrating && <p className="text-xs text-gray-400 mt-1">小鲨鱼在陪你慢慢练习</p>}
            {!isDemonstrating && !isLandscape && (
              <AnimalEncouragement compact className="mt-3 w-full max-w-md bg-ocean-50/80 border-ocean-100" />
            )}
          </div>
        </div>
      </div>

      <div className={`flex-none flex justify-center pointer-events-none ${isLandscape ? 'p-2' : 'p-4'}`}>
        <FriendlyShark
          className={isLandscape ? 'w-16 h-16' : 'w-24 h-24'}
          config={sharkConfig}
          theme={theme}
          upgradeLevel={themeUpgradeLevel}
        />
      </div>

      {allowStickerCustomization && (
        <ImagePickerModal
          isOpen={showMagicModal}
          onClose={() => setShowMagicModal(false)}
          item={item}
          currentImage={customImage}
          onSave={(img, voiceLabel) => onUpdateImage(img, voiceLabel)}
        />
      )}
    </div>
  );
};

export default TracePracticeView;
