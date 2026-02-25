import React, { useMemo, useRef, useState } from 'react';
import {
  DressupMissionPoolMode,
  LetterConfig,
  SharkAccessory,
  SharkColor,
  SharkConfig,
  SharkTheme,
} from '../../../types';
import { LETTER_ITEMS, NUMBER_ITEMS, SHAPE_ITEMS } from '../../../constants';
import { LearningCategory } from '../../logic/tracing';
import { TraceAttempt, TraceMetricLevels } from '../../logic/metrics';
import FriendlyShark from '../../components/FriendlyShark';
import TracePracticeView from '../learn/TracePracticeView';
import {
  SHARK_ACCESSORY_OPTIONS,
  SHARK_COLOR_OPTIONS,
  SHARK_PALETTES,
  SHARK_THEME_ORDER,
  SHARK_THEME_PRESETS,
} from './sharkStyle';

interface DressUpAdventureProps {
  onBack: () => void;
  onOpenSettings: () => void;
  sharkConfig: SharkConfig;
  theme: SharkTheme;
  themeUpgradeLevel: number;
  dressupMissionPool: DressupMissionPoolMode;
  onApplyTheme: (theme: SharkTheme) => void;
  onApplyColor: (color: SharkColor) => void;
  onApplyAccessory: (accessory: SharkAccessory) => void;
  onChallengeAttempt: (item: LetterConfig, category: LearningCategory, attempt: TraceAttempt) => void;
  onChallengeComplete: (item: LetterConfig, category: LearningCategory, minutesDelta: number) => void;
  getProgressLevels: (item: LetterConfig, category: LearningCategory) => TraceMetricLevels;
  customImages: Record<string, string>;
  onUpdateImage: (char: string, image: string) => void;
  styleTokens: number;
}

interface PendingChallenge {
  source: 'color' | 'accessory';
  category: LearningCategory;
  item: LetterConfig;
  title: string;
  hint: string;
}

const COLOR_TO_LETTER: Record<SharkColor, string> = {
  blue: 'B',
  pink: 'P',
  green: 'G',
  purple: 'U',
  orange: 'O',
  teal: 'T',
  yellow: 'Y',
  coral: 'C',
};

const COLOR_LABELS: Record<SharkColor, string> = {
  blue: '蓝色',
  pink: '粉色',
  green: '绿色',
  purple: '紫色',
  orange: '橙色',
  teal: '青绿色',
  yellow: '黄色',
  coral: '浅珊瑚色',
};

const getPointerXY = (event: PointerEvent | React.PointerEvent) => ({
  x: event.clientX,
  y: event.clientY,
});

const getChallengeByPool = (pool: DressupMissionPoolMode): { item: LetterConfig; category: LearningCategory } => {
  if (pool === 'letters') {
    const item = LETTER_ITEMS[Math.floor(Math.random() * LETTER_ITEMS.length)];
    return { item, category: 'letters' };
  }
  if (pool === 'numbers') {
    const item = NUMBER_ITEMS[Math.floor(Math.random() * NUMBER_ITEMS.length)];
    return { item, category: 'numbers' };
  }
  if (pool === 'shapes') {
    const item = SHAPE_ITEMS[Math.floor(Math.random() * SHAPE_ITEMS.length)];
    return { item, category: 'shapes' };
  }

  const mixed = [
    { category: 'letters' as const, item: LETTER_ITEMS[Math.floor(Math.random() * LETTER_ITEMS.length)] },
    { category: 'numbers' as const, item: NUMBER_ITEMS[Math.floor(Math.random() * NUMBER_ITEMS.length)] },
    { category: 'shapes' as const, item: SHAPE_ITEMS[Math.floor(Math.random() * SHAPE_ITEMS.length)] },
  ];
  return mixed[Math.floor(Math.random() * mixed.length)];
};

