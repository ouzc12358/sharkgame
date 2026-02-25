import React, { useMemo, useRef, useState } from 'react';
import {
  LetterConfig,
  RhythmGateIntensity,
  SharkConfig,
  SharkTheme,
} from '../../../types';
import { DailyMission, MissionItem, missionItemKey } from '../../logic/missions';
import { LearningCategory, missionTypeToCategory } from '../../logic/tracing';
import { TraceAttempt, TraceMetricLevels } from '../../logic/metrics';
import FriendlyShark from '../../components/FriendlyShark';
import TracePracticeView from '../learn/TracePracticeView';
import { SKATE_TRICK_LIST, SkateTrickId } from './SkateTricks';
import TrickShowcase from './TrickShowcase';

interface SkateAdventureProps {
  mission: DailyMission;
  practicedItemKeys: string[];
  onBack: () => void;
  onOpenSettings: () => void;
  onNarrateStory: () => void;
  onCompleteChallenge: (
    missionItem: MissionItem,
    item: LetterConfig,
    category: LearningCategory,
    minutesDelta: number
  ) => void;
  onAttemptChallenge: (item: LetterConfig, category: LearningCategory, attempt: TraceAttempt) => void;
  getProgressLevels: (item: LetterConfig, category: LearningCategory) => TraceMetricLevels;
  findConfigByMissionItem: (missionItem: MissionItem) => LetterConfig | null;
  sharkConfig: SharkConfig;
  theme: SharkTheme;
  themeUpgradeLevel: number;
  customImages: Record<string, string>;
  onUpdateImage: (char: string, image: string) => void;
  streak: number;
  diaryStickers: string[];
  sessionLengthTarget: number;
  styleTokens: number;
  skateModuleEnabled: boolean;
  onApplySkateLook: (look: 'base' | 'helmet' | 'pads' | 'board') => void;
  rhythmGateIntensity: RhythmGateIntensity;
}

