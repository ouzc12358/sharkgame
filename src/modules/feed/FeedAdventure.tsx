import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LETTER_ITEMS, NUMBER_ITEMS } from '../../../constants';
import {
  DifficultyMode,
  LetterConfig,
  SharkConfig,
  SharkTheme,
} from '../../../types';
import FriendlyShark from '../../components/FriendlyShark';
import { speak } from '../../logic/audio';
import { TraceAttempt, TraceMetricLevels } from '../../logic/metrics';
import { LearningCategory } from '../../logic/tracing';
import TracePracticeView from '../learn/TracePracticeView';
import { FeedSymbolPool, pickFeedMemoryCue } from './feedAssociations';

type FeedMode = 'active' | 'request';

interface FeedAdventureProps {
  onBack: () => void;
  onOpenSettings: () => void;
  sharkConfig: SharkConfig;
  theme: SharkTheme;
  themeUpgradeLevel: number;
  difficultyMode: DifficultyMode;
  onChallengeAttempt: (item: LetterConfig, category: LearningCategory, attempt: TraceAttempt) => void;
  onChallengeComplete: (item: LetterConfig, category: LearningCategory, minutesDelta: number) => void;
  getProgressLevels: (item: LetterConfig, category: LearningCategory) => TraceMetricLevels;
  customImages: Record<string, string>;
  onUpdateImage: (char: string, image: string) => void;
}

interface WriteSession {
  item: LetterConfig;
  category: LearningCategory;
  sourceMode: FeedMode;
}

interface FeedCelebration {
  id: number;
  symbol: string;
  message: string;
  cue: string;
}

const FEED_POOL_LABEL: Record<FeedSymbolPool, string> = {
  letters: '字母',
  numbers: '数字',
};

const getPoolItems = (pool: FeedSymbolPool) => (pool === 'letters' ? LETTER_ITEMS : NUMBER_ITEMS);
const getPoolCategory = (pool: FeedSymbolPool): LearningCategory => (pool === 'letters' ? 'letters' : 'numbers');

