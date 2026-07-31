import { LetterConfig } from '../../../types';

export type HanziWritingItem = LetterConfig & {
  pinyin: string;
};

export interface HanziCharacterPair {
  id: string;
  label: string;
  icon: string;
  items: [HanziWritingItem, HanziWritingItem];
}

const createHanziWritingItem = (
  char: string,
  word: string,
  pinyin: string,
  emoji: string,
  svgPath: string,
  strokeGuides: NonNullable<LetterConfig['strokeGuides']>,
  association: string
): HanziWritingItem => ({
  char,
  word,
  pinyin,
  emoji,
  svgPath,
  viewBox: '0 0 100 100',
  strokeGuides,
  strokeCountHint: strokeGuides.length,
  phonics: { zh: association },
});

export const HANZI_BASIC_STROKES: HanziWritingItem[] = [
  createHanziWritingItem(
    '一',
    '横',
    'héng',
    '🌉',
    'M 20 50 L 80 50',
    [{ id: 1, x: 20, y: 50, angle: 0 }],
    '像小桥一样，平平地向右走'
  ),
  createHanziWritingItem(
    '丨',
    '竖',
    'shù',
    '🌲',
    'M 50 18 L 50 82',
    [{ id: 1, x: 50, y: 18, angle: 90 }],
    '像小树一样，从上往下站直'
  ),
  createHanziWritingItem(
    '丿',
    '撇',
    'piě',
    '🛝',
    'M 68 20 C 60 43 46 66 25 80',
    [{ id: 1, x: 68, y: 20, angle: 116 }],
    '像滑梯一样，向左下方滑'
  ),
  createHanziWritingItem(
    '㇏',
    '捺',
    'nà',
    '🌊',
    'M 35 22 C 44 43 58 67 79 80',
    [{ id: 1, x: 35, y: 22, angle: 52 }],
    '像小海浪一样，向右下方伸展'
  ),
  createHanziWritingItem(
    '丶',
    '点',
    'diǎn',
    '💧',
    'M 45 30 C 50 39 56 51 61 61',
    [{ id: 1, x: 45, y: 30, angle: 58 }],
    '像一滴小水珠，轻轻落下来'
  ),
];

const TWO = createHanziWritingItem(
  '二',
  '二',
  'èr',
  '✌️',
  'M 30 34 L 70 34 M 20 70 L 80 70',
  [
    { id: 1, x: 30, y: 34, angle: 0 },
    { id: 2, x: 20, y: 70, angle: 0 },
  ],
  '两座小桥，上面短，下面长'
);

const THREE = createHanziWritingItem(
  '三',
  '三',
  'sān',
  '🐟',
  'M 32 25 L 68 25 M 28 50 L 72 50 M 18 76 L 82 76',
  [
    { id: 1, x: 32, y: 25, angle: 0 },
    { id: 2, x: 28, y: 50, angle: 0 },
    { id: 3, x: 18, y: 76, angle: 0 },
  ],
  '三条小线，从上到下排好队'
);

const FOUR = createHanziWritingItem(
  '四',
  '四',
  'sì',
  '🪟',
  'M 20 23 C 21 40 21 63 22 82 M 24 24 C 41 21 62 22 78 25 C 82 26 83 31 82 37 L 76 81 M 45 39 C 44 50 39 62 32 70 M 59 38 L 58 59 C 58 66 63 68 72 67 M 24 81 C 42 79 62 80 76 80',
  [
    { id: 1, x: 20, y: 23, angle: 88 },
    { id: 2, x: 24, y: 24, angle: -4 },
    { id: 3, x: 45, y: 39, angle: 108 },
    { id: 4, x: 59, y: 38, angle: 90 },
    { id: 5, x: 24, y: 81, angle: -2 },
  ],
  '四有五笔：竖、横折、撇、竖弯、横'
);

