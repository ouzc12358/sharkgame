import {
  DEFAULT_SHARK_ACCESSORIES,
  SharkAccessoryId,
  SharkAccessorySlot,
  SharkColor,
  SharkTheme,
} from '../../../types';

export type AccessoryChallengeHint = {
  category: 'letters' | 'numbers' | 'shapes';
  char: string;
};

export interface SharkAccessoryOption {
  id: SharkAccessoryId;
  slot: SharkAccessorySlot;
  label: string;
  icon: string;
  preferredChallenge?: AccessoryChallengeHint;
  tags?: string[];
}

export const SHARK_PALETTES: Record<
  SharkColor,
  { body: string; stroke: string; belly: string; fin: string }
> = {
  blue: { body: '#0ea5e9', stroke: '#0369a1', belly: '#bae6fd', fin: '#0284c7' },
  pink: { body: '#f472b6', stroke: '#be185d', belly: '#fbcfe8', fin: '#ec4899' },
  green: { body: '#4ade80', stroke: '#15803d', belly: '#bbf7d0', fin: '#22c55e' },
  purple: { body: '#a78bfa', stroke: '#7c3aed', belly: '#ddd6fe', fin: '#8b5cf6' },
  orange: { body: '#fb923c', stroke: '#c2410c', belly: '#fed7aa', fin: '#f97316' },
  teal: { body: '#2dd4bf', stroke: '#0f766e', belly: '#99f6e4', fin: '#14b8a6' },
  yellow: { body: '#facc15', stroke: '#a16207', belly: '#fef08a', fin: '#eab308' },
  coral: { body: '#fda4af', stroke: '#fb7185', belly: '#ffe4e6', fin: '#fbcfe8' },
  mint: { body: '#6ee7b7', stroke: '#047857', belly: '#d1fae5', fin: '#34d399' },
  sky: { body: '#7dd3fc', stroke: '#0369a1', belly: '#e0f2fe', fin: '#38bdf8' },
  peach: { body: '#fdba74', stroke: '#c2410c', belly: '#ffedd5', fin: '#fb923c' },
  violet: { body: '#c4b5fd', stroke: '#6d28d9', belly: '#ede9fe', fin: '#a78bfa' },
};

export const SHARK_COLOR_OPTIONS: SharkColor[] = [
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
];

const noneOption = (slot: SharkAccessorySlot): SharkAccessoryOption => ({
  id: 'none',
  slot,
  label: '无',
  icon: '🚫',
});

