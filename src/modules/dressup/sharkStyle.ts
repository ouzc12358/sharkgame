import { SharkAccessory, SharkColor, SharkTheme } from '../../../types';

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
];

export const SHARK_ACCESSORY_OPTIONS: Array<{ id: SharkAccessory; label: string; icon: string }> = [
  { id: 'none', label: '无', icon: '🚫' },
  { id: 'hat', label: '帽子', icon: '🎩' },
  { id: 'glasses', label: '墨镜', icon: '🕶️' },
  { id: 'bowtie', label: '领结', icon: '🎀' },
  { id: 'crown', label: '皇冠', icon: '👑' },
  { id: 'headphones', label: '耳机', icon: '🎧' },
  { id: 'scarf', label: '围巾', icon: '🧣' },
  { id: 'redBag', label: '红袋', icon: '🎒' },
  { id: 'greenBag', label: '绿袋', icon: '🟢' },
  { id: 'blueBag', label: '蓝袋', icon: '🔵' },
  { id: 'lightCoralBag', label: '浅珊瑚袋', icon: '🩷' },
];

export const SHARK_THEME_PRESETS: Record<
  SharkTheme,
  { label: string; icon: string; color: SharkColor; accessory: SharkAccessory; summary: string }
> = {
  space: { label: '太空鲨', icon: '🚀', color: 'purple', accessory: 'crown', summary: '星光、闪耀、漂浮' },
  fire: { label: '火焰鲨', icon: '🔥', color: 'orange', accessory: 'scarf', summary: '暖色、速度、活力' },
  diver: { label: '潜水鲨', icon: '🤿', color: 'teal', accessory: 'glasses', summary: '海泡泡、探索、沉浸' },
};

export const SHARK_THEME_ORDER: SharkTheme[] = ['space', 'fire', 'diver'];

export const getThemeUpgradeLevel = (practiceCount: number) =>
  Math.max(0, Math.min(3, Math.floor(practiceCount / 4)));