const DressUpAdventure: React.FC<DressUpAdventureProps> = ({
  onBack,
  onOpenSettings,
  sharkConfig,
  theme,
  themeUpgradeLevel,
  dressupMissionPool,
  onApplyTheme,
  onApplyColor,
  onApplyAccessory,
  onChallengeAttempt,
  onChallengeComplete,
  getProgressLevels,
  customImages,
  onUpdateImage,
  styleTokens,
}) => {
  const [pendingChallenge, setPendingChallenge] = useState<PendingChallenge | null>(null);
  const [isChallengeStarted, setIsChallengeStarted] = useState(false);
  const [dragging, setDragging] = useState<{ accessory: SharkAccessory; icon: string; x: number; y: number } | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [successTip, setSuccessTip] = useState('');
  const applyActionRef = useRef<null | (() => void)>(null);
  const challengeStartRef = useRef<number>(Date.now());
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  const poolLabel =
    dressupMissionPool === 'shapes'
      ? '线条'
      : dressupMissionPool === 'numbers'
      ? '数字'
      : dressupMissionPool === 'letters'
      ? '字母'
      : '混合';

  const accessoryMeta = useMemo(() => {
    const map: Record<string, { label: string; icon: string }> = {};
    for (const item of SHARK_ACCESSORY_OPTIONS) {
      map[item.id] = { label: item.label, icon: item.icon };
    }
    return map;
  }, []);

  const openColorChallenge = (color: SharkColor) => {
    const targetChar = COLOR_TO_LETTER[color];
    const letterItem = LETTER_ITEMS.find((item) => item.char === targetChar) || LETTER_ITEMS[0];
    applyActionRef.current = () => onApplyColor(color);
    setPendingChallenge({
      source: 'color',
      category: 'letters',
      item: letterItem,
      title: `换成${COLOR_LABELS[color]}`,
      hint: `先写一个 ${targetChar}，再把鲨鱼变成${COLOR_LABELS[color]}`,
    });
    setIsChallengeStarted(false);
  };

  const openAccessoryChallenge = (accessory: SharkAccessory) => {
    const challenge = getChallengeByPool(dressupMissionPool);
    const label = accessoryMeta[accessory]?.label || '配件';
    applyActionRef.current = () => onApplyAccessory(accessory);
    setPendingChallenge({
      source: 'accessory',
      category: challenge.category,
      item: challenge.item,
      title: `装备${label}`,
      hint: `先写 ${challenge.item.char}，再把${label}戴到鲨鱼身上`,
    });
    setIsChallengeStarted(false);
  };

  const beginDragAccessory = (event: React.PointerEvent, accessory: SharkAccessory, icon: string) => {
    event.preventDefault();
    const point = getPointerXY(event);
    setDragging({ accessory, icon, x: point.x, y: point.y });
  };

  React.useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const point = getPointerXY(event);
      setDragging((prev) => (prev ? { ...prev, x: point.x, y: point.y } : prev));
      const rect = dropZoneRef.current?.getBoundingClientRect();
      if (rect) {
        const inside = point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
        setIsDropActive(inside);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const point = getPointerXY(event);
      const rect = dropZoneRef.current?.getBoundingClientRect();
      const droppedOnShark =
        !!rect && point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;

      if (droppedOnShark) {
        openAccessoryChallenge(dragging.accessory);
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
  }, [dragging, dressupMissionPool, accessoryMeta]);

  if (pendingChallenge && isChallengeStarted) {
    return (
      <TracePracticeView
        item={pendingChallenge.item}
        category={pendingChallenge.category}
        onBack={() => {
          setPendingChallenge(null);
          setIsChallengeStarted(false);
        }}
        onComplete={() => {
          const minutesDelta = Math.max(1 / 6, (Date.now() - challengeStartRef.current) / 60000);
          onChallengeComplete(pendingChallenge.item, pendingChallenge.category, minutesDelta);
          applyActionRef.current?.();
          setSuccessTip(pendingChallenge.source === 'color' ? '颜色变好啦' : '配件戴好啦');
          setPendingChallenge(null);
          setIsChallengeStarted(false);
          window.setTimeout(() => setSuccessTip(''), 1300);
        }}
        sharkConfig={sharkConfig}
        customImage={customImages[pendingChallenge.item.char] || null}
        onUpdateImage={(img) => onUpdateImage(pendingChallenge.item.char, img)}
        progressLevels={getProgressLevels(pendingChallenge.item, pendingChallenge.category)}
        onAttemptAnalyzed={(attempt) => onChallengeAttempt(pendingChallenge.item, pendingChallenge.category, attempt)}
        difficultyMode="guide"
        theme={theme}
        themeUpgradeLevel={themeUpgradeLevel}
        successPreset="easy"
        skipDemo
      />
    );
  }

  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6 pb-8">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-20 py-2">
          <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            🔙
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white">换装大冒险</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_0_rgba(0,0,0,0.12)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xl md:text-2xl font-black text-ocean-900 mb-1">给鲨鱼换新造型</p>
              <p className="text-sm font-bold text-gray-500">颜色和配件都要先完成一个小书写挑战</p>
              <p className="text-xs font-black text-ocean-700 mt-2">当前配件挑战池：{poolLabel}</p>
              <p className="text-xs font-black text-ocean-700 mt-1">创意泡泡：{styleTokens}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SHARK_THEME_ORDER.map((themeId) => (
                <button
                  key={themeId}
                  onClick={() => onApplyTheme(themeId)}
                  className={`rounded-xl border px-3 py-2 text-left ${
                    theme === themeId ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className="text-sm font-black text-ocean-900">
                    {SHARK_THEME_PRESETS[themeId].icon} {SHARK_THEME_PRESETS[themeId].label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div
            ref={dropZoneRef}
            className={`rounded-3xl border-4 transition-colors mb-5 p-4 ${
              isDropActive ? 'border-ocean-400 bg-ocean-50' : 'border-ocean-100 bg-white'
            }`}
          >
            <p className="text-sm font-black text-ocean-800 mb-2">把配件拖到鲨鱼身上（或点一下配件）</p>
            <div className="w-full h-44 md:h-52 flex items-center justify-center">
              <div className="w-64 h-44 md:w-72 md:h-48">
                <FriendlyShark className="w-full h-full" config={sharkConfig} theme={theme} upgradeLevel={themeUpgradeLevel} />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-base font-black text-ocean-900 mb-2">换颜色</p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {SHARK_COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => openColorChallenge(color)}
                  title={COLOR_LABELS[color]}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-4 ${
                    sharkConfig.color === color ? 'border-gray-800 scale-105' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: SHARK_PALETTES[color].body }}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-gray-500 mt-2">例如黄色会先让孩子写一个 Y</p>
          </div>

          <div>
            <p className="text-base font-black text-ocean-900 mb-2">换配件</p>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {SHARK_ACCESSORY_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  onPointerDown={(event) => beginDragAccessory(event, item.id, item.icon)}
                  onClick={() => openAccessoryChallenge(item.id)}
                  className={`rounded-xl border p-2 min-h-[74px] text-center active:scale-95 ${
                    sharkConfig.accessory === item.id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className="text-2xl">{item.icon}</p>
                  <p className="text-[11px] font-black text-gray-600">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {dragging && (
        <div
          className="fixed z-[75] pointer-events-none text-4xl"
          style={{ left: dragging.x - 16, top: dragging.y - 24 }}
        >
          {dragging.icon}
        </div>
      )}

      {pendingChallenge && !isChallengeStarted && (
        <div className="fixed inset-0 z-[76] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl text-center">
            <p className="text-5xl mb-2">📝</p>
            <h2 className="text-2xl font-black text-ocean-900 mb-1">{pendingChallenge.title}</h2>
            <p className="text-sm font-bold text-gray-500 mb-4">{pendingChallenge.hint}</p>
            <div className="rounded-2xl bg-ocean-50 p-4 mb-4">
              <p className="text-sm font-black text-ocean-700">要写的内容</p>
              <p className="text-6xl font-black text-ocean-900">{pendingChallenge.item.char}</p>
              <p className="text-xs font-black text-gray-500 mt-1">{pendingChallenge.item.word}</p>
            </div>
            <button
              onClick={() => {
                challengeStartRef.current = Date.now();
                setIsChallengeStarted(true);
              }}
              className="w-full bg-ocean-500 text-white text-xl font-black py-3 rounded-2xl mb-2"
            >
              开始书写
            </button>
            <button
              onClick={() => setPendingChallenge(null)}
              className="w-full bg-ocean-100 text-ocean-900 text-base font-black py-2 rounded-2xl"
            >
              稍后
            </button>
          </div>
        </div>
      )}

      {successTip && (
        <div className="fixed inset-x-0 bottom-5 flex justify-center z-[77] pointer-events-none">
          <div className="bg-white rounded-full px-6 py-3 shadow-xl text-ocean-900 font-black">{successTip}</div>
        </div>
      )}
    </div>
  );
};

export default DressUpAdventure;