export const SHARK_ACCESSORY_OPTIONS_BY_SLOT: Record<SharkAccessorySlot, SharkAccessoryOption[]> = {
  hat: [
    noneOption('hat'),
    { id: 'topHat', slot: 'hat', label: '高帽', icon: '🎩', preferredChallenge: { category: 'letters', char: 'H' } },
    { id: 'crown', slot: 'hat', label: '皇冠', icon: '👑', preferredChallenge: { category: 'letters', char: 'C' } },
    { id: 'helmet', slot: 'hat', label: '头盔', icon: '⛑️', preferredChallenge: { category: 'letters', char: 'H' } },
    { id: 'beanie', slot: 'hat', label: '毛线帽', icon: '🧢', preferredChallenge: { category: 'letters', char: 'B' } },
    { id: 'rainHat', slot: 'hat', label: '雨帽', icon: '☔', preferredChallenge: { category: 'letters', char: 'R' } },
  ],
  clothes: [
    noneOption('clothes'),
    { id: 'hoodie', slot: 'clothes', label: '连帽衫', icon: '🧥', preferredChallenge: { category: 'letters', char: 'H' } },
    { id: 'tshirt', slot: 'clothes', label: 'T恤', icon: '👕', preferredChallenge: { category: 'letters', char: 'T' } },
    { id: 'jacket', slot: 'clothes', label: '夹克', icon: '🧥', preferredChallenge: { category: 'letters', char: 'J' } },
    { id: 'armor', slot: 'clothes', label: '护甲', icon: '🛡️', preferredChallenge: { category: 'letters', char: 'A' } },
    { id: 'raincoat', slot: 'clothes', label: '雨衣', icon: '🦺', preferredChallenge: { category: 'letters', char: 'R' } },
  ],
  shoes: [
    noneOption('shoes'),
    { id: 'sneakers', slot: 'shoes', label: '运动鞋', icon: '👟', preferredChallenge: { category: 'letters', char: 'S' } },
    { id: 'flippers', slot: 'shoes', label: '脚蹼', icon: '🩴', preferredChallenge: { category: 'letters', char: 'F' } },
    { id: 'boots', slot: 'shoes', label: '雨靴', icon: '🥾', preferredChallenge: { category: 'letters', char: 'B' } },
    { id: 'rollerSkates', slot: 'shoes', label: '轮滑鞋', icon: '🛼', preferredChallenge: { category: 'numbers', char: '8' } },
  ],
  item: [
    noneOption('item'),
    { id: 'board', slot: 'item', label: '滑板', icon: '🛹', preferredChallenge: { category: 'letters', char: 'B' } },
    { id: 'book', slot: 'item', label: '绘本', icon: '📘', preferredChallenge: { category: 'letters', char: 'B' } },
    { id: 'starWand', slot: 'item', label: '星星棒', icon: '🪄', preferredChallenge: { category: 'shapes', char: 'star' } },
    { id: 'backpackRed', slot: 'item', label: '红袋', icon: '🎒', preferredChallenge: { category: 'numbers', char: '5' } },
    { id: 'backpackGreen', slot: 'item', label: '绿袋', icon: '🟢', preferredChallenge: { category: 'letters', char: 'G' } },
    { id: 'backpackBlue', slot: 'item', label: '蓝袋', icon: '🔵', preferredChallenge: { category: 'letters', char: 'B' } },
    { id: 'backpackCoral', slot: 'item', label: '浅珊瑚袋', icon: '🩷', preferredChallenge: { category: 'letters', char: 'C' } },
  ],
  face: [
    noneOption('face'),
    { id: 'sunglasses', slot: 'face', label: '墨镜', icon: '🕶️', preferredChallenge: { category: 'letters', char: 'S' } },
    { id: 'glasses', slot: 'face', label: '圆眼镜', icon: '🥽', preferredChallenge: { category: 'letters', char: 'G' } },
    { id: 'monocle', slot: 'face', label: '单片镜', icon: '🧐', preferredChallenge: { category: 'numbers', char: '1' } },
    { id: 'mask', slot: 'face', label: '面罩', icon: '😷', preferredChallenge: { category: 'letters', char: 'M' } },
  ],
  neck: [
    noneOption('neck'),
    { id: 'bowtie', slot: 'neck', label: '领结', icon: '🎀', preferredChallenge: { category: 'letters', char: 'B' } },
    { id: 'scarf', slot: 'neck', label: '围巾', icon: '🧣', preferredChallenge: { category: 'letters', char: 'S' } },
    { id: 'medal', slot: 'neck', label: '奖牌', icon: '🏅', preferredChallenge: { category: 'numbers', char: '1' } },
  ],
};

export const SHARK_ACCESSORY_SLOT_ORDER: SharkAccessorySlot[] = [
  'hat',
  'clothes',
  'shoes',
  'item',
  'face',
  'neck',
];

export const SHARK_ACCESSORY_SLOT_LABELS: Record<SharkAccessorySlot, string> = {
  hat: '帽子',
  clothes: '衣服',
  shoes: '鞋子',
  item: '物品',
  face: '面部',
  neck: '颈部',
};

export const SHARK_THEME_PRESETS: Record<
  SharkTheme,
  {
    label: string;
    icon: string;
    color: SharkColor;
    accessories: Partial<Record<SharkAccessorySlot, SharkAccessoryId | 'none'>>;
    summary: string;
  }
> = {
  space: {
    label: '太空鲨',
    icon: '🚀',
    color: 'violet',
    accessories: { hat: 'helmet', item: 'starWand', neck: 'medal' },
    summary: '星光、闪耀、漂浮',
  },
  fire: {
    label: '火焰鲨',
    icon: '🔥',
    color: 'orange',
    accessories: { clothes: 'jacket', neck: 'scarf', shoes: 'boots' },
    summary: '暖色、速度、活力',
  },
  diver: {
    label: '潜水鲨',
    icon: '🤿',
    color: 'teal',
    accessories: { face: 'glasses', shoes: 'flippers', item: 'book' },
    summary: '海泡泡、探索、沉浸',
  },
  skate: {
    label: '滑板鲨',
    icon: '🛹',
    color: 'blue',
    accessories: { item: 'board', shoes: 'rollerSkates', hat: 'beanie' },
    summary: '滑行、跳跃、潮流',
  },
};

export const SHARK_THEME_ORDER: SharkTheme[] = ['space', 'fire', 'diver', 'skate'];

export const createDefaultAccessories = (
  overrides?: Partial<Record<SharkAccessorySlot, SharkAccessoryId | 'none'>>
): Record<SharkAccessorySlot, SharkAccessoryId | 'none'> => ({
  ...DEFAULT_SHARK_ACCESSORIES,
  ...(overrides || {}),
});

export const getThemeUpgradeLevel = (practiceCount: number) =>
  Math.max(0, Math.min(3, Math.floor(practiceCount / 4)));
