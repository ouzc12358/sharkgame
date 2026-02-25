import {
  DifficultyMode,
  DressupMissionPoolMode,
  LetterProgress,
  RhythmGateIntensity,
  SessionLengthTarget,
  SharkConfig,
  SharkTheme,
} from '../../types';

const CHILD_STATE_STORAGE_KEY = 'sharkgame.childState.v1';

export interface ChildStateSnapshot {
  completedLetters: LetterProgress;
  customImages: Record<string, string>;
  sharkConfig: SharkConfig;
  difficultyMode: DifficultyMode;
  currentTheme: SharkTheme;
  themePracticeCounts: Record<SharkTheme, number>;
  ttsEnabled: boolean;
  soundsEnabled: boolean;
  dressupMissionPool: DressupMissionPoolMode;
  sessionLengthTarget: SessionLengthTarget;
  rhythmGateIntensity: RhythmGateIntensity;
  skateModuleEnabled: boolean;
  styleTokens: number;
}

const DEFAULT_STATE: ChildStateSnapshot = {
  completedLetters: {},
  customImages: {},
  sharkConfig: {
    color: 'teal',
    accessory: 'glasses',
  },
  difficultyMode: 'guide',
  currentTheme: 'diver',
  themePracticeCounts: { space: 0, fire: 0, diver: 0, skate: 0 },
  ttsEnabled: true,
  soundsEnabled: true,
  dressupMissionPool: 'mixed',
  sessionLengthTarget: 6,
  rhythmGateIntensity: 'medium',
  skateModuleEnabled: true,
  styleTokens: 0,
};

const safeMode = (value: unknown): DifficultyMode =>
  value === 'guide' || value === 'practice' || value === 'challenge' ? value : 'guide';

const safeTheme = (value: unknown): SharkTheme =>
  value === 'space' || value === 'fire' || value === 'diver' || value === 'skate' ? value : 'diver';

const safePoolMode = (value: unknown): DressupMissionPoolMode =>
  value === 'numbers' || value === 'letters' || value === 'mixed'
    ? value
    : value === 'shapes'
    ? 'mixed'
    : 'mixed';

const safeSessionTarget = (value: unknown): SessionLengthTarget =>
  value === 5 || value === 6 || value === 7 || value === 8 ? value : 6;

const safeRhythmGate = (value: unknown): RhythmGateIntensity =>
  value === 'light' || value === 'medium' || value === 'off' ? value : 'medium';

export const loadChildState = (): ChildStateSnapshot => {
  try {
    const raw = localStorage.getItem(CHILD_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ChildStateSnapshot>;

    return {
      completedLetters: parsed.completedLetters || {},
      customImages: parsed.customImages || {},
      sharkConfig: parsed.sharkConfig || DEFAULT_STATE.sharkConfig,
      difficultyMode: safeMode(parsed.difficultyMode),
      currentTheme: safeTheme(parsed.currentTheme),
      themePracticeCounts: {
        space: Math.max(0, parsed.themePracticeCounts?.space || 0),
        fire: Math.max(0, parsed.themePracticeCounts?.fire || 0),
        diver: Math.max(0, parsed.themePracticeCounts?.diver || 0),
        skate: Math.max(0, parsed.themePracticeCounts?.skate || 0),
      },
      ttsEnabled: parsed.ttsEnabled !== false,
      soundsEnabled: parsed.soundsEnabled !== false,
      dressupMissionPool: safePoolMode(parsed.dressupMissionPool),
      sessionLengthTarget: safeSessionTarget(parsed.sessionLengthTarget),
      rhythmGateIntensity: safeRhythmGate(parsed.rhythmGateIntensity),
      skateModuleEnabled: parsed.skateModuleEnabled !== false,
      styleTokens: Math.max(0, parsed.styleTokens || 0),
    };
  } catch {
    return DEFAULT_STATE;
  }
};

export const saveChildState = (snapshot: ChildStateSnapshot) => {
  localStorage.setItem(CHILD_STATE_STORAGE_KEY, JSON.stringify(snapshot));
};