const ConfettiBurst: React.FC = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.15,
        duration: Math.random() * 1.6 + 1.6,
        color: ['#fb7185', '#fcd34d', '#4ade80', '#60a5fa', '#a78bfa'][Math.floor(Math.random() * 5)],
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes confetti-drop {
          0% { transform: translateY(-8vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(112vh) rotate(600deg); opacity: 0; }
        }
      `}</style>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            top: '-5%',
            left: `${particle.left}%`,
            backgroundColor: particle.color,
            animation: `confetti-drop ${particle.duration}s linear ${particle.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
};

const getMissionTypeLabel = (type: MissionItem['type']) => {
  if (type === 'shape') return '线条';
  if (type === 'number') return '数字';
  return '字母';
};

const SkateAdventure: React.FC<SkateAdventureProps> = ({
  mission,
  practicedItemKeys,
  onBack,
  onOpenSettings,
  onNarrateStory,
  onCompleteChallenge,
  onAttemptChallenge,
  getProgressLevels,
  findConfigByMissionItem,
  sharkConfig,
  theme,
  themeUpgradeLevel,
  customImages,
  onUpdateImage,
  streak,
  diaryStickers,
  sessionLengthTarget,
  styleTokens,
  skateModuleEnabled,
  onApplySkateLook,
  rhythmGateIntensity,
}) => {
  const [activeMissionItem, setActiveMissionItem] = useState<MissionItem | null>(null);
  const [activeItem, setActiveItem] = useState<LetterConfig | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [trickIndex, setTrickIndex] = useState(0);
  const [selectedTrickId, setSelectedTrickId] = useState<SkateTrickId>(SKATE_TRICK_LIST[0].id);
  const [showTrickShowcase, setShowTrickShowcase] = useState(false);
  const [cosmeticActionsSinceChallenge, setCosmeticActionsSinceChallenge] = useState(0);
  const [showRhythmPrompt, setShowRhythmPrompt] = useState(false);
  const [pendingCosmeticAction, setPendingCosmeticAction] = useState<(() => void) | null>(null);
  const traceStartRef = useRef<number>(Date.now());

  const practicedSet = useMemo(() => new Set(practicedItemKeys), [practicedItemKeys]);
  const completedCount = mission.items.filter((item) => practicedSet.has(missionItemKey(item))).length;
  const missionDone = completedCount >= mission.items.length;
  const currentTrick = SKATE_TRICK_LIST[trickIndex];
  const selectedTrick = SKATE_TRICK_LIST.find((trick) => trick.id === selectedTrickId) || SKATE_TRICK_LIST[0];
  const rhythmThreshold =
    rhythmGateIntensity === 'light' ? 3 : rhythmGateIntensity === 'medium' ? 2 : Number.POSITIVE_INFINITY;

  const runCosmeticAction = (action: () => void) => {
    if (!Number.isFinite(rhythmThreshold)) {
      action();
      return;
    }
    if (cosmeticActionsSinceChallenge >= rhythmThreshold) {
      setPendingCosmeticAction(() => action);
      setShowRhythmPrompt(true);
      return;
    }
    action();
    setCosmeticActionsSinceChallenge((prev) => prev + 1);
  };

  const openMissionItem = (missionItem: MissionItem) => {
    const config = findConfigByMissionItem(missionItem);
    if (!config) return;
    setActiveMissionItem(missionItem);
    setActiveItem(config);
    traceStartRef.current = Date.now();
  };

  const startNextMissionItem = () => {
    const next = mission.items.find((item) => !practicedSet.has(missionItemKey(item))) || mission.items[0];
    openMissionItem(next);
  };

  if (activeMissionItem && activeItem) {
    const category = missionTypeToCategory(activeMissionItem.type);

    return (
      <div className="relative h-full w-full">
        <TracePracticeView
          item={activeItem}
          category={category}
          onBack={() => {
            setActiveMissionItem(null);
            setActiveItem(null);
          }}
          onComplete={() => {
            const now = Date.now();
            const minutesDelta = Math.max(1 / 6, (now - traceStartRef.current) / 60000);
            onCompleteChallenge(activeMissionItem, activeItem, category, minutesDelta);
            setActiveMissionItem(null);
            setActiveItem(null);
            setShowCelebrate(true);
            window.setTimeout(() => setShowCelebrate(false), 1400);
            setCosmeticActionsSinceChallenge(0);
            if (pendingCosmeticAction) {
              const deferred = pendingCosmeticAction;
              setPendingCosmeticAction(null);
              setShowRhythmPrompt(false);
              window.setTimeout(() => {
                deferred();
                setCosmeticActionsSinceChallenge((prev) => prev + 1);
              }, 300);
            }
            if (skateModuleEnabled) {
              window.setTimeout(() => setShowTrickShowcase(true), 450);
            }
          }}
          sharkConfig={sharkConfig}
          customImage={customImages[activeItem.char] || null}
          onUpdateImage={(img) => onUpdateImage(activeItem.char, img)}
          progressLevels={getProgressLevels(activeItem, category)}
          onAttemptAnalyzed={(attempt) => onAttemptChallenge(activeItem, category, attempt)}
          difficultyMode="guide"
          theme={theme}
          themeUpgradeLevel={themeUpgradeLevel}
          successPreset="easy"
        />

        {showCelebrate && (
          <div className="absolute inset-0 z-[60] bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
            <ConfettiBurst />
            <div className="bg-white rounded-3xl p-6 text-center shadow-2xl z-10">
              <p className="text-6xl mb-2">🎉</p>
              <p className="text-3xl font-black text-ocean-900">小鲨鱼充能啦</p>
              <p className="text-sm font-bold text-gray-500 mt-1">继续下一步冒险</p>
            </div>
          </div>
        )}

        <TrickShowcase
          isOpen={showTrickShowcase}
          trick={selectedTrick}
          sharkConfig={sharkConfig}
          theme={theme}
          themeUpgradeLevel={themeUpgradeLevel}
          onClose={() => setShowTrickShowcase(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-10 py-2">
          <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            🔙
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white">滑板大冒险</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_0_rgba(0,0,0,0.12)] mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-20 h-16 md:w-24 md:h-20 shrink-0">
                <FriendlyShark
                  className="w-full h-full"
                  config={sharkConfig}
                  theme={theme}
                  upgradeLevel={themeUpgradeLevel}
                />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-ocean-900">今日滑板节点</p>
                <p className="text-xs font-black text-ocean-700">3 个小挑战，约 {sessionLengthTarget} 分钟</p>
              </div>
            </div>
            <button
              onClick={onNarrateStory}
              className="w-12 h-12 rounded-full bg-ocean-100 text-2xl active:scale-95"
              title="朗读故事"
            >
              🔊
            </button>
          </div>

          <p className="text-base md:text-lg font-bold text-gray-600 mb-3">{mission.story}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-black text-ocean-700 mb-4">
            <span>🔥 连续 {streak} 天</span>
            <span>🫧 创意泡泡 {styleTokens}</span>
            <span>
              📌 任务池：
              {mission.poolMode === 'shapes'
                ? '线条'
                : mission.poolMode === 'numbers'
                ? '数字'
                : mission.poolMode === 'letters'
                ? '字母'
                : '混合'}
            </span>
          </div>

          <div className="bg-ocean-50 rounded-2xl p-4 mb-4">
            <p className="text-sm font-black text-ocean-900 mb-2">冒险地图（日节点）</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 7 }).map((_, index) => {
                const isToday = index === 6;
                const hasHistory = index < 6 && Boolean(diaryStickers[index]);
                return (
                  <div
                    key={`node-${index}`}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      isToday
                        ? missionDone
                          ? 'bg-sand border-yellow-400'
                          : 'bg-white border-ocean-400'
                        : hasHistory
                        ? 'bg-ocean-100 border-ocean-300'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    {isToday ? '🦈' : diaryStickers[index] || '•'}
                  </div>
                );
              })}
            </div>
          </div>

          {skateModuleEnabled && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-4">
              <p className="text-base font-black text-ocean-900 mb-2">Skate Shark</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <button
                  onClick={() => runCosmeticAction(() => onApplySkateLook('base'))}
                  className="rounded-xl bg-white border border-sky-200 py-2 text-sm font-black text-ocean-900 active:scale-95"
                >
                  Skate Park
                </button>
                <button
                  onClick={() => runCosmeticAction(() => onApplySkateLook('helmet'))}
                  className="rounded-xl bg-white border border-sky-200 py-2 text-sm font-black text-ocean-900 active:scale-95"
                >
                  头盔风格
                </button>
                <button
                  onClick={() => runCosmeticAction(() => onApplySkateLook('pads'))}
                  className="rounded-xl bg-white border border-sky-200 py-2 text-sm font-black text-ocean-900 active:scale-95"
                >
                  护具风格
                </button>
                <button
                  onClick={() => runCosmeticAction(() => onApplySkateLook('board'))}
                  className="rounded-xl bg-white border border-sky-200 py-2 text-sm font-black text-ocean-900 active:scale-95"
                >
                  滑板风格
                </button>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-sky-100">
                <p className="text-sm font-black text-ocean-800 mb-1">今天想教鲨鱼哪个动作？</p>
                <p className="text-xs font-bold text-gray-500 mb-3">完成一个微挑战后会播放动作秀</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTrickIndex((prev) => (prev - 1 + SKATE_TRICK_LIST.length) % SKATE_TRICK_LIST.length)}
                    className="w-9 h-9 rounded-full bg-ocean-100 text-ocean-900 font-black"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => runCosmeticAction(() => setShowTrickShowcase(true))}
                    className="flex-1 text-left rounded-xl border border-ocean-200 px-3 py-2"
                  >
                    <p className="text-base font-black text-ocean-900">{currentTrick.nameZh}</p>
                    <p className="text-xs font-bold text-gray-500">{currentTrick.nameEn}</p>
                    <p className="text-xs font-bold text-ocean-700 mt-1">{currentTrick.prompt}</p>
                  </button>
                  <button
                    onClick={() => setTrickIndex((prev) => (prev + 1) % SKATE_TRICK_LIST.length)}
                    className="w-9 h-9 rounded-full bg-ocean-100 text-ocean-900 font-black"
                  >
                    ›
                  </button>
                </div>
                <button
                  onClick={() => runCosmeticAction(() => setSelectedTrickId(currentTrick.id))}
                  className="w-full mt-2 bg-ocean-500 text-white text-sm font-black py-2 rounded-xl active:scale-95"
                >
                  选中这个动作 {selectedTrickId === currentTrick.id ? '✓' : ''}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {mission.items.map((item) => {
              const done = practicedSet.has(missionItemKey(item));
              return (
                <button
                  key={item.id}
                  onClick={() => openMissionItem(item)}
                  className={`rounded-2xl p-4 text-left shadow-[0_6px_0_rgba(0,0,0,0.08)] transition-all active:translate-y-1 active:shadow-none ${
                    done ? 'bg-sand ring-4 ring-yellow-300' : 'bg-white'
                  }`}
                >
                  <p className="text-5xl font-black text-ocean-900 mb-1">{item.char}</p>
                  <p className="text-sm font-black text-gray-500 mb-1">{getMissionTypeLabel(item.type)}</p>
                  <p className="text-sm font-black text-ocean-700">{done ? '充能完成' : '开始充能'}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={startNextMissionItem}
            className="w-full mt-4 bg-ocean-500 text-white text-2xl font-black py-4 rounded-2xl shadow-lg active:translate-y-1 active:shadow-none"
          >
            {missionDone ? '再来一轮冒险' : '继续下一步'}
          </button>

          {missionDone && (
            <p className="text-center text-sm font-black text-ocean-800 mt-3">节点完成啦，和小鲨鱼击掌收尾吧</p>
          )}
        </div>
      </div>

      <TrickShowcase
        isOpen={showTrickShowcase && skateModuleEnabled}
        trick={selectedTrick}
        sharkConfig={sharkConfig}
        theme={theme}
        themeUpgradeLevel={themeUpgradeLevel}
        onClose={() => setShowTrickShowcase(false)}
      />

      {showRhythmPrompt && (
        <div className="fixed inset-0 z-[78] bg-black/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <p className="text-4xl mb-2">🫧</p>
            <p className="text-2xl font-black text-ocean-900 mb-1">先给小鲨鱼充能</p>
            <p className="text-sm font-bold text-gray-500 mb-4">完成 1 个小挑战，再继续装扮会更投入。</p>
            <button
              onClick={() => {
                setShowRhythmPrompt(false);
                startNextMissionItem();
              }}
              className="w-full bg-ocean-500 text-white text-xl font-black py-3 rounded-2xl mb-2"
            >
              去做小挑战
            </button>
            <button
              onClick={() => setShowRhythmPrompt(false)}
              className="w-full bg-ocean-100 text-ocean-900 text-base font-black py-2 rounded-2xl"
            >
              稍后
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkateAdventure;
