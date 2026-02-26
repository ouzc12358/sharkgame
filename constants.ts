import { LetterConfig, StrokeGuide } from './types';

const DEFAULT_VIEWBOX = '0 0 100 100';

const NUMBER_ZH_MAP: Record<string, string> = {
  '0': '零',
  '1': '一',
  '2': '二',
  '3': '三',
  '4': '四',
  '5': '五',
  '6': '六',
  '7': '七',
  '8': '八',
  '9': '九',
};

const createLetter = (
  char: string,
  word: string,
  emoji: string,
  svgPath: string,
  options?: {
    strokeGuides?: StrokeGuide[];
    strokeCountHint?: number;
    stickerTags?: string[];
  }
): LetterConfig => ({
  char,
  word,
  emoji,
  svgPath,
  viewBox: DEFAULT_VIEWBOX,
  strokeGuides: options?.strokeGuides,
  strokeCountHint: options?.strokeCountHint,
  phonics: { en: `${char}, ${word}` },
  stickerTags: options?.stickerTags || [char, word.toLowerCase()],
});

const createNumber = (
  char: string,
  word: string,
  emoji: string,
  svgPath: string,
  options?: {
    strokeGuides?: StrokeGuide[];
    strokeCountHint?: number;
    stickerTags?: string[];
  }
): LetterConfig => ({
  char,
  word,
  emoji,
  svgPath,
  viewBox: DEFAULT_VIEWBOX,
  strokeGuides: options?.strokeGuides,
  strokeCountHint: options?.strokeCountHint,
  phonics: { zh: `数字${NUMBER_ZH_MAP[char] || char}` },
  stickerTags: options?.stickerTags || [char, `count-${char}`],
});

const createShape = (
  char: string,
  word: string,
  emoji: string,
  svgPath: string,
  stickerTags: string[]
): LetterConfig => ({
  char,
  word,
  emoji,
  svgPath,
  viewBox: DEFAULT_VIEWBOX,
  phonics: { zh: word },
  stickerTags,
});

