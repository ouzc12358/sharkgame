
export interface Point {
  x: number;
  y: number;
  t?: number;
}

export interface StrokeGuide {
  id: number;
  x: number;
  y: number;
  angle?: number;
  hintX?: number;
  hintY?: number;
}

export interface LetterConfig {
  char: string;
  word: string;
  emoji: string;
  svgPath: string; // The path for the guide
  viewBox: string; // Viewbox for the path
  strokeGuides?: StrokeGuide[];
  strokeCountHint?: number;
  phonics?: {
    en?: string;
    zh?: string;
  };
  stickerTags?: string[];
}

export enum AppView {
  INTRO = 'INTRO',
  HOME = 'HOME',
  LETTER_LIST = 'LETTER_LIST',
  NUMBER_LIST = 'NUMBER_LIST',
  SHAPE_LIST = 'SHAPE_LIST',
  LETTER = 'LETTER',
}

export type LetterProgress = Record<string, boolean>; // char -> isCompleted

export type DifficultyMode = 'guide' | 'practice' | 'challenge';
export type SharkTheme = 'space' | 'fire' | 'diver' | 'skate';
export type LearningBlockType = 'shapes' | 'numbers' | 'letters';
export type DressupMissionPoolMode = LearningBlockType | 'mixed';
export type SessionLengthTarget = 5 | 6 | 7 | 8;
export type RhythmGateIntensity = 'light' | 'medium' | 'off';

export type SharkColor =
  | 'blue'
  | 'pink'
  | 'green'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'yellow'
  | 'coral'
  | 'mint'
  | 'sky'
  | 'peach'
  | 'violet';

export type SharkAccessorySlot = 'hat' | 'clothes' | 'shoes' | 'item' | 'face' | 'neck';

export type SharkAccessoryId =
  | 'none'
  | 'topHat'
  | 'crown'
  | 'helmet'
  | 'beanie'
  | 'rainHat'
  | 'hoodie'
  | 'tshirt'
  | 'jacket'
  | 'armor'
  | 'raincoat'
  | 'sneakers'
  | 'flippers'
  | 'boots'
  | 'rollerSkates'
  | 'board'
  | 'book'
  | 'starWand'
  | 'backpackRed'
  | 'backpackGreen'
  | 'backpackBlue'
  | 'backpackCoral'
  | 'sunglasses'
  | 'glasses'
  | 'monocle'
  | 'mask'
  | 'bowtie'
  | 'scarf'
  | 'medal';

export const SHARK_ACCESSORY_SLOTS: SharkAccessorySlot[] = [
  'hat',
  'clothes',
  'shoes',
  'item',
  'face',
  'neck',
];

export const DEFAULT_SHARK_ACCESSORIES: Record<SharkAccessorySlot, SharkAccessoryId | 'none'> = {
  hat: 'none',
  clothes: 'none',
  shoes: 'none',
  item: 'none',
  face: 'glasses',
  neck: 'none',
};

export interface SharkConfig {
  color: SharkColor;
  accessories: Record<SharkAccessorySlot, SharkAccessoryId | 'none'>;
}
