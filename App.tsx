import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LETTER_ITEMS, NUMBER_ITEMS, SHAPE_ITEMS } from './constants';
import {
  DifficultyMode,
  LetterConfig,
  SharkTheme,
} from './types';
import HomeScreen from './src/modules/home/HomeScreen';
import ShapesMode from './src/modules/learn/ShapesMode';
import NumbersMode from './src/modules/learn/NumbersMode';
import LettersMode from './src/modules/learn/LettersMode';
import DressUpAdventure from './src/modules/dressup/DressUpAdventure';
import SkateAdventure from './src/modules/skate/SkateAdventure';
import MissionRitual from './src/components/MissionRitual';
import ParentZone from './src/components/ParentZone';
import SharkSettingsModal from './src/components/SharkSettingsModal';
import ThemeChoiceModal from './src/components/ThemeChoiceModal';
import { buildDailyMission, getDateKey, MissionItem, missionItemKey } from './src/logic/missions';
import {
  addPracticedMissionItem,
  completeMissionRitual,
  ensureMissionDay,
  loadMissionStore,
  MissionStoreState,
  saveMissionStore,
} from './src/logic/missionStore';
import {
  addAttempt,
  getDisplayLevels,
  getLatestAttempt,
  loadMetricsStore,
  pickPraiseMessage,
  saveMetricsStore,
  TraceAttempt,
  TraceMetricsStore,
} from './src/logic/metrics';
import {
  getPracticeItemKey,
  LearningCategory,
} from './src/logic/tracing';
import { setAudioPreferenceFlags, speak } from './src/logic/audio';
import { loadChildState, saveChildState } from './src/logic/storage';
import { getThemeUpgradeLevel, SHARK_THEME_PRESETS } from './src/modules/dressup/sharkStyle';

type Route = 'home' | 'shapes' | 'numbers' | 'letters' | 'dressup' | 'skate';

const formatPracticeItemKey = (itemKey: string) => {
  const [type, char] = itemKey.split(':');
  if (!char) return itemKey;
  if (type === 'letter') return `字母 ${char}`;
  if (type === 'number') return `数字 ${char}`;
  if (type === 'shape') return `线条 ${char}`;
  return itemKey;
};