const FeedAdventure: React.FC<FeedAdventureProps> = ({
  onBack,
  onOpenSettings,
  sharkConfig,
  theme,
  themeUpgradeLevel,
  difficultyMode,
  onChallengeAttempt,
  onChallengeComplete,
  getProgressLevels,
  customImages,
  onUpdateImage,
}) => {
  const [mode, setMode] = useState<FeedMode>('active');
  const [pool, setPool] = useState<FeedSymbolPool>('letters');
  const [writeSession, setWriteSession] = useState<WriteSession | null>(null);
  const [requestIndex, setRequestIndex] = useState<{ letters: number; numbers: number }>({ letters: 0, numbers: 0 });
  const [hungerPulse, setHungerPulse] = useState(0);
  const [feedCount, setFeedCount] = useState(0);
  const [celebration, setCelebration] = useState<FeedCelebration | null>(null);
  const [dragging, setDragging] = useState<{
    item: LetterConfig;
    sourceMode: FeedMode;
    x: number;
    y: number;
  } | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);

  const traceStartRef = useRef(Date.now());
  const lastRequestSpeakKey = useRef('');
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  const feedItems = useMemo(() => getPoolItems(pool), [pool]);
  const requestPointer = pool === 'letters' ? requestIndex.letters : requestIndex.numbers;
  const requestedItem = feedItems[requestPointer % feedItems.length];
  const topRowItems = useMemo(() => feedItems.slice(0, Math.ceil(feedItems.length / 2)), [feedItems]);
  const bottomRowItems = useMemo(() => feedItems.slice(Math.ceil(feedItems.length / 2)), [feedItems]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHungerPulse((prev) => prev + 1);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => setCelebration(null), 2400);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  useEffect(() => {
    if (mode !== 'request' || writeSession) return;
    const key = `${pool}:${requestPointer}`;
    if (lastRequestSpeakKey.current === key) return;
    lastRequestSpeakKey.current = key;
    const cue = pickFeedMemoryCue(pool, requestedItem.char, requestPointer);
    speak(`小鲨鱼想吃${FEED_POOL_LABEL[pool]} ${requestedItem.char}。${cue}`, 'zh-CN', 0.58);
  }, [mode, pool, requestPointer, requestedItem, writeSession]);

  useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      setDragging((prev) => (prev ? { ...prev, x, y } : prev));

      const rect = dropZoneRef.current?.getBoundingClientRect();
      if (rect) {
        const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        setIsDropActive(inside);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      const rect = dropZoneRef.current?.getBoundingClientRect();
      const droppedOnShark =
        !!rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (droppedOnShark) {
        if (dragging.sourceMode === 'request') {
          if (dragging.item.char === requestedItem.char) {
            startWriting(dragging.item, dragging.sourceMode);
          } else {
            speak(`今天先喂 ${requestedItem.char}`, 'zh-CN', 0.6);
          }
        } else {
          startWriting(dragging.item, dragging.sourceMode);
        }
      }

      setDragging(null);
      setIsDropActive(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging, requestedItem]);

  const startWriting = (item: LetterConfig, sourceMode: FeedMode) => {
    traceStartRef.current = Date.now();
    setWriteSession({
      item,
      category: getPoolCategory(pool),
      sourceMode,
    });
  };

  const beginDragFood = (event: React.PointerEvent, item: LetterConfig, sourceMode: FeedMode) => {
    event.preventDefault();
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragging({
      item,
      sourceMode,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const renderFoodToken = (item: LetterConfig) => {
    const isRequestedTarget = mode === 'request' && item.char === requestedItem.char;
    const canDrag = mode === 'active' || isRequestedTarget;
    return (
      <button
        key={`food-${item.char}`}
        onPointerDown={(event) => {
          if (!canDrag) {
            speak(`请先喂 ${requestedItem.char}`, 'zh-CN', 0.6);
            return;
          }
          beginDragFood(event, item, mode === 'request' ? 'request' : 'active');
        }}
        className={`w-full h-7 md:h-9 rounded-md border font-black text-[11px] md:text-sm leading-none touch-none select-none ${
          isRequestedTarget
            ? 'bg-ocean-500 text-white border-ocean-500 scale-105'
            : canDrag
            ? 'bg-ocean-50 text-ocean-900 border-ocean-100'
            : 'bg-gray-100 text-gray-400 border-gray-200'
        }`}
        style={{ touchAction: 'none' }}
      >
        {item.char}
      </button>
    );
  };

  const handleWriteComplete = () => {
    if (!writeSession) return;

    const minutesDelta = Math.max(1 / 6, (Date.now() - traceStartRef.current) / 60000);
    const cue = pickFeedMemoryCue(pool, writeSession.item.char, feedCount);
    const message = `小鲨鱼喜欢${FEED_POOL_LABEL[pool]} ${writeSession.item.char}`;

    onChallengeComplete(writeSession.item, writeSession.category, minutesDelta);
    setFeedCount((prev) => prev + 1);
    if (writeSession.sourceMode === 'request') {
      setRequestIndex((prev) => ({
        ...prev,
        [pool]: (prev[pool] + 1) % getPoolItems(pool).length,
      }));
    }

    setCelebration({
      id: Date.now(),
      symbol: writeSession.item.char,
      message,
      cue,
    });
    speak(`${message}，${cue}，你真棒`, 'zh-CN', 0.62);
    setWriteSession(null);
  };

  if (writeSession) {
    return (
      <TracePracticeView
        item={writeSession.item}
        category={writeSession.category}
        onBack={() => setWriteSession(null)}
        onComplete={handleWriteComplete}
        sharkConfig={sharkConfig}
        customImage={customImages[writeSession.item.char] || null}
        onUpdateImage={(img) => onUpdateImage(writeSession.item.char, img)}
        progressLevels={getProgressLevels(writeSession.item, writeSession.category)}
        onAttemptAnalyzed={(attempt) => onChallengeAttempt(writeSession.item, writeSession.category, attempt)}
        difficultyMode={difficultyMode === 'guide' ? 'practice' : difficultyMode}
        theme={theme}
        themeUpgradeLevel={themeUpgradeLevel}
        successPreset="normal"
        skipDemo
      />
    );
  }

  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <style>{`
        @keyframes feed-shark-idle {
          0%, 100% { transform: translateY(0) rotate(-2deg) scale(1); }
          50% { transform: translateY(-6px) rotate(2deg) scale(1.02); }
        }
        @keyframes feed-shark-hungry {
          0%, 100% { transform: translateY(0) rotate(-3deg) scale(1); }
          30% { transform: translateY(-8px) rotate(3deg) scale(1.04); }
          60% { transform: translateY(-2px) rotate(-2deg) scale(0.98); }
        }
        @keyframes feed-token-fly {
          0% { transform: translate(-220px, 100px) rotate(-24deg) scale(0.85); opacity: 0.2; }
          50% { transform: translate(-90px, 10px) rotate(6deg) scale(1.1); opacity: 1; }
          100% { transform: translate(0, 0) rotate(20deg) scale(0.1); opacity: 0; }
        }
        @keyframes feed-happy-pop {
          0% { transform: scale(0.3); opacity: 0; }
          55% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes feed-heart-rise {
          0% { transform: translateY(0) scale(0.4); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-120px) scale(1.15); opacity: 0; }
        }
        @keyframes feed-bubble-rise {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          40% { opacity: 0.85; }
          100% { transform: translateY(-130px) scale(1.4); opacity: 0; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-4 md:p-6 pb-8">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-20 py-2">
          <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            🔙
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white">喂食大冒险</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_0_rgba(0,0,0,0.12)] mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 mb-4">
            <div
              ref={dropZoneRef}
              className={`rounded-3xl border-4 bg-ocean-50 p-4 relative overflow-hidden transition-colors ${
                isDropActive ? 'border-ocean-400' : 'border-ocean-100'
              }`}
            >
              <p className="text-xs font-black text-ocean-700">小鲨鱼状态</p>
              <div className="mt-2 mb-1 w-full">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${topRowItems.length}, minmax(0, 1fr))` }}
                >
                  {topRowItems.map((item) => renderFoodToken(item))}
                </div>
              </div>
              <div className="relative h-48 md:h-56 flex items-center justify-center">
                <div
                  className={`absolute top-2 right-3 rounded-2xl bg-white px-3 py-2 shadow-md text-sm font-black text-ocean-900 ${
                    mode === 'request' ? 'animate-pulse' : ''
                  }`}
                >
                  {mode === 'request'
                    ? `我想吃 ${FEED_POOL_LABEL[pool]} ${requestedItem.char}`
                    : `给我一个${FEED_POOL_LABEL[pool]}点心吧`}
                </div>
                <div
                  key={`${mode}-${hungerPulse}`}
                  className={mode === 'request' ? 'animate-[feed-shark-hungry_1.5s_ease-in-out_infinite]' : 'animate-[feed-shark-idle_3s_ease-in-out_infinite]'}
                >
                  <div className="w-60 h-40 md:w-72 md:h-48">
                    <FriendlyShark className="w-full h-full" config={sharkConfig} theme={theme} upgradeLevel={themeUpgradeLevel} />
                  </div>
                </div>
              </div>
              <div className="mt-1 mb-1 w-full">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${bottomRowItems.length}, minmax(0, 1fr))` }}
                >
                  {bottomRowItems.map((item) => renderFoodToken(item))}
                </div>
              </div>
              <p className="text-xs font-bold text-gray-600 mt-1">
                规则：把{FEED_POOL_LABEL[pool]}拖到鲨鱼身上，写完再完成投喂
              </p>
            </div>

            <div className="rounded-3xl border-4 border-ocean-100 bg-white p-4">
              <p className="text-sm font-black text-ocean-800 mb-2">喂食模式</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setMode('active')}
                  className={`rounded-xl py-2 font-black text-sm border ${
                    mode === 'active' ? 'bg-ocean-500 text-white border-ocean-500' : 'bg-white text-ocean-900 border-gray-200'
                  }`}
                >
                  主动投喂
                </button>
                <button
                  onClick={() => setMode('request')}
                  className={`rounded-xl py-2 font-black text-sm border ${
                    mode === 'request' ? 'bg-ocean-500 text-white border-ocean-500' : 'bg-white text-ocean-900 border-gray-200'
                  }`}
                >
                  鲨鱼点餐
                </button>
              </div>

              <p className="text-sm font-black text-ocean-800 mb-2">点心类型</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setPool('letters')}
                  className={`rounded-xl py-2 font-black text-sm border ${
                    pool === 'letters' ? 'bg-ocean-500 text-white border-ocean-500' : 'bg-white text-ocean-900 border-gray-200'
                  }`}
                >
                  字母餐单
                </button>
                <button
                  onClick={() => setPool('numbers')}
                  className={`rounded-xl py-2 font-black text-sm border ${
                    pool === 'numbers' ? 'bg-ocean-500 text-white border-ocean-500' : 'bg-white text-ocean-900 border-gray-200'
                  }`}
                >
                  数字餐单
                </button>
              </div>

              {mode !== 'request' && (
                <div className="rounded-2xl bg-ocean-50 border border-ocean-100 p-3">
                  <p className="text-xs font-black text-ocean-700">当前重点</p>
                  <p className="text-4xl font-black text-ocean-900">{requestedItem.char}</p>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    {pickFeedMemoryCue(pool, requestedItem.char, requestPointer)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {mode === 'active' && (
            <div className="rounded-3xl border-4 border-ocean-100 bg-white p-4">
              <p className="text-lg font-black text-ocean-900 mb-2">主动投喂</p>
              <p className="text-sm font-bold text-gray-600 mb-3">全部{FEED_POOL_LABEL[pool]}都在鲨鱼上方和下方，直接拖动投喂</p>
            </div>
          )}
        </div>
      </div>

      {dragging && (
        <div
          className="fixed z-[87] pointer-events-none text-6xl font-black text-ocean-900"
          style={{ left: dragging.x - 20, top: dragging.y - 36 }}
        >
          {dragging.item.char}
        </div>
      )}

      {celebration && (
        <div className="fixed inset-0 z-[88] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, index) => (
              <span
                key={`heart-${celebration.id}-${index}`}
                className="absolute text-2xl"
                style={{
                  left: `${8 + (index * 91) % 84}%`,
                  bottom: `${4 + (index % 4) * 8}%`,
                  animation: `feed-heart-rise ${1.1 + (index % 4) * 0.25}s ease-out ${(index % 5) * 0.08}s forwards`,
                  opacity: 0,
                }}
              >
                💖
              </span>
            ))}
            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={`bubble-${celebration.id}-${index}`}
                className="absolute w-3 h-3 rounded-full bg-sky-200"
                style={{
                  left: `${12 + (index * 77) % 80}%`,
                  bottom: `${6 + (index % 5) * 7}%`,
                  animation: `feed-bubble-rise ${1.2 + (index % 3) * 0.35}s ease-out ${(index % 4) * 0.12}s forwards`,
                  opacity: 0,
                }}
              />
            ))}
          </div>

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 text-center overflow-hidden">
            <div className="absolute left-[18%] bottom-[38%] text-6xl font-black text-ocean-700 animate-[feed-token-fly_1.1s_ease-in_forwards]">
              {celebration.symbol}
            </div>
            <div className="mx-auto w-64 h-44 md:w-80 md:h-56 animate-[feed-shark-hungry_1s_ease-in-out_2]">
              <FriendlyShark className="w-full h-full" config={sharkConfig} theme={theme} upgradeLevel={themeUpgradeLevel} />
            </div>
            <p className="text-2xl md:text-3xl font-black text-ocean-900 mt-2 animate-[feed-happy-pop_0.5s_ease-out]">
              {celebration.message}
            </p>
            <p className="text-sm md:text-base font-bold text-gray-600 mt-1">{celebration.cue}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedAdventure;