const FIVE = createHanziWritingItem(
  '五',
  '五',
  'wǔ',
  '🖐️',
  'M 25 24 C 42 22 61 24 78 27 M 44 27 C 43 42 40 62 36 80 M 25 52 C 41 50 58 52 72 54 L 66 80 M 16 84 C 36 80 61 83 84 84',
  [
    { id: 1, x: 25, y: 24, angle: -2 },
    { id: 2, x: 44, y: 27, angle: 94 },
    { id: 3, x: 25, y: 52, angle: -2 },
    { id: 4, x: 16, y: 84, angle: -3 },
  ],
  '五有四笔：横、竖、横折、横'
);

const SIX = createHanziWritingItem(
  '六',
  '六',
  'liù',
  '🎲',
  'M 48 17 L 53 29 M 22 38 L 80 38 M 43 52 C 38 64 31 74 22 81 M 60 52 C 67 62 74 72 82 80',
  [
    { id: 1, x: 48, y: 17, angle: 65 },
    { id: 2, x: 22, y: 38, angle: 0 },
    { id: 3, x: 43, y: 52, angle: 115 },
    { id: 4, x: 60, y: 52, angle: 48 },
  ],
  '六像小屋顶下，两只脚分开站'
);

const SEVEN = createHanziWritingItem(
  '七',
  '七',
  'qī',
  '🌈',
  'M 20 48 L 80 42 M 52 18 L 48 72 C 47 84 66 86 78 75',
  [
    { id: 1, x: 20, y: 48, angle: -6 },
    { id: 2, x: 52, y: 18, angle: 94 },
  ],
  '七像一把弯弯的小雨伞'
);

const EIGHT = createHanziWritingItem(
  '八',
  '八',
  'bā',
  '🐙',
  'M 44 25 C 40 47 31 68 19 82 M 58 25 C 63 49 72 69 83 82',
  [
    { id: 1, x: 44, y: 25, angle: 112 },
    { id: 2, x: 58, y: 25, angle: 65 },
  ],
  '八像两条小路，向两边分开'
);

const NINE = createHanziWritingItem(
  '九',
  '九',
  'jiǔ',
  '🎈',
  'M 54 18 C 51 42 41 66 24 80 M 31 42 L 72 42 L 67 69 C 64 84 75 88 82 78',
  [
    { id: 1, x: 54, y: 18, angle: 105 },
    { id: 2, x: 31, y: 42, angle: 0 },
  ],
  '九像一只弯弯的小钩子'
);

const TEN = createHanziWritingItem(
  '十',
  '十',
  'shí',
  '➕',
  'M 20 50 L 80 50 M 50 18 L 50 82',
  [
    { id: 1, x: 20, y: 50, angle: 0 },
    { id: 2, x: 50, y: 18, angle: 90 },
  ],
  '先过小桥，再让小树站直'
);

export const HANZI_NUMBER_CHARACTERS: HanziWritingItem[] = [
  HANZI_BASIC_STROKES[0],
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
];

const PERSON = createHanziWritingItem(
  '人',
  '人',
  'rén',
  '🧒',
  'M 52 18 C 49 43 38 66 22 82 M 53 38 C 61 58 70 72 83 82',
  [
    { id: 1, x: 52, y: 18, angle: 108 },
    { id: 2, x: 53, y: 38, angle: 55 },
  ],
  '一撇一捺，像两条腿稳稳站好'
);

const MOUTH = createHanziWritingItem(
  '口',
  '口',
  'kǒu',
  '👄',
  'M 24 24 L 24 80 M 24 24 L 76 24 L 76 80 M 24 80 L 76 80',
  [
    { id: 1, x: 24, y: 24, angle: 90, hintX: 18, hintY: 33 },
    { id: 2, x: 24, y: 24, angle: 0, hintX: 31, hintY: 17 },
    { id: 3, x: 24, y: 80, angle: 0 },
  ],
  '口像一个方方的小嘴巴'
);

const BIG = createHanziWritingItem(
  '大',
  '大',
  'dà',
  '🐋',
  'M 20 44 L 80 44 M 52 18 C 50 44 40 67 22 82 M 51 43 C 59 61 70 74 83 82',
  [
    { id: 1, x: 20, y: 44, angle: 0 },
    { id: 2, x: 52, y: 18, angle: 105 },
    { id: 3, x: 51, y: 43, angle: 55 },
  ],
  '张开双手，变成大大的大'
);

