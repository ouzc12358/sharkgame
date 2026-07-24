import { LetterConfig } from '../../../types';

export type HanziWritingItem = LetterConfig & {
  pinyin: string;
};

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

export const HANZI_SIMPLE_CHARACTERS: HanziWritingItem[] = [
  createHanziWritingItem(
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
  ),
  createHanziWritingItem(
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
  ),
  createHanziWritingItem(
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
  ),
  createHanziWritingItem(
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
  ),
  createHanziWritingItem(
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
  ),
  createHanziWritingItem(
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
  ),
  createHanziWritingItem(
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
  ),
  createHanziWritingItem(
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
  ),
  createHanziWritingItem(
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
  ),
];

export const HANZI_WRITING_ITEMS = [
  ...HANZI_BASIC_STROKES,
  ...HANZI_SIMPLE_CHARACTERS,
];
