import {
  DEFAULT_SHARK_ACCESSORIES,
  DifficultyMode,
  DressupMissionPoolMode,
  LetterProgress,
  RhythmGateIntensity,
  SessionLengthTarget,
  SharkAccessoryId,
  SharkAccessorySlot,
  SharkColor,
  SharkConfig,
  SharkTheme,
} from '../../types';

const CHILD_STATE_STORAGE_KEY = 'sharkgame.childState.v1';

export interface ChildStateSnapshot {
  completedLetters: LetterProgress;
  customImages: Record<string, string>;
  customImageVoices: Record<string, string>;
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
  customImageVoices: {},
  sharkConfig: {
    color: 'teal',
    accessories: { ...DEFAULT_SHARK_ACCESSORIES },
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

const VALID_COLORS = new Set<SharkColor>([
  'blue',
  'pink',
  'green',
  'purple',
  'orange',
  'teal',
  'yellow',
  'coral',
  'mint',
  'sky',
  'peach',
  'violet',
]);

const VALID_SLOTS: SharkAccessorySlot[] = ['hat', 'clothes', 'shoes', 'item', 'face', 'neck'];
const VALID_ACCESSORY_IDS = new Set<SharkAccessoryId>([
  'none',
  'topHat',
  'crown',
  'helmet',
  'beanie',
  'rainHat',
  'hoodie',
  'tshirt',
  'jacket',
  'armor',
  'raincoat',
  'sneakers',
  'flippers',
  'boots',
  'rollerSkates',
  'board',
  'book',
  'starWand',
  'backpackRed',
  'backpackGreen',
  'backpackBlue',
  'backpackCoral',
  'sunglasses',
  'glasses',
  'monocle',
  'mask',
  'bowtie',
  'scarf',
  'medal',
]);

const safeMode = (value: unknown): DifficultyMode =>
  value === 'guide' || value === 'practice' || value === 'challenge' ? value : 'guide';

const safeTheme = (value: unknown): SharkTheme =>
  value === 'space' || value === 'fire' || value === 'diver' || value === 'skate' ? value : 'diver';

const safeColor = (value: unknown): SharkColor =>
  typeof value === 'string' && VALID_COLORS.has(value as SharkColor) ? (value as SharkColor) : DEFAULT_STATE.sharkConfig.color;

const safePoolMode = (value: unknown): DressupMissionPoolMode => {
  if (value === 'shapes') return 'mixed';
  return value === 'numbers' || value === 'letters' || value === 'mixed' ? value : 'mixed';
};

const safeSessionTarget = (value: unknown): SessionLengthTarget =>
  value === 5 || value === 6 || value === 7 || value === 8 ? value : 6;

const safeRhythmGate = (value: unknown): RhythmGateIntensity =>
  value === 'light' || value === 'medium' || value === 'off' ? value : 'medium';

const safeAccessoryId = (value: unknown): SharkAccessoryId | 'none' =>
  typeof value === 'string' && VALID_ACCESSORY_IDS.has(value as SharkAccessoryId) ? (value as SharkAccessoryId) : 'none';

const safeAccessories = (value: unknown): Record<SharkAccessorySlot, SharkAccessoryId | 'none'> => {
  const next = { ...DEFAULT_SHARK_ACCESSORIES };
  if (!value || typeof value !== 'object') return next;
  const raw = value as Partial<Record<SharkAccessorySlot, unknown>>;
  for (const slot of VALID_SLOTS) {
    next[slot] = safeAccessoryId(raw[slot]);
  }
  return next;
};

const migrateLegacyAccessory = (legacyAccessory: unknown): Record<SharkAccessorySlot, SharkAccessoryId | 'none'> => {
  const migrated = { ...DEFAULT_SHARK_ACCESSORIES };
  const legacy = typeof legacyAccessory === 'string' ? legacyAccessory : 'none';

  if (legacy === 'hat') migrated.hat = 'topHat';
  else if (legacy === 'glasses') migrated.face = 'glasses';
  else if (legacy === 'bowtie') migrated.neck = 'bowtie';
  else if (legacy === 'crown') migrated.hat = 'crown';
  else if (legacy === 'headphones') migrated.neck = 'medal';
  else if (legacy === 'scarf') migrated.neck = 'scarf';
  else if (legacy === 'helmet') migrated.hat = 'helmet';
  else if (legacy === 'pads') migrated.clothes = 'armor';
  else if (legacy === 'board') migrated.item = 'board';
  else if (legacy === 'redBag') migrated.item = 'backpackRed';
  else if (legacy === 'greenBag') migrated.item = 'backpackGreen';
  else if (legacy === 'blueBag') migrated.item = 'backpackBlue';
  else if (legacy === 'lightCoralBag') migrated.item = 'backpackCoral';

  return migrated;
};

const safeSharkConfig = (value: unknown): SharkConfig => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_STATE.sharkConfig;
  }

  const raw = value as {
    color?: unknown;
    accessories?: unknown;
    accessory?: unknown;
  };

  if (raw.accessories && typeof raw.accessories === 'object') {
    return {
      color: safeColor(raw.color),
      accessories: safeAccessories(raw.accessories),
    };
  }

  // Legacy migration: { color, accessory }
  if (raw.accessory !== undefined) {
    return {
      color: safeColor(raw.color),
      accessories: migrateLegacyAccessory(raw.accessory),
    };
  }

  return {
    color: safeColor(raw.color),
    accessories: { ...DEFAULT_SHARK_ACCESSORIES },
  };
};

export const loadChildState = (): ChildStateSnapshot => {
  try {
    const raw = localStorage.getItem(CHILD_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ChildStateSnapshot>;

    return {
      completedLetters: parsed.completedLetters || {},
      customImages: parsed.customImages || {},
      customImageVoices: parsed.customImageVoices || {},
      sharkConfig: safeSharkConfig(parsed.sharkConfig),
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