const SMALL = createHanziWritingItem(
  '小',
  '小',
  'xiǎo',
  '🐜',
  'M 50 18 L 50 75 C 50 84 42 86 35 80 M 35 48 C 30 60 24 69 18 76 M 65 47 C 72 57 78 66 82 75',
  [
    { id: 1, x: 50, y: 18, angle: 90 },
    { id: 2, x: 35, y: 48, angle: 120 },
    { id: 3, x: 65, y: 47, angle: 50 },
  ],
  '中间站好，两边是小小的手'
);

const UP = createHanziWritingItem(
  '上',
  '上',
  'shàng',
  '⬆️',
  'M 50 18 L 50 76 M 50 48 L 76 48 M 20 78 L 82 78',
  [
    { id: 1, x: 50, y: 18, angle: 90 },
    { id: 2, x: 50, y: 48, angle: 0 },
    { id: 3, x: 20, y: 78, angle: 0 },
  ],
  '小竖站在横线上，向上看'
);

const DOWN = createHanziWritingItem(
  '下',
  '下',
  'xià',
  '⬇️',
  'M 20 22 L 82 22 M 50 22 L 50 82 M 50 52 L 72 68',
  [
    { id: 1, x: 20, y: 22, angle: 0 },
    { id: 2, x: 50, y: 22, angle: 90 },
    { id: 3, x: 50, y: 52, angle: 35 },
  ],
  '小点跑到横线下面，向下看'
);

const LEFT = createHanziWritingItem(
  '左',
  '左',
  'zuǒ',
  '⬅️',
  'M 22 30 L 78 30 M 50 18 C 45 42 34 60 20 76 M 36 55 L 72 55 M 53 55 L 53 80 M 32 80 L 76 80',
  [
    { id: 1, x: 22, y: 30, angle: 0 },
    { id: 2, x: 50, y: 18, angle: 110 },
    { id: 3, x: 36, y: 55, angle: 0 },
    { id: 4, x: 53, y: 55, angle: 90 },
    { id: 5, x: 32, y: 80, angle: 0 },
  ],
  '左手在这边，向左看'
);

const RIGHT = createHanziWritingItem(
  '右',
  '右',
  'yòu',
  '➡️',
  'M 22 30 L 78 30 M 50 18 C 45 40 34 58 20 72 M 36 51 L 36 81 M 36 51 L 74 51 L 74 81 M 36 81 L 74 81',
  [
    { id: 1, x: 22, y: 30, angle: 0 },
    { id: 2, x: 50, y: 18, angle: 110 },
    { id: 3, x: 36, y: 51, angle: 90, hintX: 31, hintY: 58 },
    { id: 4, x: 36, y: 51, angle: 0, hintX: 43, hintY: 45 },
    { id: 5, x: 36, y: 81, angle: 0 },
  ],
  '右手在这边，向右看'
);

const SUN = createHanziWritingItem(
  '日',
  '日',
  'rì',
  '☀️',
  'M 25 18 L 25 83 M 25 18 L 75 18 L 75 83 M 25 50 L 75 50 M 25 83 L 75 83',
  [
    { id: 1, x: 25, y: 18, angle: 90, hintX: 19, hintY: 27 },
    { id: 2, x: 25, y: 18, angle: 0, hintX: 32, hintY: 12 },
    { id: 3, x: 25, y: 50, angle: 0 },
    { id: 4, x: 25, y: 83, angle: 0 },
  ],
  '日像一扇亮亮的太阳窗'
);