export const LETTERS: LetterConfig[] = [
  createLetter('A', 'Apple', '🍎', 'M 50 15 L 20 85 M 50 15 L 80 85 M 30 60 L 70 60', {
    strokeCountHint: 3,
    strokeGuides: [
      { id: 1, x: 50, y: 15, angle: 115 },
      { id: 2, x: 50, y: 15, angle: 65 },
      { id: 3, x: 30, y: 60, angle: 0 },
    ],
  }),
  createLetter('B', 'Ball', '⚽', 'M 25 15 L 25 85 M 25 15 C 65 15 65 50 25 50 M 25 50 C 70 50 70 85 25 85', {
    strokeCountHint: 3,
    strokeGuides: [
      { id: 1, x: 25, y: 15, angle: 90 },
      { id: 2, x: 25, y: 15, angle: 10 },
      { id: 3, x: 25, y: 50, angle: 12 },
    ],
  }),
  createLetter('C', 'Cat', '🐱', 'M 80 25 C 20 15 20 85 80 75'),
  createLetter('D', 'Dog', '🐶', 'M 25 15 L 25 85 M 25 15 C 80 15 80 85 25 85', {
    strokeCountHint: 2,
  }),
  createLetter('E', 'Egg', '🥚', 'M 25 15 L 25 85 M 25 15 L 75 15 M 25 50 L 65 50 M 25 85 L 75 85', {
    strokeCountHint: 4,
  }),
  createLetter('F', 'Fish', '🐟', 'M 25 15 L 25 85 M 25 15 L 75 15 M 25 50 L 65 50', {
    stickerTags: ['F', 'fish', 'ocean'],
  }),
  createLetter('G', 'Goat', '🐐', 'M 80 25 C 20 15 20 85 80 75 M 80 50 L 55 50'),
  createLetter('H', 'Hat', '🎩', 'M 25 15 L 25 85 M 75 15 L 75 85 M 25 50 L 75 50'),
  createLetter('I', 'Igloo', '🏠', 'M 30 15 L 70 15 M 50 15 L 50 85 M 30 85 L 70 85'),
  createLetter('J', 'Jam', '🍯', 'M 30 15 L 70 15 M 60 15 L 60 75 C 60 95 30 95 30 75'),
  createLetter('K', 'Kite', '🪁', 'M 25 15 L 25 85 M 25 50 L 75 15 M 25 50 L 75 85', {
    strokeCountHint: 3,
  }),
  createLetter('L', 'Lion', '🦁', 'M 25 15 L 25 85 M 25 85 L 75 85'),
  createLetter('M', 'Moon', '🌙', 'M 20 85 L 20 15 M 20 15 L 50 60 M 50 60 L 80 15 M 80 15 L 80 85'),
  createLetter('N', 'Nest', '🪺', 'M 25 15 L 25 85 M 25 85 L 75 15 M 75 15 L 75 85'),
  createLetter('O', 'Owl', '🦉', 'M 50 15 C 15 15 15 85 50 85 C 85 85 85 15 50 15'),
  createLetter('P', 'Pig', '🐷', 'M 25 15 L 25 85 M 25 15 C 70 15 70 55 25 55'),
  createLetter('Q', 'Queen', '👑', 'M 50 15 C 15 15 15 85 50 85 C 85 85 85 15 50 15 M 60 70 L 80 90'),
  createLetter('R', 'Rabbit', '🐰', 'M 25 15 L 25 85 M 25 15 C 70 15 70 55 25 55 M 25 55 L 75 85', {
    strokeCountHint: 3,
    strokeGuides: [
      { id: 1, x: 25, y: 15, angle: 90 },
      { id: 2, x: 25, y: 15, angle: 8 },
      { id: 3, x: 25, y: 55, angle: 38 },
    ],
  }),
  createLetter('S', 'Sun', '☀️', 'M 80 20 C 20 10 20 50 50 50 C 80 50 80 90 20 80'),
  createLetter('T', 'Turtle', '🐢', 'M 20 15 L 80 15 M 50 15 L 50 85'),
  createLetter('U', 'Umbrella', '☂️', 'M 25 15 L 25 65 C 25 90 75 90 75 65 L 75 15'),
  createLetter('V', 'Violin', '🎻', 'M 20 15 L 50 85 L 80 15'),
  createLetter('W', 'Whale', '🐋', 'M 15 15 L 30 85 L 50 40 L 70 85 L 85 15', {
    stickerTags: ['W', 'whale', 'ocean'],
  }),
  createLetter('X', 'Xylophone', '🎼', 'M 20 15 L 80 85 M 80 15 L 20 85'),
  createLetter('Y', 'Yacht', '⛵', 'M 20 15 L 50 50 M 80 15 L 50 50 M 50 50 L 50 85'),
  createLetter('Z', 'Zebra', '🦓', 'M 20 15 L 80 15 M 80 15 L 20 85 M 20 85 L 80 85', {
    strokeCountHint: 3,
  }),
  createNumber('0', 'Zero', '🍩', 'M 50 15 C 20 15 20 85 50 85 C 80 85 80 15 50 15'),
  createNumber('1', 'One', '☝️', 'M 50 20 L 50 85'),
  createNumber('2', 'Two', '🦆', 'M 25 30 C 35 10 75 10 75 35 C 75 50 60 60 25 85 L 75 85'),
  createNumber('3', 'Three', '🌳', 'M 25 20 C 75 15 75 45 40 50 C 75 50 75 85 25 80'),
  createNumber('4', 'Four', '🍀', 'M 70 15 L 30 60 L 80 60 M 70 15 L 70 85'),
  createNumber('5', 'Five', '✋', 'M 75 15 L 30 15 L 30 50 C 30 50 35 45 55 45 C 80 45 80 85 35 85'),
  createNumber('6', 'Six', '🐌', 'M 70 25 C 55 10 30 20 30 50 C 30 85 75 90 75 60 C 75 35 40 35 30 55'),
  createNumber('7', 'Seven', '🌈', 'M 25 15 L 80 15 L 45 85'),
  createNumber('8', 'Eight', '🐙', 'M 50 15 C 25 15 25 45 50 45 C 75 45 75 15 50 15 M 50 45 C 20 45 20 85 50 85 C 80 85 80 45 50 45', {
    strokeCountHint: 2,
    strokeGuides: [
      { id: 1, x: 50, y: 15, angle: 0 },
      { id: 2, x: 50, y: 45, angle: 0 },
    ],
  }),
  createNumber('9', 'Nine', '🎈', 'M 65 45 C 65 20 30 20 30 45 C 30 70 65 70 65 45 M 65 45 L 65 85'),
];

export const LETTER_ITEMS = LETTERS.filter((item) => /^[A-Z]$/.test(item.char));
export const NUMBER_ITEMS = LETTERS.filter((item) => /^[0-9]$/.test(item.char));

export const SHAPE_ITEMS: LetterConfig[] = [
  createShape('—', '横线', '➖', 'M 20 50 L 80 50', ['shape-line', 'line-horizontal']),
  createShape('|', '竖线', '📏', 'M 50 20 L 50 80', ['shape-line', 'line-vertical']),
  createShape('/', '斜线', '📐', 'M 25 75 L 75 25', ['shape-line', 'line-diagonal']),
  createShape('○', '圆圈', '⭕', 'M 50 20 C 30 20 20 35 20 50 C 20 65 30 80 50 80 C 70 80 80 65 80 50 C 80 35 70 20 50 20', [
    'shape-circle',
    'circle',
    'bubble',
  ]),
  createShape('⌒', '弧线', '🌙', 'M 20 70 C 35 25 65 25 80 70', ['shape-arc', 'arc']),
  createShape('⚡', '锯齿线', '⚡', 'M 20 30 L 40 55 L 60 30 L 80 55', ['shape-zigzag', 'zigzag']),
  createShape('✚', '交叉线', '❌', 'M 25 25 L 75 75 M 75 25 L 25 75', ['shape-cross', 'cross']),
];