const daysBetween = (fromDate: string, toDate: string) => {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const findConfigByMissionItem = (item: MissionItem): LetterConfig | null => {
  const source = item.type === 'letter' ? LETTER_ITEMS : item.type === 'number' ? NUMBER_ITEMS : SHAPE_ITEMS;
  return source.find((entry) => entry.char === item.char) || null;
};

const missionTypeForCategory = (category: LearningCategory): MissionItem['type'] => {
  if (category === 'numbers') return 'number';
  if (category === 'shapes') return 'shape';
  return 'letter';
};

export default function App() {
  const initialChildState = useMemo(() => loadChildState(), []);

  const [route, setRoute] = useState<Route>('home');
  const [showMissionRitual, setShowMissionRitual] = useState(false);
  const [showThemeChoice, setShowThemeChoice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParentZone, setShowParentZone] = useState(false);

  const [completedLetters, setCompletedLetters] = useState(initialChildState.completedLetters);
  const [customImages, setCustomImages] = useState<Record<string, string>>(initialChildState.customImages);
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>(initialChildState.difficultyMode);
  const [currentTheme, setCurrentTheme] = useState<SharkTheme>(initialChildState.currentTheme);
  const [themePracticeCounts, setThemePracticeCounts] = useState(initialChildState.themePracticeCounts);
  const [sharkConfig, setSharkConfig] = useState(initialChildState.sharkConfig);
  const [ttsEnabled, setTtsEnabled] = useState(initialChildState.ttsEnabled);
  const [soundsEnabled, setSoundsEnabled] = useState(initialChildState.soundsEnabled);

  const [dressupMissionPool, setDressupMissionPool] = useState(initialChildState.dressupMissionPool);
  const [sessionLengthTarget, setSessionLengthTarget] = useState(initialChildState.sessionLengthTarget);
  const [rhythmGateIntensity, setRhythmGateIntensity] = useState(initialChildState.rhythmGateIntensity);
  const [skateModuleEnabled, setSkateModuleEnabled] = useState(initialChildState.skateModuleEnabled);
  const [styleTokens, setStyleTokens] = useState(initialChildState.styleTokens);

  const [missionStore, setMissionStore] = useState<MissionStoreState>(() => loadMissionStore());
  const [metricsStore, setMetricsStore] = useState<TraceMetricsStore>(() => loadMetricsStore());
  const parentHoldTimerRef = useRef<number | null>(null);

  const todayKey = getDateKey();
  const todayMission = useMemo(
    () =>
      buildDailyMission(
        todayKey,
        LETTER_ITEMS.map((item) => item.char),
        NUMBER_ITEMS.map((item) => item.char),
        SHAPE_ITEMS.map((item) => item.char),
        { poolMode: dressupMissionPool }
      ),
    [todayKey, dressupMissionPool]
  );

  const todayDay = missionStore.days[todayKey];
  const todayPracticedKeys = todayDay?.practicedItemKeys || [];
  const missionDoneCount = todayMission.items.filter((item) => todayPracticedKeys.includes(missionItemKey(item))).length;
  const currentThemeUpgradeLevel = getThemeUpgradeLevel(themePracticeCounts[currentTheme]);
  const todayMinutes = Math.round(todayDay?.minutesPracticed || 0);
  const todayPracticedItems = todayPracticedKeys.map(formatPracticeItemKey);

  const weakestMetricSuggestions = useMemo(() => {
    const attemptsEntries = Object.entries(metricsStore.attempts);
    if (attemptsEntries.length === 0) return [];

    const metricLabel: Record<'follow' | 'smoothness' | 'continuity', string> = {
      follow: '贴近',
      smoothness: '顺滑',
      continuity: '连贯',
    };

    return attemptsEntries
      .map(([itemKey, attempts]) => {
        const recent = attempts.slice(-3);
        if (recent.length === 0) return null;
        const avg = recent.reduce(
          (acc, attempt) => ({
            follow: acc.follow + attempt.levels.follow,
            smoothness: acc.smoothness + attempt.levels.smoothness,
            continuity: acc.continuity + attempt.levels.continuity,
          }),
          { follow: 0, smoothness: 0, continuity: 0 }
        );
        const divisor = recent.length;
        const values = {
          follow: avg.follow / divisor,
          smoothness: avg.smoothness / divisor,
          continuity: avg.continuity / divisor,
        };
        const weakest = (Object.keys(values) as Array<'follow' | 'smoothness' | 'continuity'>).sort(
          (a, b) => values[a] - values[b]
        )[0];
        return {
          itemKey,
          weakestMetric: weakest,
          weakestValue: values[weakest],
        };
      })
      .filter(
        (item): item is { itemKey: string; weakestMetric: 'follow' | 'smoothness' | 'continuity'; weakestValue: number } =>
          Boolean(item)
      )
      .sort((a, b) => a.weakestValue - b.weakestValue)
      .slice(0, 3)
      .map((item) => `${formatPracticeItemKey(item.itemKey)}：优先练${metricLabel[item.weakestMetric]}`);
  }, [metricsStore]);

  const reviewReminders = useMemo(() => {
    const intervals = new Set([1, 3, 7]);
    return missionStore.history
      .map((entry) => ({ entry, daysAgo: daysBetween(entry.date, todayKey) }))
      .filter((item) => intervals.has(item.daysAgo))
      .slice(0, 4)
      .map((item) => `复习 ${item.daysAgo} 天前的任务：${item.entry.items.map(formatPracticeItemKey).join('、')}`);
  }, [missionStore.history, todayKey]);

  const applyTheme = (theme: SharkTheme) => {
    const preset = SHARK_THEME_PRESETS[theme];
    setCurrentTheme(theme);
    setSharkConfig((prev) => ({
      ...prev,
      color: preset.color,
      accessory: preset.accessory,
    }));
  };

  const applySkateLook = (look: 'base' | 'helmet' | 'pads' | 'board') => {
    applyTheme('skate');
    const accessoryMap = {
      base: 'board',
      helmet: 'helmet',
      pads: 'pads',
      board: 'board',
    } as const;
    setSharkConfig((prev) => ({
      ...prev,
      accessory: accessoryMap[look],
    }));
  };

  const clearParentHold = () => {
    if (parentHoldTimerRef.current !== null) {
      window.clearTimeout(parentHoldTimerRef.current);
      parentHoldTimerRef.current = null;
    }
  };

  const startParentHold = () => {
    clearParentHold();
    parentHoldTimerRef.current = window.setTimeout(() => {
      setShowParentZone(true);
      parentHoldTimerRef.current = null;
    }, 5000);
  };

  const onRequestAttempt = (item: LetterConfig, category: LearningCategory, attempt: TraceAttempt) => {
    const itemKey = getPracticeItemKey(item.char, category);
    setMetricsStore((prev) => {
      const previous = getLatestAttempt(prev, itemKey);
      const message = pickPraiseMessage(previous, attempt);
      speak(message, 'zh-CN', 0.62);
      return addAttempt(prev, itemKey, attempt);
    });
  };

  const onRequestComplete = (item: LetterConfig) => {
    setCompletedLetters((prev) => ({ ...prev, [item.char]: true }));
    setThemePracticeCounts((prev) => ({
      ...prev,
      [currentTheme]: (prev[currentTheme] || 0) + 1,
    }));
    setStyleTokens((prev) => prev + 1);
  };

  const onCompleteMissionChallenge = (
    missionItem: MissionItem,
    item: LetterConfig,
    category: LearningCategory,
    minutesDelta: number
  ) => {
    onRequestComplete(item);
    const type = missionTypeForCategory(category);
    const matched =
      todayMission.items.find((entry) => entry.char === missionItem.char && entry.type === type) ||
      todayMission.items.find((entry) => entry.char === item.char && entry.type === type);

    if (matched) {
      setMissionStore((prev) => addPracticedMissionItem(prev, todayKey, missionItemKey(matched), minutesDelta));
    }
  };

  const onCompleteDressupChallenge = (
    item: LetterConfig,
    _category: LearningCategory,
    _minutesDelta: number
  ) => {
    onRequestComplete(item);
  };

  const getProgressLevels = (item: LetterConfig, category: LearningCategory) => {
    const itemKey = getPracticeItemKey(item.char, category);
    return getDisplayLevels(metricsStore, itemKey);
  };

  const handleUpdateImage = (char: string, image: string) => {
    setCustomImages((prev) => ({
      ...prev,
      [char]: image,
    }));
  };

  useEffect(() => {
    setMissionStore((prev) => ensureMissionDay(prev, todayKey, todayMission));
  }, [todayKey, todayMission]);

  useEffect(() => {
    if (!todayDay || todayDay.ritualDone) return;
    if (missionDoneCount >= todayMission.items.length) {
      setShowMissionRitual(true);
    }
  }, [missionDoneCount, todayDay, todayMission.items.length]);

  useEffect(() => {
    saveMissionStore(missionStore);
  }, [missionStore]);

  useEffect(() => {
    saveMetricsStore(metricsStore);
  }, [metricsStore]);

  useEffect(() => {
    setAudioPreferenceFlags({ ttsEnabled, soundsEnabled });
    if (!ttsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [ttsEnabled, soundsEnabled]);

  useEffect(() => {
    saveChildState({
      completedLetters,
      customImages,
      sharkConfig,
      difficultyMode,
      currentTheme,
      themePracticeCounts,
      ttsEnabled,
      soundsEnabled,
      dressupMissionPool,
      sessionLengthTarget,
      rhythmGateIntensity,
      skateModuleEnabled,
      styleTokens,
    });
  }, [
    completedLetters,
    customImages,
    sharkConfig,
    difficultyMode,
    currentTheme,
    themePracticeCounts,
    ttsEnabled,
    soundsEnabled,
    dressupMissionPool,
    sessionLengthTarget,
    rhythmGateIntensity,
    skateModuleEnabled,
    styleTokens,
  ]);

  useEffect(() => () => clearParentHold(), []);

  const renderRoute = () => {
    if (route === 'shapes') {
      return (
        <ShapesMode
          progress={completedLetters}
          customImages={customImages}
          difficultyMode={difficultyMode}
          sharkConfig={sharkConfig}
          theme={currentTheme}
          themeUpgradeLevel={currentThemeUpgradeLevel}
          onBack={() => setRoute('home')}
          onOpenSettings={() => setShowSettings(true)}
          onRequestComplete={(item, _category, _minutesDelta) => onRequestComplete(item)}
          onRequestAttempt={onRequestAttempt}
          getProgressLevels={getProgressLevels}
          onUpdateImage={handleUpdateImage}
        />
      );
    }

    if (route === 'numbers') {
      return (
        <NumbersMode
          progress={completedLetters}
          customImages={customImages}
          difficultyMode={difficultyMode}
          sharkConfig={sharkConfig}
          theme={currentTheme}
          themeUpgradeLevel={currentThemeUpgradeLevel}
          onBack={() => setRoute('home')}
          onOpenSettings={() => setShowSettings(true)}
          onRequestComplete={(item, _category, _minutesDelta) => onRequestComplete(item)}
          onRequestAttempt={onRequestAttempt}
          getProgressLevels={getProgressLevels}
          onUpdateImage={handleUpdateImage}
        />
      );
    }

    if (route === 'letters') {
      return (
        <LettersMode
          progress={completedLetters}
          customImages={customImages}
          difficultyMode={difficultyMode}
          sharkConfig={sharkConfig}
          theme={currentTheme}
          themeUpgradeLevel={currentThemeUpgradeLevel}
          onBack={() => setRoute('home')}
          onOpenSettings={() => setShowSettings(true)}
          onRequestComplete={(item, _category, _minutesDelta) => onRequestComplete(item)}
          onRequestAttempt={onRequestAttempt}
          getProgressLevels={getProgressLevels}
          onUpdateImage={handleUpdateImage}
        />
      );
    }

    if (route === 'dressup') {
      return (
        <DressUpAdventure
          onBack={() => setRoute('home')}
          onOpenSettings={() => setShowSettings(true)}
          sharkConfig={sharkConfig}
          theme={currentTheme}
          themeUpgradeLevel={currentThemeUpgradeLevel}
          dressupMissionPool={dressupMissionPool}
          onApplyTheme={applyTheme}
          onApplyColor={(color) =>
            setSharkConfig((prev) => ({
              ...prev,
              color,
            }))
          }
          onApplyAccessory={(accessory) =>
            setSharkConfig((prev) => ({
              ...prev,
              accessory,
            }))
          }
          onAttemptChallenge={onRequestAttempt}
          onChallengeComplete={onCompleteDressupChallenge}
          getProgressLevels={getProgressLevels}
          customImages={customImages}
          onUpdateImage={handleUpdateImage}
          styleTokens={styleTokens}
        />
      );
    }

    if (route === 'skate') {
      return (
        <SkateAdventure
          mission={todayMission}
          practicedItemKeys={todayPracticedKeys}
          onBack={() => setRoute('home')}
          onOpenSettings={() => setShowSettings(true)}
          onNarrateStory={() => speak(todayMission.story, 'zh-CN')}
          onCompleteChallenge={onCompleteMissionChallenge}
          onAttemptChallenge={onRequestAttempt}
          getProgressLevels={getProgressLevels}
          findConfigByMissionItem={findConfigByMissionItem}
          sharkConfig={sharkConfig}
          theme={currentTheme}
          themeUpgradeLevel={currentThemeUpgradeLevel}
          customImages={customImages}
          onUpdateImage={handleUpdateImage}
          streak={missionStore.streak}
          diaryStickers={missionStore.history.map((entry) => entry.sticker).slice(0, 6).reverse()}
          sessionLengthTarget={sessionLengthTarget}
          styleTokens={styleTokens}
          skateModuleEnabled={skateModuleEnabled}
          onApplySkateLook={applySkateLook}
          rhythmGateIntensity={rhythmGateIntensity}
        />
      );
    }

    return (
      <HomeScreen
        onOpenShapes={() => setRoute('shapes')}
        onOpenNumbers={() => setRoute('numbers')}
        onOpenLetters={() => setRoute('letters')}
        onOpenDressup={() => setRoute('dressup')}
        onOpenSkate={() => setRoute('skate')}
        onOpenSettings={() => setShowSettings(true)}
        streak={missionStore.streak}
        todayCompleted={Boolean(todayDay?.completed)}
        dressupPoolMode={dressupMissionPool}
        sharkConfig={sharkConfig}
        theme={currentTheme}
        themeUpgradeLevel={currentThemeUpgradeLevel}
      />
    );
  };

  return (
    <div className="h-full w-full relative">
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>

      <button
        aria-label="Parent zone entry"
        className="absolute top-1 right-1 z-[85] w-7 h-7 rounded-full bg-white/10 text-white/30 text-[10px] font-black select-none"
        onPointerDown={startParentHold}
        onPointerUp={clearParentHold}
        onPointerLeave={clearParentHold}
        onPointerCancel={clearParentHold}
      >
        •
      </button>

      {renderRoute()}

      <SharkSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={sharkConfig}
        onChange={setSharkConfig}
        theme={currentTheme}
        themePracticeCount={themePracticeCounts[currentTheme]}
        onApplyTheme={applyTheme}
      />

      <MissionRitual
        isOpen={showMissionRitual}
        onHighFive={() => {
          setMissionStore((prev) => completeMissionRitual(prev, todayKey));
          setShowMissionRitual(false);
          speak('击掌成功，明天继续冒险！', 'zh-CN');
          setShowThemeChoice(true);
        }}
      />

      <ThemeChoiceModal
        isOpen={showThemeChoice}
        currentTheme={currentTheme}
        themePracticeCounts={themePracticeCounts}
        onChoose={(theme) => {
          applyTheme(theme);
          setShowThemeChoice(false);
        }}
        onClose={() => setShowThemeChoice(false)}
      />

      <ParentZone
        isOpen={showParentZone}
        onClose={() => setShowParentZone(false)}
        ttsEnabled={ttsEnabled}
        soundsEnabled={soundsEnabled}
        difficultyMode={difficultyMode}
        onToggleTts={setTtsEnabled}
        onToggleSounds={setSoundsEnabled}
        onChangeDifficulty={setDifficultyMode}
        todayMinutes={todayMinutes}
        todayItems={todayPracticedItems}
        streak={missionStore.streak}
        suggestions={weakestMetricSuggestions}
        reviewReminders={reviewReminders}
        dressupMissionPool={dressupMissionPool}
        onChangeDressupMissionPool={setDressupMissionPool}
        sessionLengthTarget={sessionLengthTarget}
        onChangeSessionLengthTarget={setSessionLengthTarget}
        rhythmGateIntensity={rhythmGateIntensity}
        onChangeRhythmGateIntensity={setRhythmGateIntensity}
        skateModuleEnabled={skateModuleEnabled}
        onToggleSkateModule={setSkateModuleEnabled}
      />

    </div>
  );
}
