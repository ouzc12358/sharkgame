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
  createLetter('G', 'Goat', '🐐', 'M 80 25 C 20 15 20 85 80 75 C 88 73 88 55 80 50 L 55 50'),
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

export const LOWERCASE_LETTER_ITEMS: LetterConfig[] = [
  createLetter(
    'a',
    'Apple',
    '🍎',
    'M 58 42 C 48 31 28 37 27 58 C 26 78 46 85 59 70 C 64 64 65 48 58 42 M 60 38 L 60 82',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 58, y: 42, angle: 155 },
        { id: 2, x: 60, y: 38, angle: 90 },
      ],
    }
  ),
  createLetter(
    'b',
    'Ball',
    '⚽',
    'M 32 15 L 32 82 M 33 50 C 45 34 68 39 70 58 C 72 77 49 86 33 70',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 32, y: 15, angle: 90 },
        { id: 2, x: 33, y: 50, angle: -45 },
      ],
    }
  ),
  createLetter('c', 'Cat', '🐱', 'M 72 43 C 57 30 31 38 28 59 C 26 78 53 88 72 73'),
  createLetter(
    'd',
    'Dog',
    '🐶',
    'M 62 43 C 50 31 29 38 28 59 C 27 78 49 85 62 70 C 67 63 66 49 62 43 M 65 15 L 65 82',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 62, y: 43, angle: 155 },
        { id: 2, x: 65, y: 15, angle: 90 },
      ],
    }
  ),
  createLetter(
    'e',
    'Egg',
    '🥚',
    'M 34 55 L 72 55 C 70 37 45 32 32 44 C 18 57 30 79 50 80 C 62 80 69 75 75 68'
  ),
  createLetter(
    'f',
    'Fish',
    '🐟',
    'M 67 18 C 49 10 41 24 41 42 L 41 84 M 25 45 L 66 45',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 67, y: 18, angle: 175 },
        { id: 2, x: 25, y: 45, angle: 0 },
      ],
      stickerTags: ['F', 'fish', 'ocean'],
    }
  ),
  createLetter(
    'g',
    'Goat',
    '🐐',
    'M 61 42 C 49 31 29 37 28 58 C 27 77 49 84 61 70 C 66 63 66 49 61 42 M 64 40 L 64 78 C 64 94 39 96 30 86',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 61, y: 42, angle: 155 },
        { id: 2, x: 64, y: 40, angle: 90 },
      ],
    }
  ),
  createLetter(
    'h',
    'Hat',
    '🎩',
    'M 31 15 L 31 82 M 32 52 C 41 35 65 37 66 56 L 66 82',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 31, y: 15, angle: 90 },
        { id: 2, x: 32, y: 52, angle: -55 },
      ],
    }
  ),
  createLetter(
    'i',
    'Igloo',
    '🏠',
    'M 50 42 L 50 82 M 50 22 L 50 23',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 50, y: 42, angle: 90 },
        { id: 2, x: 50, y: 22, angle: 90 },
      ],
    }
  ),
  createLetter(
    'j',
    'Jam',
    '🍯',
    'M 58 42 L 58 76 C 58 91 39 94 31 84 M 58 22 L 58 23',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 58, y: 42, angle: 90 },
        { id: 2, x: 58, y: 22, angle: 90 },
      ],
    }
  ),
  createLetter(
    'k',
    'Kite',
    '🪁',
    'M 31 15 L 31 82 M 31 61 L 68 39 M 31 61 L 70 82',
    {
      strokeCountHint: 3,
      strokeGuides: [
        { id: 1, x: 31, y: 15, angle: 90 },
        { id: 2, x: 31, y: 61, angle: -30 },
        { id: 3, x: 31, y: 61, angle: 30, hintX: 25, hintY: 68 },
      ],
    }
  ),
  createLetter('l', 'Lion', '🦁', 'M 48 15 L 48 75 C 48 82 54 84 61 80'),
  createLetter(
    'm',
    'Moon',
    '🌙',
    'M 22 82 L 22 43 C 31 36 43 38 43 52 L 43 82 L 43 51 C 53 35 68 38 69 55 L 69 82'
  ),
  createLetter('n', 'Nest', '🪺', 'M 29 82 L 29 43 C 40 35 65 38 66 56 L 66 82'),
  createLetter('o', 'Owl', '🦉', 'M 50 36 C 24 36 24 82 50 82 C 76 82 76 36 50 36'),
  createLetter(
    'p',
    'Pig',
    '🐷',
    'M 31 40 L 31 94 M 32 49 C 43 33 68 39 70 58 C 71 77 48 85 32 69',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 31, y: 40, angle: 90 },
        { id: 2, x: 32, y: 49, angle: -45 },
      ],
    }
  ),
  createLetter(
    'q',
    'Queen',
    '👑',
    'M 61 42 C 49 31 29 37 28 58 C 27 77 49 84 61 70 C 66 63 66 49 61 42 M 64 40 L 64 94',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 61, y: 42, angle: 155 },
        { id: 2, x: 64, y: 40, angle: 90 },
      ],
    }
  ),
  createLetter('r', 'Rabbit', '🐰', 'M 34 82 L 34 43 C 42 35 57 36 66 43'),
  createLetter('s', 'Sun', '☀️', 'M 70 43 C 58 34 33 36 31 50 C 29 62 68 57 69 70 C 70 83 42 87 29 76'),
  createLetter(
    't',
    'Turtle',
    '🐢',
    'M 50 22 L 50 72 C 50 82 61 85 70 78 M 31 43 L 69 43',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 50, y: 22, angle: 90 },
        { id: 2, x: 31, y: 43, angle: 0 },
      ],
    }
  ),
  createLetter('u', 'Umbrella', '☂️', 'M 29 40 L 29 65 C 29 88 65 88 67 64 L 67 40 L 67 82'),
  createLetter('v', 'Violin', '🎻', 'M 25 40 L 49 82 L 75 40'),
  createLetter('w', 'Whale', '🐋', 'M 18 40 L 31 82 L 49 53 L 66 82 L 82 40', {
    stickerTags: ['W', 'whale', 'ocean'],
  }),
  createLetter(
    'x',
    'Xylophone',
    '🎼',
    'M 28 40 L 72 82 M 72 40 L 28 82',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 28, y: 40, angle: 44 },
        { id: 2, x: 72, y: 40, angle: 136 },
      ],
    }
  ),
  createLetter(
    'y',
    'Yacht',
    '⛵',
    'M 27 40 L 49 76 M 73 40 L 49 76 C 44 88 36 94 27 92',
    {
      strokeCountHint: 2,
      strokeGuides: [
        { id: 1, x: 27, y: 40, angle: 58 },
        { id: 2, x: 73, y: 40, angle: 122 },
      ],
    }
  ),
  createLetter('z', 'Zebra', '🦓', 'M 27 41 L 73 41 L 28 82 L 75 82'),
];

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
