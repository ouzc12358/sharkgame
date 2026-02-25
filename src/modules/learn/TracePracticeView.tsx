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
import { dist, getPathPoints, getStrokeGuides, LearningCategory } from '../../logic/tracing';
import { playSound, speak, speakItemPrimary, speakLetterThenWord } from '../../logic/audio';
import FriendlyShark from '../../components/FriendlyShark';
import ImagePickerModal from '../../components/ImagePickerModal';

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
  onUpdateImage: (img: string) => void;
  progressLevels: TraceMetricLevels;
  onAttemptAnalyzed: (attempt: TraceAttempt) => void;
  difficultyMode: DifficultyMode;
  theme: SharkTheme;
  themeUpgradeLevel: number;
  successPreset?: 'normal' | 'easy';
  skipDemo?: boolean;
}

const TracePracticeView: React.FC<TracePracticeViewProps> = ({
  item,
  category,
  onBack,
  onComplete,
  sharkConfig,
  customImage,
  onUpdateImage,
  progressLevels,
  onAttemptAnalyzed,
  difficultyMode,
  theme,
  themeUpgradeLevel,
  successPreset = 'normal',
  skipDemo = false,
}) => {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDemonstrating, setIsDemonstrating] = useState(true);
  const [guideFlash, setGuideFlash] = useState(false);
  const [helperMessage, setHelperMessage] = useState('请沿着线写');
  const [showLowercase, setShowLowercase] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const supportsCaseToggle = /^[A-Z]$/.test(item.char);
  const isShapeChallenge = category === 'shapes';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathPoints = useMemo(() => getPathPoints(item.svgPath), [item]);
  const guides = useMemo(() => getStrokeGuides(item.svgPath), [item]);
  const difficultyConfig = DIFFICULTY_CONFIG[difficultyMode];
  const successConfig =
    successPreset === 'easy'
      ? {
          minPoints: 4,
          coverageThreshold: 12,
          successCoverage: Math.max(0.28, difficultyConfig.successCoverage - 0.55),
          successFollow: Math.max(0.02, difficultyConfig.successFollow - 0.22),
        }
      : {
          minPoints: 10,
          coverageThreshold: 7,
          successCoverage: difficultyConfig.successCoverage,
          successFollow: difficultyConfig.successFollow,
        };

  const isDragging = useRef(false);
  const [nextGuideIndex, setNextGuideIndex] = useState(0);
  const [returnBubble, setReturnBubble] = useState<Point | null>(null);

  useEffect(() => {
    setStrokes([]);
    setCurrentStroke([]);
    setNextGuideIndex(0);
    setReturnBubble(null);
    setHelperMessage(isShapeChallenge ? '从1号起点开始画线' : '请沿着线写');
    setIsDemonstrating(!skipDemo);
    
    let wordTimer: number | null = null;
    if (supportsCaseToggle) {
      speakLetterThenWord(item.char, item.word);
    } else {
      speakItemPrimary(item);
      const wordDelay = skipDemo ? 320 : 1300;
      wordTimer = window.setTimeout(() => {
        speak(item.word, 'zh-CN');
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
  }, [item, isShapeChallenge, supportsCaseToggle, skipDemo]);

  const handleReplay = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setNextGuideIndex(0);
    setReturnBubble(null);
    setHelperMessage(isShapeChallenge ? '从1号起点开始画线' : '再试一次，慢慢来');
    setIsDemonstrating(!skipDemo);
    if (supportsCaseToggle) {
      speakLetterThenWord(item.char, item.word);
    } else {
      speakItemPrimary(item);
    }
    if (!skipDemo) {
      window.setTimeout(() => {
        setIsDemonstrating(false);
      }, 3000);
    }
  };

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, t: Date.now() };

    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
      t: Date.now(),
    };
  };

  const findNearestPathPoint = (point: Point) => {
    let minDistance = Number.POSITIVE_INFINITY;
    let nearestPoint = pathPoints[0];
    let nearestIndex = 0;
    for (let i = 0; i < pathPoints.length; i++) {
      const candidate = pathPoints[i];
      const d = dist(point, candidate);
      if (d < minDistance) {
        minDistance = d;
        nearestPoint = candidate;
        nearestIndex = i;
      }
    }
    return { point: nearestPoint, index: nearestIndex, distance: minDistance };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDemonstrating) return;
    isDragging.current = true;
    playSound('start');
    const rawPoint = getCanvasPoint(e);
    const nearest = findNearestPathPoint(rawPoint);
    if (nearest.distance <= difficultyConfig.snapDistance) {
      setNextGuideIndex((prev) => Math.max(prev, nearest.index));
      setCurrentStroke([{ ...nearest.point, t: rawPoint.t }]);
      setReturnBubble(null);
      return;
    }
    if (nearest.distance > difficultyConfig.returnDistance) {
      setReturnBubble(nearest.point);
      setHelperMessage('跟着蓝泡泡回到线条');
    }
    setCurrentStroke([rawPoint]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || isDemonstrating) return;
    e.preventDefault();
    const rawPoint = getCanvasPoint(e);
    const nearest = findNearestPathPoint(rawPoint);
    let drawPoint = rawPoint;

    if (nearest.distance <= difficultyConfig.snapDistance) {
      drawPoint = { ...nearest.point, t: rawPoint.t };
      setNextGuideIndex((prev) => Math.max(prev, nearest.index));
      setReturnBubble(null);
    } else if (nearest.distance > difficultyConfig.returnDistance) {
      setReturnBubble(nearest.point);
      setHelperMessage(
        difficultyMode === 'challenge' ? '自由写也可以，想贴线就跟着蓝泡泡' : '跟着蓝泡泡回到线条'
      );
    } else {
      setReturnBubble(null);
    }

    setCurrentStroke((prev) => [...prev, drawPoint]);
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke([]);
    checkSuccess(newStrokes);
  };

  const checkSuccess = (currentStrokes: Point[][]) => {
    const allUserPoints = currentStrokes.flat();
    if (successPreset === 'easy' && allUserPoints.length > 0) {
      const metrics = computeTraceMetrics(currentStrokes, pathPoints);
      const attempt: TraceAttempt = {
        at: Date.now(),
        scores: metrics.scores,
        levels: metrics.levels,
      };
      onAttemptAnalyzed(attempt);
      playSound('end');
      setHelperMessage('太棒啦，完成啦');
      setReturnBubble(null);
      window.setTimeout(onComplete, 220);
      return;
    }

    if (allUserPoints.length < successConfig.minPoints) {
      setHelperMessage('再写一点点就完成啦');
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
    const coverageThreshold = successConfig.coverageThreshold;

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
    const easyPass =
      successPreset === 'easy' &&
      (allUserPoints.length >= successConfig.minPoints + 2 || coverage > 0.2 || metrics.scores.follow > 0.08);
    const isSuccess =
      easyPass ||
      (coverage > successConfig.successCoverage && metrics.scores.follow > successConfig.successFollow);

    if (isSuccess) {
      playSound('end');
      setHelperMessage('太棒啦，完成啦');
      setReturnBubble(null);
      window.setTimeout(onComplete, 450);
      return;
    }

    playSound('guide');
    setGuideFlash(true);
    window.setTimeout(() => setGuideFlash(false), 550);
    if (difficultyMode === 'challenge') {
      setHelperMessage('很棒的尝试，按右上角↺可再来一次');
      speak('很棒的尝试，再来一次会更顺', 'zh-CN', 0.6);
    } else if (coverage > 0.72) {
      setHelperMessage('快完成啦，再把浅灰线连接起来');
      speak('快完成啦，再试一笔', 'zh-CN', 0.62);
    } else {
      setHelperMessage('慢慢来，沿着浅灰线走');
      speak('慢慢来，沿着浅灰线走', 'zh-CN', 0.6);
    }
  };

  return (
    <div className="h-full flex flex-col bg-ocean-500">
      <div className="flex-none flex justify-between items-center p-4">
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
        <div className="min-h-full flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-6 shadow-2xl flex flex-col items-center w-full max-w-2xl relative">
            <div
              className={`absolute inset-0 rounded-[3rem] border-8 pointer-events-none transition-colors duration-300 ${
                guideFlash ? 'border-coral animate-pulse' : 'border-transparent'
              }`}
            ></div>

            <div className="flex items-center gap-8 mb-4">
              <span className="text-8xl md:text-9xl font-black text-ocean-900 select-none">
                {supportsCaseToggle && showLowercase ? `${item.char} ${item.char.toLowerCase()}` : item.char}
              </span>
              <div className="flex flex-col items-center relative group">
                <div className="relative">
                  {customImage ? (
                    <img
                      src={customImage}
                      alt={item.word}
                      className="w-24 h-24 object-contain animate-bounce-gentle rounded-lg"
                    />
                  ) : (
                    <span className="text-6xl select-none animate-bounce-gentle block">{item.emoji}</span>
                  )}
                  <button
                    onClick={() => setShowMagicModal(true)}
                    className="absolute -bottom-2 -right-2 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 hover:bg-purple-600"
                    title="Customize Image"
                  >
                    ✨
                  </button>
                </div>
                <span className="text-2xl text-gray-500 font-bold mt-2">{item.word}</span>
              </div>
            </div>

            <ProgressIcons levels={progressLevels} />

            <div
              className={`relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] shrink-0 touch-none ${
                guideFlash ? 'animate-[shake_0.5s_ease-in-out]' : ''
              }`}
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
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

                <use
                  href="#tracePath"
                  stroke={guideFlash ? '#fb7185' : '#e5e7eb'}
                  strokeWidth="12"
                  strokeDasharray="16 16"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-colors duration-300"
                />

                {difficultyMode === 'guide' && !isDemonstrating && (
                  <polyline
                    points={pathPoints
                      .slice(nextGuideIndex, Math.min(pathPoints.length, nextGuideIndex + 18))
                      .map((point) => `${point.x},${point.y}`)
                      .join(' ')}
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.95"
                  />
                )}

                {!isDemonstrating &&
                  guides.map((guide) => (
                    <g
                      key={guide.id}
                      transform={`translate(${guide.x}, ${guide.y})`}
                      className="pointer-events-none transition-opacity duration-300 opacity-90"
                    >
                      <circle r="4" fill="#0ea5e9" stroke="white" strokeWidth="1" className="drop-shadow-sm" />
                      <text
                        y="1.5"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="5"
                        fontFamily="Varela Round, sans-serif"
                        fontWeight="bold"
                      >
                        {guide.id}
                      </text>

                      <g transform={`rotate(${guide.angle}) translate(9, 0)`}>
                        <path
                          d="M 0 -2 L 3 0 L 0 2"
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    </g>
                  ))}

                {isDemonstrating && (
                  <>
                    <use
                      href="#tracePath"
                      stroke="#fbbf24"
                      strokeWidth="12"
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
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                <polyline
                  points={currentStroke.map((point) => `${point.x},${point.y}`).join(' ')}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {!isDemonstrating && returnBubble && (
                  <g transform={`translate(${returnBubble.x}, ${returnBubble.y})`}>
                    <circle r="5.6" fill="#38bdf8" stroke="white" strokeWidth="1.5" opacity="0.95" />
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
                className="absolute inset-0 w-full h-full cursor-crosshair opacity-0"
                width={400}
                height={400}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            </div>

            {isShapeChallenge && <p className="text-sm text-ocean-600 font-black mb-2">10-20 秒线条小挑战</p>}
            <p className="mt-6 text-gray-400 font-bold text-lg">{isDemonstrating ? '看这里！' : helperMessage}</p>
            {!isDemonstrating && <p className="text-xs text-gray-400 mt-1">小鲨鱼在陪你慢慢练习</p>}
          </div>
        </div>
      </div>

      <div className="flex-none p-4 flex justify-center pointer-events-none">
        <FriendlyShark className="w-24 h-24" config={sharkConfig} theme={theme} upgradeLevel={themeUpgradeLevel} />
      </div>

      <ImagePickerModal
        isOpen={showMagicModal}
        onClose={() => setShowMagicModal(false)}
        item={item}
        currentImage={customImage}
        onSave={(img) => onUpdateImage(img)}
      />
    </div>
  );
};

export default TracePracticeView;