const MOON = createHanziWritingItem(
  '月',
  '月',
  'yuè',
  '🌙',
  'M 30 18 L 30 62 C 30 72 27 80 21 86 M 30 18 L 73 18 L 73 77 C 73 86 65 88 58 82 M 30 43 L 73 43 M 30 63 L 73 63',
  [
    { id: 1, x: 30, y: 18, angle: 90, hintX: 23, hintY: 27 },
    { id: 2, x: 30, y: 18, angle: 0, hintX: 37, hintY: 12 },
    { id: 3, x: 30, y: 43, angle: 0 },
    { id: 4, x: 30, y: 63, angle: 0 },
  ],
  '月像弯弯月亮的小房子'
);

const MOUNTAIN = createHanziWritingItem(
  '山',
  '山',
  'shān',
  '⛰️',
  'M 50 18 L 50 80 M 22 38 L 22 80 L 78 80 M 78 38 L 78 80',
  [
    { id: 1, x: 50, y: 18, angle: 90 },
    { id: 2, x: 22, y: 38, angle: 90 },
    { id: 3, x: 78, y: 38, angle: 90 },
  ],
  '三座山峰站在一起'
);

const WATER = createHanziWritingItem(
  '水',
  '水',
  'shuǐ',
  '💦',
  'M 50 16 L 50 78 C 50 86 42 88 35 81 M 22 42 L 39 50 C 34 65 27 75 18 82 M 78 38 C 70 49 62 57 52 62 M 54 55 C 62 68 72 77 83 82',
  [
    { id: 1, x: 50, y: 16, angle: 90 },
    { id: 2, x: 22, y: 42, angle: 25 },
    { id: 3, x: 78, y: 38, angle: 135 },
    { id: 4, x: 54, y: 55, angle: 45 },
  ],
  '水从中间流开，溅起小水花'
);

const TREE = createHanziWritingItem(
  '木',
  '木',
  'mù',
  '🌳',
  'M 18 42 L 82 42 M 50 18 L 50 84 M 48 45 C 40 61 30 73 18 80 M 52 48 C 61 62 71 73 84 80',
  [
    { id: 1, x: 18, y: 42, angle: 0 },
    { id: 2, x: 50, y: 18, angle: 90 },
    { id: 3, x: 48, y: 45, angle: 125 },
    { id: 4, x: 52, y: 48, angle: 45 },
  ],
  '树干长出来，再伸出两根树枝'
);

const FIRE = createHanziWritingItem(
  '火',
  '火',
  'huǒ',
  '🔥',
  'M 31 31 C 28 44 24 53 19 61 M 67 29 C 72 40 76 49 80 59 M 51 17 C 51 48 44 69 27 84 M 52 52 C 60 68 70 78 83 84',
  [
    { id: 1, x: 31, y: 31, angle: 110 },
    { id: 2, x: 67, y: 29, angle: 60 },
    { id: 3, x: 51, y: 17, angle: 100 },
    { id: 4, x: 52, y: 52, angle: 48 },
  ],
  '两点像火苗，中间的火焰跳起来'
);

export const HANZI_CHARACTER_PAIRS: HanziCharacterPair[] = [
  { id: 'big-small', label: '大和小', icon: '🐋🐜', items: [BIG, SMALL] },
  { id: 'up-down', label: '上和下', icon: '⬆️⬇️', items: [UP, DOWN] },
  { id: 'left-right', label: '左和右', icon: '⬅️➡️', items: [LEFT, RIGHT] },
  { id: 'sun-moon', label: '日和月', icon: '☀️🌙', items: [SUN, MOON] },
  { id: 'mountain-water', label: '山和水', icon: '⛰️💦', items: [MOUNTAIN, WATER] },
  { id: 'tree-fire', label: '木和火', icon: '🌳🔥', items: [TREE, FIRE] },
  { id: 'person-mouth', label: '人和口', icon: '🧒👄', items: [PERSON, MOUTH] },
];

const uniqueItems = new Map<string, HanziWritingItem>();
[
  ...HANZI_BASIC_STROKES,
  ...HANZI_NUMBER_CHARACTERS,
  ...HANZI_CHARACTER_PAIRS.flatMap((pair) => pair.items),
].forEach((item) => uniqueItems.set(item.char, item));

export const HANZI_WRITING_ITEMS = Array.from(uniqueItems.values());
