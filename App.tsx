
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LETTER_ITEMS, NUMBER_ITEMS, SHAPE_ITEMS } from './constants';
import {
  LetterConfig,
  Point,
  AppView,
  LetterProgress,
  SharkConfig,
  SharkColor,
  SharkAccessory,
  DifficultyMode,
  SharkTheme,
} from './types';
import MissionFlow from './src/components/MissionFlow';
import MissionRitual from './src/components/MissionRitual';
import ParentZone from './src/components/ParentZone';
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
  computeTraceMetrics,
  getDisplayLevels,
  getLatestAttempt,
  loadMetricsStore,
  pickPraiseMessage,
  saveMetricsStore,
  TraceAttempt,
  TraceMetricLevels,
  TraceMetricsStore,
} from './src/logic/metrics';

// --- Sound Utilities ---
// Defaults to Chinese (zh-CN) for prompts, allows en-US for letters.
const AUDIO_PREFS = {
  ttsEnabled: true,
  soundsEnabled: true,
};

const setAudioPreferenceFlags = (next: { ttsEnabled: boolean; soundsEnabled: boolean }) => {
  AUDIO_PREFS.ttsEnabled = next.ttsEnabled;
  AUDIO_PREFS.soundsEnabled = next.soundsEnabled;
};

const speak = (text: string, lang: 'en-US' | 'zh-CN' = 'zh-CN', rate = 0.5) => {
  if (!AUDIO_PREFS.ttsEnabled) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate; // Slower speed
    utterance.pitch = 1.0; 
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
};

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

const isNumberItem = (char: string) => /^[0-9]$/.test(char);
const getPracticeItemKey = (
  char: string,
  category: LearningCategory | MissionItem['type']
) => {
  if (category === 'numbers' || category === 'number') return `number:${char}`;
  if (category === 'shapes' || category === 'shape') return `shape:${char}`;
  return `letter:${char}`;
};
const DEFAULT_METRIC_LEVELS: TraceMetricLevels = { follow: 2, smoothness: 2, continuity: 2 };

const speakItemPrimary = (item: LetterConfig) => {
  if (isNumberItem(item.char)) {
    const zhNumber = NUMBER_ZH_MAP[item.char] || item.char;
    speak(`数字${zhNumber}`, 'zh-CN');
    return;
  }
  if (/^[A-Z]$/.test(item.char)) {
    speak(item.char.toLowerCase(), 'en-US');
    return;
  }
  speak(item.word, 'zh-CN');
};

// Simple synthesizer for UI sound effects
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playSound = (type: 'start' | 'end' | 'guide') => {
  if (!AUDIO_PREFS.soundsEnabled) return;
  // Ensure context is running (browsers suspend it until user interaction)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'start') {
    // Soft blip
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'end') {
    // Crisp pop
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'guide') {
    // Gentle guide cue
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.22);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
    osc.start(now);
    osc.stop(now + 0.22);
  }
};

// --- Math Helpers ---
const dist = (p1: Point, p2: Point) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

const getPathPoints = (svgPathString: string, numPoints = 100): Point[] => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', svgPathString);
  const length = path.getTotalLength();
  const points: Point[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const p = path.getPointAtLength((i / numPoints) * length);
    points.push({ x: p.x, y: p.y });
  }
  return points;
};

// Helper to extract stroke start points and directions for guides
const getStrokeGuides = (d: string) => {
  if (!d) return [];
  // Split by Move commands (M or m) to separate strokes
  const segments = d.split(/(?=[Mm])/).filter(s => s.trim().length > 0);

  const rawGuides = segments.map((seg, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', seg);
    
    const len = path.getTotalLength();
    if (len === 0) return null;

    const start = path.getPointAtLength(0);
    // Use a small offset relative to stroke length, but clamp it to avoid going too far
    const offset = Math.min(8, len / 2);
    const end = path.getPointAtLength(offset); 
    
    // Calculate angle in degrees
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
    
    return {
      id: i + 1,
      x: start.x,
      y: start.y,
      angle
    };
  }).filter((g): g is { id: number, x: number, y: number, angle: number } => !!g);

  // Some letters (e.g., K, Y) have multiple strokes starting from the same point.
  // Spread overlapping bubbles so stroke order remains readable.
  return rawGuides.map((guide, index) => {
    const overlapping = rawGuides
      .slice(0, index)
      .filter((g) => dist({ x: g.x, y: g.y }, { x: guide.x, y: guide.y }) < 4).length;

    if (overlapping === 0) return guide;

    const radialAngle = (guide.angle + overlapping * 70) * (Math.PI / 180);
    const offset = 7 * overlapping;
    return {
      ...guide,
      x: Math.max(8, Math.min(92, guide.x + Math.cos(radialAngle) * offset)),
      y: Math.max(8, Math.min(92, guide.y + Math.sin(radialAngle) * offset)),
    };
  });
};

// --- Shark Customization Data ---
const SHARK_PALETTES: Record<SharkColor, { body: string, stroke: string, belly: string, fin: string }> = {
  blue: { body: '#0ea5e9', stroke: '#0369a1', belly: '#bae6fd', fin: '#0284c7' },
  pink: { body: '#f472b6', stroke: '#be185d', belly: '#fbcfe8', fin: '#ec4899' },
  green: { body: '#4ade80', stroke: '#15803d', belly: '#bbf7d0', fin: '#22c55e' },
  purple: { body: '#a78bfa', stroke: '#7c3aed', belly: '#ddd6fe', fin: '#8b5cf6' },
  orange: { body: '#fb923c', stroke: '#c2410c', belly: '#fed7aa', fin: '#f97316' },
  teal: { body: '#2dd4bf', stroke: '#0f766e', belly: '#99f6e4', fin: '#14b8a6' },
  yellow: { body: '#facc15', stroke: '#a16207', belly: '#fef08a', fin: '#eab308' },
  coral: { body: '#fda4af', stroke: '#fb7185', belly: '#ffe4e6', fin: '#fbcfe8' },
};

const SHARK_COLOR_OPTIONS: SharkColor[] = ['blue', 'pink', 'green', 'purple', 'orange', 'teal', 'yellow', 'coral'];
const SHARK_ACCESSORY_OPTIONS: Array<{ id: SharkAccessory; label: string; icon: string }> = [
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

const SHARK_THEME_PRESETS: Record<
  SharkTheme,
  { label: string; icon: string; color: SharkColor; accessory: SharkAccessory; summary: string }
> = {
  space: { label: '太空鲨', icon: '🚀', color: 'purple', accessory: 'crown', summary: '星光、闪耀、漂浮' },
  fire: { label: '火焰鲨', icon: '🔥', color: 'orange', accessory: 'scarf', summary: '暖色、速度、活力' },
  diver: { label: '潜水鲨', icon: '🤿', color: 'teal', accessory: 'glasses', summary: '海泡泡、探索、沉浸' },
};

const SHARK_THEME_ORDER: SharkTheme[] = ['space', 'fire', 'diver'];
const getThemeUpgradeLevel = (practiceCount: number) => Math.max(0, Math.min(3, Math.floor(practiceCount / 4)));

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

const CHILD_STATE_STORAGE_KEY = 'sharkgame.childState.v1';

interface ChildStateSnapshot {
  completedLetters: LetterProgress;
  customImages: Record<string, string>;
  sharkConfig: SharkConfig;
  difficultyMode: DifficultyMode;
  currentTheme: SharkTheme;
  themePracticeCounts: Record<SharkTheme, number>;
  ttsEnabled: boolean;
  soundsEnabled: boolean;
}

const loadChildState = (): ChildStateSnapshot => {
  const defaults: ChildStateSnapshot = {
    completedLetters: {},
    customImages: {},
    sharkConfig: {
      color: SHARK_THEME_PRESETS.diver.color,
      accessory: SHARK_THEME_PRESETS.diver.accessory,
    },
    difficultyMode: 'guide',
    currentTheme: 'diver',
    themePracticeCounts: { space: 0, fire: 0, diver: 0 },
    ttsEnabled: true,
    soundsEnabled: true,
  };
  try {
    const raw = localStorage.getItem(CHILD_STATE_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<ChildStateSnapshot>;
    const parsedMode = parsed.difficultyMode;
    const safeMode: DifficultyMode =
      parsedMode === 'guide' || parsedMode === 'practice' || parsedMode === 'challenge'
        ? parsedMode
        : 'guide';
    const parsedTheme = parsed.currentTheme;
    const safeTheme: SharkTheme =
      parsedTheme === 'space' || parsedTheme === 'fire' || parsedTheme === 'diver' ? parsedTheme : 'diver';
    const parsedCounts = parsed.themePracticeCounts;
    const safeCounts: Record<SharkTheme, number> = {
      space: Math.max(0, parsedCounts?.space || 0),
      fire: Math.max(0, parsedCounts?.fire || 0),
      diver: Math.max(0, parsedCounts?.diver || 0),
    };
    return {
      completedLetters: parsed.completedLetters || {},
      customImages: parsed.customImages || {},
      sharkConfig:
        parsed.sharkConfig || {
          color: SHARK_THEME_PRESETS[safeTheme].color,
          accessory: SHARK_THEME_PRESETS[safeTheme].accessory,
        },
      difficultyMode: safeMode,
      currentTheme: safeTheme,
      themePracticeCounts: safeCounts,
      ttsEnabled: parsed.ttsEnabled !== false,
      soundsEnabled: parsed.soundsEnabled !== false,
    };
  } catch {
    return defaults;
  }
};

const saveChildState = (snapshot: ChildStateSnapshot) => {
  localStorage.setItem(CHILD_STATE_STORAGE_KEY, JSON.stringify(snapshot));
};

const DIFFICULTY_CONFIG: Record<
  DifficultyMode,
  { snapDistance: number; returnDistance: number; successCoverage: number; successFollow: number }
> = {
  guide: { snapDistance: 12, returnDistance: 18, successCoverage: 0.82, successFollow: 0.24 },
  practice: { snapDistance: 8, returnDistance: 14, successCoverage: 0.86, successFollow: 0.31 },
  challenge: { snapDistance: 4, returnDistance: 10, successCoverage: 0.9, successFollow: 0.38 },
};

// --- Components ---

// 1. Friendly Shark SVG Component
const FriendlyShark: React.FC<{ className?: string, config?: SharkConfig, theme?: SharkTheme, upgradeLevel?: number }> = ({
  className,
  config,
  theme = 'diver',
  upgradeLevel = 0,
}) => {
  const { color, accessory } = config || { color: 'blue', accessory: 'none' };
  const palette = SHARK_PALETTES[color];

  return (
    <svg viewBox="0 0 200 160" className={className} style={{ overflow: 'visible' }}>
      <g className="animate-float">
        {/* Tail */}
        <path d="M 160 80 Q 170 80 190 30 L 182 80 L 175 125 Q 165 90 160 80" 
              fill={palette.body} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" />
        {/* Body */}
        <path d="M 30 85 Q 30 35 110 35 Q 160 35 160 80 Q 160 135 90 135 Q 30 135 30 85 Z" 
              fill={palette.body} stroke={palette.stroke} strokeWidth="3" />
        {/* Belly */}
        <path d="M 35 95 Q 90 130 145 105 Q 100 130 35 95" 
              fill={palette.belly} opacity="0.6" />
        {/* Dorsal Fin */}
        <path d="M 95 40 L 115 5 Q 120 30 140 50" 
              fill={palette.body} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" />
        {/* Pectoral Fin */}
        <path d="M 105 95 Q 95 135 70 145 Q 115 125 130 105" 
              fill={palette.fin} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" 
              className="animate-[bounce_2s_infinite]" />
        {/* Gills */}
        <path d="M 130 70 Q 125 80 130 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M 140 70 Q 135 80 140 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M 150 70 Q 145 80 150 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        {/* Eyes */}
        <g transform="translate(55, 65)">
           <circle r="13" fill="white" stroke="#0c4a6e" strokeWidth="2" />
           <circle r="5" fill="black" cx="3">
              <animate attributeName="cx" values="3;6;3" dur="4s" repeatCount="indefinite" />
           </circle>
           <path d="M -10 -18 Q 0 -25 10 -18" fill="none" stroke="#0c4a6e" strokeWidth="2" opacity="0.6"/>
        </g>
        {/* Mouth */}
        <path d="M 40 95 Q 60 110 80 95" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <path d="M 75 102 L 78 107 L 81 100" fill="white" stroke="none" />

        {theme === 'space' && (
          <>
            <circle cx="20" cy="28" r="2.2" fill="#e0e7ff" />
            <circle cx="38" cy="18" r="1.6" fill="#c4b5fd" />
            <circle cx="26" cy="40" r="1.5" fill="#fdf2f8" />
          </>
        )}
        {theme === 'fire' && (
          <g opacity="0.78">
            <path d="M 168 72 Q 178 62 188 70 Q 182 70 178 80 Z" fill="#fb923c" />
            <path d="M 170 88 Q 180 78 188 88 Q 182 88 176 98 Z" fill="#f97316" />
          </g>
        )}
        {theme === 'diver' && (
          <g opacity="0.75">
            <circle cx="22" cy="24" r="3.5" fill="#67e8f9" />
            <circle cx="14" cy="34" r="2.5" fill="#a5f3fc" />
          </g>
        )}

        {upgradeLevel >= 1 && (
          <path d="M 42 58 Q 88 44 132 62" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
        )}
        {upgradeLevel >= 2 && (
          <g opacity="0.8">
            <circle cx="175" cy="54" r="3" fill="#bae6fd" />
            <circle cx="182" cy="68" r="2.2" fill="#dbeafe" />
            <circle cx="174" cy="83" r="2.4" fill="#bfdbfe" />
          </g>
        )}
        {upgradeLevel >= 3 && (
          <g transform="translate(150, 42)">
            <circle r="9" fill="#fef08a" opacity="0.9" />
            <path d="M -5 0 L 5 0 M 0 -5 L 0 5" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
        
        {/* Accessories */}
        {accessory === 'hat' && (
          <g transform="translate(90, 15) rotate(-10)">
            <path d="M 0 20 L 40 20 L 20 -20 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <circle cx="20" cy="-20" r="5" fill="#ef4444" />
            <path d="M 0 20 Q 20 25 40 20" fill="none" stroke="#d97706" strokeWidth="2" />
          </g>
        )}
        {accessory === 'glasses' && (
          <g transform="translate(58, 65)">
            <circle cx="-5" cy="0" r="15" fill="#1f2937" opacity="0.8" />
            <circle cx="25" cy="0" r="15" fill="#1f2937" opacity="0.8" />
            <line x1="10" y1="0" x2="10" y2="0" stroke="#1f2937" strokeWidth="3" />
            <path d="M 10 0 L 10 0" stroke="#1f2937" strokeWidth="2" />
          </g>
        )}
        {accessory === 'bowtie' && (
          <g transform="translate(60, 115) rotate(10)">
            <path d="M 0 0 L -10 -10 L -10 10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <path d="M 0 0 L 10 -10 L 10 10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <circle cx="0" cy="0" r="3" fill="#b91c1c" />
          </g>
        )}
        {accessory === 'crown' && (
          <g transform="translate(88, 8) rotate(-8)">
            <path d="M 0 20 L 8 5 L 16 20 L 24 5 L 32 20 L 40 5 L 48 20 Z" fill="#facc15" stroke="#b45309" strokeWidth="2" />
            <rect x="0" y="20" width="48" height="8" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
            <circle cx="8" cy="5" r="2" fill="#ef4444" />
            <circle cx="24" cy="5" r="2" fill="#60a5fa" />
            <circle cx="40" cy="5" r="2" fill="#22c55e" />
          </g>
        )}
        {accessory === 'headphones' && (
          <g transform="translate(55, 52)">
            <path d="M -18 5 C -18 -20 38 -20 38 5" fill="none" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
            <rect x="-23" y="0" width="10" height="20" rx="5" fill="#374151" />
            <rect x="33" y="0" width="10" height="20" rx="5" fill="#374151" />
            <rect x="-20" y="4" width="4" height="12" rx="2" fill="#93c5fd" />
            <rect x="36" y="4" width="4" height="12" rx="2" fill="#93c5fd" />
          </g>
        )}
        {accessory === 'scarf' && (
          <g transform="translate(72, 108) rotate(6)">
            <path d="M -28 -6 Q -8 -14 12 -8 Q 24 -4 30 4 Q 20 16 -4 18 Q -20 18 -30 8 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
            <path d="M 20 10 L 30 34 L 14 28 L 10 45 L 2 24 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          </g>
        )}
        {accessory === 'redBag' && (
          <g transform="translate(98, 95) rotate(8)">
            <path d="M -8 -6 Q 5 -16 18 -6" fill="none" stroke="#9f1239" strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-6" width="34" height="28" rx="6" fill="#f43f5e" stroke="#9f1239" strokeWidth="2.5" />
            <rect x="-10" y="-2" width="26" height="8" rx="3" fill="#fb7185" opacity="0.75" />
            <circle cx="3" cy="9" r="2" fill="#881337" />
          </g>
        )}
        {accessory === 'greenBag' && (
          <g transform="translate(98, 95) rotate(8)">
            <path d="M -8 -6 Q 5 -16 18 -6" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-6" width="34" height="28" rx="6" fill="#22c55e" stroke="#166534" strokeWidth="2.5" />
            <rect x="-10" y="-2" width="26" height="8" rx="3" fill="#4ade80" opacity="0.7" />
            <circle cx="3" cy="9" r="2" fill="#14532d" />
          </g>
        )}
        {accessory === 'blueBag' && (
          <g transform="translate(98, 95) rotate(8)">
            <path d="M -8 -6 Q 5 -16 18 -6" fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-6" width="34" height="28" rx="6" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2.5" />
            <rect x="-10" y="-2" width="26" height="8" rx="3" fill="#93c5fd" opacity="0.8" />
            <circle cx="3" cy="9" r="2" fill="#1e3a8a" />
          </g>
        )}
        {accessory === 'lightCoralBag' && (
          <g transform="translate(98, 95) rotate(8)">
            <path d="M -8 -6 Q 5 -16 18 -6" fill="none" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-6" width="34" height="28" rx="6" fill="#fda4af" stroke="#fb7185" strokeWidth="2.5" />
            <rect x="-10" y="-2" width="26" height="8" rx="3" fill="#fecdd3" opacity="0.85" />
            <circle cx="3" cy="9" r="2" fill="#e11d48" />
          </g>
        )}
      </g>
    </svg>
  );
};

// 2. Intro Screen
const IntroScreen: React.FC<{
  onStart: () => void,
  sharkConfig: SharkConfig,
  theme: SharkTheme,
  themeUpgradeLevel: number
}> = ({ onStart, sharkConfig, theme, themeUpgradeLevel }) => {
  const handleStart = () => {
    speak("欢迎来到鲨鱼字母数字乐园！", 'zh-CN');
    onStart();
  };

  return (
    <div className="h-full bg-ocean-500 flex flex-col items-center justify-center overflow-hidden relative selection:bg-none">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-10 text-4xl animate-bubble-rise opacity-0" style={{animationDelay: '0s'}}>🫧</div>
        <div className="absolute bottom-0 left-1/4 text-2xl animate-bubble-rise opacity-0" style={{animationDelay: '1.5s'}}>🫧</div>
        <div className="absolute bottom-0 right-1/4 text-5xl animate-bubble-rise opacity-0" style={{animationDelay: '0.5s'}}>🫧</div>
        <div className="absolute bottom-0 right-10 text-3xl animate-bubble-rise opacity-0" style={{animationDelay: '2s'}}>🫧</div>
      </div>

      <div className="z-10 flex flex-col items-center text-center p-4">
        <div className="w-64 h-48 mb-4 cursor-pointer transform transition-transform active:scale-95 flex items-center justify-center" onClick={() => speak("我是鲨鱼宝宝！", 'zh-CN')}>
          <FriendlyShark className="w-full h-full drop-shadow-2xl" config={sharkConfig} theme={theme} upgradeLevel={themeUpgradeLevel} />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-4 tracking-wide">
          Sharky Letters & Numbers
        </h1>
        <p className="text-ocean-100 text-xl md:text-3xl font-bold mb-12 opacity-90">
          Ready to learn?
        </p>

        <button 
          onClick={handleStart}
          className="bg-sand text-orange-600 text-3xl md:text-5xl font-black py-6 px-20 rounded-full shadow-[0_8px_0_rgb(234,88,12)] 
                     hover:bg-white hover:scale-105 transition-all duration-300 active:scale-95 active:shadow-none active:translate-y-2"
        >
          开始游戏
        </button>
      </div>
    </div>
  );
};

// 3. Settings Modal
const SettingsModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  config: SharkConfig, 
  onChange: (c: SharkConfig) => void,
  theme: SharkTheme,
  themeUpgradeLevel: number,
  themePracticeCount: number,
  onApplyTheme: (theme: SharkTheme) => void
}> = ({
  isOpen,
  onClose,
  config,
  onChange,
  theme,
  themeUpgradeLevel,
  themePracticeCount,
  onApplyTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-2 md:p-4 overflow-y-auto overscroll-contain">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-auto my-1 md:my-3 max-h-[calc(100dvh-0.5rem)] md:max-h-[calc(100dvh-1.5rem)] flex flex-col animate-bounce-gentle"
        style={{ animation: 'none' }}
      >
        <div className="flex-none flex justify-between items-center px-4 md:px-6 py-4 border-b border-gray-100 bg-white rounded-t-3xl sticky top-0 z-10">
          <h2 className="text-2xl md:text-3xl font-black text-ocean-900">装扮鲨鱼</h2>
          <button onClick={onClose} className="text-2xl bg-gray-200 rounded-full w-10 h-10 hover:bg-gray-300">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          <div className="flex justify-center mb-4 md:mb-6 bg-ocean-100 rounded-2xl p-3 md:p-4">
            <div className="w-44 h-32 md:w-48 md:h-32">
              <FriendlyShark className="w-full h-full" config={config} theme={theme} upgradeLevel={themeUpgradeLevel} />
            </div>
          </div>

          <div className="space-y-5 md:space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-700 mb-2 md:mb-3">主题表达 (Theme)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SHARK_THEME_ORDER.map((id) => {
                  const preset = SHARK_THEME_PRESETS[id];
                  return (
                    <button
                      key={id}
                      onClick={() => onApplyTheme(id)}
                      className={`rounded-xl border-2 p-3 text-left transition-all active:scale-95 ${
                        theme === id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 hover:border-ocean-300'
                      }`}
                    >
                      <p className="text-sm md:text-base font-black text-ocean-900">
                        {preset.icon} {preset.label}
                      </p>
                      <p className="text-[11px] text-gray-500 font-bold mt-1">{preset.summary}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">练习会提升主题效果：渐变 → 泡泡尾迹 → 闪光徽章</p>
              <p className="text-xs text-ocean-700 mt-1 font-bold">
                当前主题练习 {themePracticeCount} 次，升级层级 {themeUpgradeLevel + 1}
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-700 mb-2 md:mb-3">颜色 (Color)</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 md:gap-3 justify-items-center">
                {SHARK_COLOR_OPTIONS.map((c) => {
                  return (
                    <button
                      key={c}
                      title={c}
                      onClick={() => onChange({ ...config, color: c })}
                      className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full border-4 shadow-sm transform transition-transform active:scale-90 ${config.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: SHARK_PALETTES[c].body }}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-700 mb-2 md:mb-3">装饰 (Accessory)</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 md:gap-3">
                {SHARK_ACCESSORY_OPTIONS.map((item) => {
                  return (
                    <button
                      key={item.id}
                      title={item.label}
                      onClick={() => onChange({ ...config, accessory: item.id })}
                      className={`relative flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border-2 transition-all min-h-[72px] md:min-h-[84px] ${config.accessory === item.id ? 'bg-ocean-100 border-ocean-500' : 'border-gray-200 hover:border-ocean-300'}`}
                    >
                      <span className="text-xl md:text-2xl mb-1">{item.icon}</span>
                      <span className="text-[11px] md:text-xs font-bold text-gray-600 leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-none px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 bg-white rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full md:w-auto md:min-w-[180px] block mx-auto bg-ocean-500 text-white text-lg md:text-xl font-bold py-3 px-12 rounded-full shadow-lg hover:bg-ocean-600 active:translate-y-1 active:shadow-none"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Confetti Component
const Confetti: React.FC = () => {
  const particles = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.2, 
    duration: Math.random() * 2 + 1.5,
    color: ['#fb7185', '#fcd34d', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'][Math.floor(Math.random() * 6)]
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 md:w-4 md:h-4 rounded-sm shadow-sm opacity-90"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`
          }}
        />
      ))}
    </div>
  );
};

// 5. Shark Reward Animation
// Enhanced to support multiple random animation types
const SharkReward: React.FC<{ sharkConfig: SharkConfig; theme: SharkTheme; themeUpgradeLevel: number }> = ({
  sharkConfig,
  theme,
  themeUpgradeLevel,
}) => {
  const [animationType, setAnimationType] = useState('celebration-swim');

  useEffect(() => {
    speak("太棒了！", 'zh-CN');
    const types = [
      'celebration-swim', 
      'celebration-spin', 
      'celebration-jump',
      'celebration-zigzag'
    ];
    // Randomly select an animation
    setAnimationType(types[Math.floor(Math.random() * types.length)]);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-hidden">
      <style>{`
        /* Classic Swim */
        @keyframes celebration-swim {
          0% { transform: translate(-100vw, 100px) rotate(-15deg) scale(0.5); opacity: 0; }
          20% { transform: translate(-50vw, 50px) rotate(10deg) scale(0.8); opacity: 1; }
          40% { transform: translate(-5vw, -50px) rotate(-10deg) scale(1.2); }
          50% { transform: translate(0, 0) rotate(0deg) scale(1.5); }
          60% { transform: translate(5vw, -50px) rotate(10deg) scale(1.2); }
          80% { transform: translate(50vw, 50px) rotate(-10deg) scale(0.8); opacity: 1; }
          100% { transform: translate(100vw, 100px) rotate(15deg) scale(0.5); opacity: 0; }
        }
        /* Happy Spin */
        @keyframes celebration-spin {
          0% { transform: scale(0); opacity: 0; }
          30% { transform: scale(1.2) rotate(0deg); opacity: 1; }
          50% { transform: scale(1) rotate(180deg); }
          70% { transform: scale(1.2) rotate(360deg); }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        /* Jump */
        @keyframes celebration-jump {
          0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
          40% { transform: translateY(0) scale(1.5); opacity: 1; }
          50% { transform: translateY(-20px) scale(1.6); }
          60% { transform: translateY(0) scale(1.5); }
          100% { transform: translateY(100vh) scale(0.5); opacity: 0; }
        }
        /* Zigzag */
        @keyframes celebration-zigzag {
          0% { transform: translate(-100vw, 0) scale(0.8); }
          25% { transform: translate(-50vw, -100px) rotate(15deg) scale(1); }
          50% { transform: translate(0, 0) rotate(-15deg) scale(1.2); }
          75% { transform: translate(50vw, -100px) rotate(15deg) scale(1); }
          100% { transform: translate(100vw, 0) scale(0.8); }
        }

        @keyframes text-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <Confetti />
      <div 
        className="absolute z-20 w-64 h-64 md:w-96 md:h-96"
        style={{ animation: `${animationType} 3.5s ease-in-out forwards` }}
      >
        <FriendlyShark
          className="w-full h-full drop-shadow-2xl"
          config={sharkConfig}
          theme={theme}
          upgradeLevel={themeUpgradeLevel}
        />
      </div>
      <div 
        className="absolute z-30 text-6xl md:text-8xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
        style={{ animation: 'text-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.5s forwards', opacity: 0, transform: 'scale(0)' }}
      >
        太棒了!
      </div>
    </div>
  );
};

const LOCAL_STICKER_OPTIONS: Array<{ id: string; label: string; src: string }> = [
  { id: 'apple', label: '苹果', src: '/stickers/apple.svg' },
  { id: 'starfish', label: '海星', src: '/stickers/starfish.svg' },
  { id: 'fish', label: '小鱼', src: '/stickers/fish.svg' },
  { id: 'shell', label: '贝壳', src: '/stickers/shell.svg' },
  { id: 'octopus', label: '章鱼', src: '/stickers/octopus.svg' },
  { id: 'rainbow', label: '彩虹', src: '/stickers/rainbow.svg' },
];

// 6. Local Sticker Picker Modal
const ImageGenModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  letter: LetterConfig;
  currentImage: string | null;
  onSave: (img: string) => void;
}> = ({ isOpen, onClose, letter, currentImage, onSave }) => {
  const [selected, setSelected] = useState<string>(currentImage || LOCAL_STICKER_OPTIONS[0].src);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(currentImage || LOCAL_STICKER_OPTIONS[0].src);
  }, [isOpen, currentImage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-ocean-900">贴纸盒</h2>
          <button onClick={onClose} className="text-2xl bg-gray-100 rounded-full w-10 h-10 hover:bg-gray-200">✕</button>
        </div>

        <div className="flex flex-col items-center mb-5">
          <div className="w-44 h-44 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-3 shadow-inner">
            {selected ? (
              <img src={selected} alt={`${letter.word} sticker`} className="w-full h-full object-contain p-3" />
            ) : (
              <span className="text-8xl">{letter.emoji}</span>
            )}
          </div>
          <p className="text-sm font-bold text-gray-500">给 {letter.word} 选一个贴纸吧</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {LOCAL_STICKER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.src)}
              className={`rounded-xl border-2 p-2 bg-white transition-all active:scale-95 ${selected === option.src ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 hover:border-ocean-300'}`}
            >
              <img src={option.src} alt={option.label} className="w-full h-16 object-contain" />
              <span className="text-xs font-bold text-gray-600">{option.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onSave(selected);
            onClose();
          }}
          className="w-full bg-ocean-500 text-white py-3 rounded-xl font-black hover:bg-ocean-600 shadow-md active:scale-95"
        >
          使用贴纸
        </button>
      </div>
    </div>
  );
};


type LearningCategory = 'letters' | 'numbers' | 'shapes';
// 7. Character Grid View
const CharacterGridView: React.FC<{
  title: string;
  items: LetterConfig[];
  progress: LetterProgress;
  customImages: Record<string, string>;
  onSelectLetter: (letter: LetterConfig) => void;
  onBack: () => void;
  onOpenSettings: () => void;
}> = ({ title, items, progress, customImages, onSelectLetter, onBack, onOpenSettings }) => {
  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-3 md:p-5 lg:p-6">
        <div className="flex justify-between items-center mb-5 md:mb-6 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-10 py-2">
          <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            🔙
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">{title}</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 pb-10">
          {items.map((letter) => {
            const isCompleted = progress[letter.char];
            const customImg = customImages[letter.char];

            return (
              <div
                key={letter.char}
                onClick={() => onSelectLetter(letter)}
                className={`
                  relative aspect-square rounded-2xl md:rounded-3xl flex flex-col items-center justify-center cursor-pointer
                  transition-all duration-200 shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none
                  ${isCompleted ? 'bg-sand text-ocean-900 ring-4 ring-yellow-400' : 'bg-white text-gray-700 hover:bg-ocean-100'}
                `}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakItemPrimary(letter);
                  }}
                  className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-8 h-8 md:w-9 md:h-9 bg-ocean-100 rounded-full flex items-center justify-center text-base md:text-lg hover:bg-ocean-200 active:scale-90 transition-transform z-10"
                >
                  🔊
                </button>

                <span className="text-5xl md:text-6xl font-black mb-1 md:mb-2 select-none relative z-0">
                  {letter.char}
                </span>

                {customImg && (
                  <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-gray-200">
                    <img src={customImg} alt="custom" className="w-full h-full object-cover" />
                  </div>
                )}

                {isCompleted && (
                  <div className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 text-2xl md:text-3xl animate-bounce-gentle z-10">
                    🦈
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProgressIcons: React.FC<{ levels: TraceMetricLevels }> = ({ levels }) => {
  const rows: Array<{ icon: string; label: string; level: number }> = [
    { icon: '🧲', label: '贴近', level: levels.follow },
    { icon: '🌊', label: '顺滑', level: levels.smoothness },
    { icon: '🔗', label: '连贯', level: levels.continuity },
  ];

  return (
    <div className="w-full max-w-md bg-ocean-50 rounded-2xl p-3 mb-4">
      <div className="grid grid-cols-3 gap-2">
        {rows.map((row) => (
          <div key={row.label} className="text-center">
            <div className="text-xl">{row.icon}</div>
            <div className="text-xs font-black text-ocean-900 mb-1">{row.label}</div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={`${row.label}-${index}`}
                  className={`w-1.5 h-1.5 rounded-full ${index < row.level ? 'bg-ocean-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 9. Letter Tracing View
const LetterView: React.FC<{ 
  letter: LetterConfig, 
  onBack: () => void, 
  onComplete: () => void,
  sharkConfig: SharkConfig,
  customImage: string | null,
  onUpdateImage: (img: string) => void,
  progressLevels: TraceMetricLevels,
  onAttemptAnalyzed: (attempt: TraceAttempt) => void,
  difficultyMode: DifficultyMode,
  theme: SharkTheme,
  themeUpgradeLevel: number
}> = ({
  letter,
  onBack,
  onComplete,
  sharkConfig,
  customImage,
  onUpdateImage,
  progressLevels,
  onAttemptAnalyzed,
  difficultyMode,
  theme,
  themeUpgradeLevel,
}) => {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDemonstrating, setIsDemonstrating] = useState(true);
  const [guideFlash, setGuideFlash] = useState(false);
  const [helperMessage, setHelperMessage] = useState('请沿着线写');
  const [showLowercase, setShowLowercase] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const supportsCaseToggle = /^[A-Z]$/.test(letter.char);
  const isShapeChallenge = !supportsCaseToggle && !isNumberItem(letter.char);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathPoints = useMemo(() => getPathPoints(letter.svgPath), [letter]);
  // Calculate guides (stroke order indicators)
  const guides = useMemo(() => getStrokeGuides(letter.svgPath), [letter]);
  const difficultyConfig = DIFFICULTY_CONFIG[difficultyMode];
  
  const isDragging = useRef(false);
  const [nextGuideIndex, setNextGuideIndex] = useState(0);
  const [returnBubble, setReturnBubble] = useState<Point | null>(null);

  // Initial demonstration and audio
  useEffect(() => {
    setStrokes([]);
    setCurrentStroke([]);
    setNextGuideIndex(0);
    setReturnBubble(null);
    setHelperMessage(isShapeChallenge ? '从1号起点开始画线' : '请沿着线写');
    setIsDemonstrating(true);
    
    // Audio Sequence: Letter -> Wait -> Word
    speakItemPrimary(letter);
    const wordTimer = setTimeout(() => {
      if (supportsCaseToggle) {
        speak(letter.word, 'en-US');
      } else {
        speak(letter.word, 'zh-CN');
      }
    }, 1500);

    const timer = setTimeout(() => setIsDemonstrating(false), 3500); // Wait for demo animation
    
    return () => {
      clearTimeout(timer);
      clearTimeout(wordTimer);
    };
  }, [letter, isShapeChallenge, supportsCaseToggle]);

  // Handle re-drawing
  const handleReplay = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setNextGuideIndex(0);
    setReturnBubble(null);
    setHelperMessage(isShapeChallenge ? '从1号起点开始画线' : '再试一次，慢慢来');
    setIsDemonstrating(true);
    speakItemPrimary(letter);
    
    setTimeout(() => {
      setIsDemonstrating(false);
    }, 3500);
  };

  // Canvas drawing logic
  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Map to 0-100 coordinate space
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
      t: Date.now(),
    };
  };

  const findNearestPathPoint = (point: Point) => {
    let minDistance = Number.POSITIVE_INFINITY;
    let nearestPoint = pathPoints[0];
    let nearestIndex = 0;
    for (let i = 0; i < pathPoints.length; i++) {
      const candidate = pathPoints[i];
      const d = dist(point, candidate);
      if (d < minDistance) {
        minDistance = d;
        nearestPoint = candidate;
        nearestIndex = i;
      }
    }
    return { point: nearestPoint, index: nearestIndex, distance: minDistance };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDemonstrating) return;
    isDragging.current = true;
    playSound('start'); // Play start sound
    const rawPoint = getCanvasPoint(e);
    const nearest = findNearestPathPoint(rawPoint);
    if (nearest.distance <= difficultyConfig.snapDistance) {
      setNextGuideIndex((prev) => Math.max(prev, nearest.index));
      setCurrentStroke([{ ...nearest.point, t: rawPoint.t }]);
      setReturnBubble(null);
      return;
    }
    if (nearest.distance > difficultyConfig.returnDistance) {
      setReturnBubble(nearest.point);
      setHelperMessage('跟着蓝泡泡回到线条');
    }
    setCurrentStroke([rawPoint]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || isDemonstrating) return;
    e.preventDefault(); // Prevent scrolling while drawing
    const rawPoint = getCanvasPoint(e);
    const nearest = findNearestPathPoint(rawPoint);
    let drawPoint = rawPoint;

    if (nearest.distance <= difficultyConfig.snapDistance) {
      drawPoint = { ...nearest.point, t: rawPoint.t };
      setNextGuideIndex((prev) => Math.max(prev, nearest.index));
      setReturnBubble(null);
    } else if (nearest.distance > difficultyConfig.returnDistance) {
      setReturnBubble(nearest.point);
      setHelperMessage(difficultyMode === 'challenge' ? '自由写也可以，想贴线就跟着蓝泡泡' : '跟着蓝泡泡回到线条');
    } else {
      setReturnBubble(null);
    }

    setCurrentStroke((prev) => [...prev, drawPoint]);
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke([]);
    checkSuccess(newStrokes);
  };

  const checkSuccess = (currentStrokes: Point[][]) => {
    const allUserPoints = currentStrokes.flat();
    if (allUserPoints.length < 10) return;

    const metrics = computeTraceMetrics(currentStrokes, pathPoints);
    const attempt: TraceAttempt = {
      at: Date.now(),
      scores: metrics.scores,
      levels: metrics.levels,
    };
    onAttemptAnalyzed(attempt);
    // Coverage check
    let coveredCount = 0;
    const coverageThreshold = 7; 
    
    for (const targetP of pathPoints) {
      let isCovered = false;
      for (const p of allUserPoints) {
        if (dist(p, targetP) < coverageThreshold) {
          isCovered = true;
          break;
        }
      }
      if (isCovered) coveredCount++;
    }

    const coverage = coveredCount / pathPoints.length;
    const isSuccess =
      coverage > difficultyConfig.successCoverage && metrics.scores.follow > difficultyConfig.successFollow;

    if (isSuccess) {
      playSound('end');
      setHelperMessage('太棒啦，完成啦');
      setReturnBubble(null);
      setTimeout(onComplete, 500);
      return;
    }

    playSound('guide');
    setGuideFlash(true);
    setTimeout(() => setGuideFlash(false), 600);
    if (difficultyMode === 'challenge') {
      setHelperMessage('很棒的尝试，按右上角↺可再来一次');
      speak('很棒的尝试，再来一次会更顺', 'zh-CN', 0.6);
    } else if (coverage > 0.72) {
      setHelperMessage('快完成啦，再把浅灰线连接起来');
      speak('快完成啦，再试一笔', 'zh-CN', 0.62);
    } else {
      setHelperMessage('慢慢来，沿着浅灰线走');
      speak('慢慢来，沿着浅灰线走', 'zh-CN', 0.6);
    }
  };

  return (
    <div className="h-full flex flex-col bg-ocean-500">
      {/* Header - Fixed at top */}
      <div className="flex-none flex justify-between items-center p-4">
        <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
          🔙
        </button>
        <div className="flex gap-4">
          <span className="bg-white/20 px-3 py-2 rounded-xl text-white font-black text-sm flex items-center">
            {difficultyMode === 'guide' ? '引导模式' : difficultyMode === 'practice' ? '练习模式' : '挑战模式'}
          </span>
          {supportsCaseToggle && (
            <button 
               onClick={() => setShowLowercase(!showLowercase)} 
               className={`bg-white/20 px-4 py-2 rounded-xl text-white font-bold text-xl active:scale-95 border-2 ${showLowercase ? 'border-white bg-white/30' : 'border-transparent'}`}
            >
              Aa
            </button>
          )}
          <button onClick={handleReplay} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            ↺
          </button>
        </div>
      </div>

      {/* Main Content - Scrollable if needed, but flex-centered usually */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="min-h-full flex flex-col items-center justify-center p-4">
          
          <div className="bg-white rounded-[3rem] p-6 shadow-2xl flex flex-col items-center w-full max-w-2xl relative">
            {/* Visual Guide Flash Overlay (Anti-scribble feedback) */}
            <div className={`absolute inset-0 rounded-[3rem] border-8 pointer-events-none transition-colors duration-300 ${guideFlash ? 'border-coral animate-pulse' : 'border-transparent'}`}></div>

            <div className="flex items-center gap-8 mb-4">
              <span className="text-8xl md:text-9xl font-black text-ocean-900 select-none">
                {supportsCaseToggle && showLowercase ? `${letter.char} ${letter.char.toLowerCase()}` : letter.char}
              </span>
              <div className="flex flex-col items-center relative group">
                <div className="relative">
                  {customImage ? (
                    <img src={customImage} alt={letter.word} className="w-24 h-24 object-contain animate-bounce-gentle rounded-lg" />
                  ) : (
                    <span className="text-6xl select-none animate-bounce-gentle block">{letter.emoji}</span>
                  )}
                  {/* Magic Wand Button */}
                  <button 
                    onClick={() => setShowMagicModal(true)}
                    className="absolute -bottom-2 -right-2 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 hover:bg-purple-600"
                    title="Customize Image"
                  >
                    ✨
                  </button>
                </div>
                <span className="text-2xl text-gray-500 font-bold mt-2">{letter.word}</span>
              </div>
            </div>

            <ProgressIcons levels={progressLevels} />

            {/* Tracing Area */}
            <div className={`relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] shrink-0 touch-none ${guideFlash ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                   <path id="letterPath" d={letter.svgPath} />
                   <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                   </filter>
                </defs>

                {/* Dashed Background Guide - Mimics worksheet */}
                <use 
                  href="#letterPath" 
                  stroke={guideFlash ? '#fb7185' : '#e5e7eb'} 
                  strokeWidth="12" 
                  strokeDasharray="16 16"
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-colors duration-300"
                />

                {difficultyMode === 'guide' && !isDemonstrating && (
                  <polyline
                    points={pathPoints
                      .slice(nextGuideIndex, Math.min(pathPoints.length, nextGuideIndex + 18))
                      .map((p) => `${p.x},${p.y}`)
                      .join(' ')}
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.95"
                  />
                )}

                {/* Stroke Order Guides (Numbered steps + Arrows) */}
                {!isDemonstrating && guides.map((g) => (
                  <g key={g.id} transform={`translate(${g.x}, ${g.y})`} className="pointer-events-none transition-opacity duration-300 opacity-90">
                    {/* Number Bubble */}
                    <circle r="4" fill="#0ea5e9" stroke="white" strokeWidth="1" className="drop-shadow-sm" />
                    <text 
                      y="1.5" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="white" 
                      fontSize="5" 
                      fontFamily="Varela Round, sans-serif" 
                      fontWeight="bold"
                    >
                      {g.id}
                    </text>
                    
                    {/* Direction Chevron Arrow */}
                    <g transform={`rotate(${g.angle}) translate(9, 0)`}>
                      <path d="M 0 -2 L 3 0 L 0 2" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </g>
                ))}
                
                {/* Demonstration Animation Stroke + Moving Cursor */}
                {isDemonstrating && (
                  <>
                    <use 
                      href="#letterPath" 
                      stroke="#fbbf24" 
                      strokeWidth="12" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="animate-[dash_3.5s_linear_forwards]"
                      strokeDasharray="300"
                      strokeDashoffset="300"
                    />
                    {/* Moving Pencil Icon showing direction */}
                    <circle r="8" fill="#fbbf24" stroke="white" strokeWidth="2" filter="url(#glow)">
                        <animateMotion dur="3.5s" fill="freeze" calcMode="linear">
                           <mpath href="#letterPath" />
                        </animateMotion>
                    </circle>
                  </>
                )}
                
                {/* Render User Strokes */}
                {strokes.map((stroke, i) => (
                  <polyline 
                    key={i} 
                    points={stroke.map(p => `${p.x},${p.y}`).join(' ')} 
                    fill="none" 
                    stroke="#0ea5e9" 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                ))}
                {/* Current Active Stroke */}
                <polyline 
                  points={currentStroke.map(p => `${p.x},${p.y}`).join(' ')} 
                  fill="none" 
                  stroke="#0ea5e9" 
                  strokeWidth="12" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {!isDemonstrating && returnBubble && (
                  <g transform={`translate(${returnBubble.x}, ${returnBubble.y})`}>
                    <circle r="5.6" fill="#38bdf8" stroke="white" strokeWidth="1.5" opacity="0.95" />
                    <path
                      d="M -2 0 L 2 -4 M 2 -4 L 2 2"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
              </svg>

              {/* Interaction Layer */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair opacity-0"
                width={400}
                height={400}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            </div>
            
            {isShapeChallenge && (
              <p className="text-sm text-ocean-600 font-black mb-2">10-20 秒线条小挑战</p>
            )}
            <p className="mt-6 text-gray-400 font-bold text-lg">
              {isDemonstrating ? '看这里！' : helperMessage}
            </p>
            {!isDemonstrating && (
              <p className="text-xs text-gray-400 mt-1">小鲨鱼在陪你慢慢练习</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer / Shark Helper */}
      <div className="flex-none p-4 flex justify-center pointer-events-none">
        <FriendlyShark className="w-24 h-24" config={sharkConfig} theme={theme} upgradeLevel={themeUpgradeLevel} />
      </div>

      <ImageGenModal 
        isOpen={showMagicModal} 
        onClose={() => setShowMagicModal(false)}
        letter={letter}
        currentImage={customImage}
        onSave={(img) => onUpdateImage(img)}
      />
    </div>
  );
};

const ThemeChoiceModal: React.FC<{
  isOpen: boolean;
  currentTheme: SharkTheme;
  themePracticeCounts: Record<SharkTheme, number>;
  onChoose: (theme: SharkTheme) => void;
  onClose: () => void;
}> = ({ isOpen, currentTheme, themePracticeCounts, onChoose, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[72] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black text-ocean-900 mb-2">今天当哪种鲨鱼？</h2>
        <p className="text-sm font-bold text-gray-500 mb-4">选一个喜欢的风格，马上换装</p>
        <div className="grid grid-cols-1 gap-3">
          {SHARK_THEME_ORDER.map((id) => {
            const preset = SHARK_THEME_PRESETS[id];
            const level = getThemeUpgradeLevel(themePracticeCounts[id]);
            return (
              <button
                key={id}
                onClick={() => onChoose(id)}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-95 ${
                  currentTheme === id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-ocean-900">
                    {preset.icon} {preset.label}
                  </span>
                  <span className="text-xs font-black text-ocean-600">升级 {level + 1}</span>
                </div>
                <p className="text-xs font-bold text-gray-500 mt-1">{preset.summary}</p>
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 bg-ocean-100 text-ocean-900 rounded-2xl py-3 font-black active:scale-95"
        >
          稍后再选
        </button>
      </div>
    </div>
  );
};

// 10. Main App
export default function App() {
  const initialChildState = useMemo(() => loadChildState(), []);
  const [view, setView] = useState<AppView>(AppView.INTRO);
  const [activeCategory, setActiveCategory] = useState<LearningCategory>('letters');
  const [currentLetter, setCurrentLetter] = useState<LetterConfig | null>(null);
  const [completedLetters, setCompletedLetters] = useState<LetterProgress>(initialChildState.completedLetters);
  const [showReward, setShowReward] = useState(false);
  const [showMissionRitual, setShowMissionRitual] = useState(false);
  const [showThemeChoice, setShowThemeChoice] = useState(false);
  const [returnViewAfterTrace, setReturnViewAfterTrace] = useState<AppView>(AppView.HOME);
  const [sharkConfig, setSharkConfig] = useState<SharkConfig>(initialChildState.sharkConfig);
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>(initialChildState.difficultyMode);
  const [currentTheme, setCurrentTheme] = useState<SharkTheme>(initialChildState.currentTheme);
  const [themePracticeCounts, setThemePracticeCounts] = useState<Record<SharkTheme, number>>(
    initialChildState.themePracticeCounts
  );
  const [ttsEnabled, setTtsEnabled] = useState(initialChildState.ttsEnabled);
  const [soundsEnabled, setSoundsEnabled] = useState(initialChildState.soundsEnabled);
  const [showSettings, setShowSettings] = useState(false);
  const [showParentZone, setShowParentZone] = useState(false);
  const [customImages, setCustomImages] = useState<Record<string, string>>(initialChildState.customImages);
  const [missionStore, setMissionStore] = useState<MissionStoreState>(() => loadMissionStore());
  const [metricsStore, setMetricsStore] = useState<TraceMetricsStore>(() => loadMetricsStore());
  const traceStartRef = useRef<number>(Date.now());
  const parentHoldTimerRef = useRef<number | null>(null);

  const todayKey = getDateKey();
  const todayMission = useMemo(
    () =>
      buildDailyMission(
        todayKey,
        LETTER_ITEMS.map((item) => item.char),
        NUMBER_ITEMS.map((item) => item.char),
        SHAPE_ITEMS.map((item) => item.char)
      ),
    [todayKey]
  );
  const todayDay = missionStore.days[todayKey];
  const todayPracticedKeys = todayDay?.practicedItemKeys || [];
  const missionDoneCount = todayMission.items.filter((item) =>
    todayPracticedKeys.includes(missionItemKey(item))
  ).length;
  const currentItemKey = currentLetter ? getPracticeItemKey(currentLetter.char, activeCategory) : null;
  const currentProgressLevels = currentItemKey
    ? getDisplayLevels(metricsStore, currentItemKey)
    : DEFAULT_METRIC_LEVELS;
  const currentThemeUpgradeLevel = getThemeUpgradeLevel(themePracticeCounts[currentTheme]);
  const todayMinutes = Math.round(todayDay?.minutesPracticed || 0);
  const todayPracticedItems = (todayDay?.practicedItemKeys || []).map(formatPracticeItemKey);

  const weakestMetricSuggestions = useMemo(() => {
    const attemptsEntries = Object.entries(metricsStore.attempts);
    if (attemptsEntries.length === 0) return [];

    const metricLabel: Record<'follow' | 'smoothness' | 'continuity', string> = {
      follow: '贴近',
      smoothness: '顺滑',
      continuity: '连贯',
    };

    const ranked = attemptsEntries
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
      .filter((item): item is { itemKey: string; weakestMetric: 'follow' | 'smoothness' | 'continuity'; weakestValue: number } => Boolean(item))
      .sort((a, b) => a.weakestValue - b.weakestValue)
      .slice(0, 3);

    return ranked.map((item) => `${formatPracticeItemKey(item.itemKey)}：优先练${metricLabel[item.weakestMetric]}`);
  }, [metricsStore]);

  const reviewReminders = useMemo(() => {
    const intervals = new Set([1, 3, 7]);
    return missionStore.history
      .map((entry) => ({ entry, daysAgo: daysBetween(entry.date, todayKey) }))
      .filter((item) => intervals.has(item.daysAgo))
      .slice(0, 4)
      .map((item) => `复习 ${item.daysAgo} 天前的任务：${item.entry.items.map(formatPracticeItemKey).join('、')}`);
  }, [missionStore.history, todayKey]);

  const getCategoryView = (category: LearningCategory) =>
    category === 'letters' ? AppView.LETTER_LIST : category === 'numbers' ? AppView.NUMBER_LIST : AppView.SHAPE_LIST;

  const handleStart = () => setView(AppView.HOME);

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

  const handleSelectCategory = (category: LearningCategory) => {
    setActiveCategory(category);
    setView(getCategoryView(category));
  };

  const handleSelectLetter = (letter: LetterConfig, category: LearningCategory) => {
    setActiveCategory(category);
    setCurrentLetter(letter);
    setReturnViewAfterTrace(getCategoryView(category));
    traceStartRef.current = Date.now();
    setView(AppView.LETTER);
  };

  const handleComplete = () => {
    if (currentLetter) {
      const now = Date.now();
      const minutesDelta = Math.max(1 / 6, (now - traceStartRef.current) / 60000);

      setCompletedLetters((prev) => ({ ...prev, [currentLetter.char]: true }));

      const missionItem = todayMission.items.find(
        (item) =>
          item.char === currentLetter.char &&
          ((item.type === 'letter' && activeCategory === 'letters') ||
            (item.type === 'number' && activeCategory === 'numbers') ||
            (item.type === 'shape' && activeCategory === 'shapes'))
      );
      if (missionItem) {
        const itemKey = missionItemKey(missionItem);
        setMissionStore((prev) => addPracticedMissionItem(prev, todayKey, itemKey, minutesDelta));
      }

      setThemePracticeCounts((prev) => ({
        ...prev,
        [currentTheme]: (prev[currentTheme] || 0) + 1,
      }));

      setShowReward(true);
      setTimeout(() => {
        setShowReward(false);
        setView(returnViewAfterTrace);
        setCurrentLetter(null);
        setShowThemeChoice(true);
      }, 4000);
    }
  };

  const handleUpdateImage = (img: string) => {
     if (currentLetter) {
       setCustomImages(prev => ({ ...prev, [currentLetter.char]: img }));
     }
  };

  const applyTheme = (theme: SharkTheme) => {
    const preset = SHARK_THEME_PRESETS[theme];
    setCurrentTheme(theme);
    setSharkConfig((prev) => ({
      ...prev,
      color: preset.color,
      accessory: preset.accessory,
    }));
  };

  const handleAttemptAnalyzed = (attempt: TraceAttempt) => {
    if (!currentLetter) return;
    const itemKey = getPracticeItemKey(currentLetter.char, activeCategory);
    setMetricsStore((prev) => {
      const previous = getLatestAttempt(prev, itemKey);
      const message = pickPraiseMessage(previous, attempt);
      speak(message, 'zh-CN', 0.62);
      return addAttempt(prev, itemKey, attempt);
    });
  };

  useEffect(() => {
    setMissionStore((prev) => ensureMissionDay(prev, todayKey, todayMission));
  }, [todayKey, todayMission]);

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
  ]);

  useEffect(() => {
    if (!todayDay || todayDay.ritualDone) return;
    if (missionDoneCount >= todayMission.items.length) {
      setShowMissionRitual(true);
    }
  }, [missionDoneCount, todayDay, todayMission.items.length]);

  useEffect(() => {
    return () => clearParentHold();
  }, []);

  const handleStartMissionItem = (item: MissionItem) => {
    const sourceItems =
      item.type === 'letter' ? LETTER_ITEMS : item.type === 'number' ? NUMBER_ITEMS : SHAPE_ITEMS;
    const config = sourceItems.find((entry) => entry.char === item.char);
    if (!config) return;
    setActiveCategory(item.type === 'letter' ? 'letters' : item.type === 'number' ? 'numbers' : 'shapes');
    setCurrentLetter(config);
    setReturnViewAfterTrace(AppView.HOME);
    traceStartRef.current = Date.now();
    setView(AppView.LETTER);
  };

  const handleHighFiveRitual = () => {
    setMissionStore((prev) => completeMissionRitual(prev, todayKey));
    setShowMissionRitual(false);
    speak('击掌成功，明天继续冒险！', 'zh-CN');
    setShowThemeChoice(true);
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
      
      {view === AppView.INTRO && (
        <IntroScreen
          onStart={handleStart}
          sharkConfig={sharkConfig}
          theme={currentTheme}
          themeUpgradeLevel={currentThemeUpgradeLevel}
        />
      )}

      {view === AppView.HOME && (
        <MissionFlow
          mission={todayMission}
          practicedItemKeys={todayPracticedKeys}
          isCompletedToday={Boolean(todayDay?.completed)}
          streak={missionStore.streak}
          diaryStickers={missionStore.history.map((entry) => entry.sticker).slice(0, 12)}
          onNarrateStory={() => speak(todayMission.story, 'zh-CN')}
          onStartMissionItem={handleStartMissionItem}
          onOpenLetters={() => handleSelectCategory('letters')}
          onOpenNumbers={() => handleSelectCategory('numbers')}
          onOpenShapes={() => handleSelectCategory('shapes')}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {view === AppView.LETTER_LIST && (
        <CharacterGridView
          title="字母学习"
          items={LETTER_ITEMS}
          progress={completedLetters}
          customImages={customImages}
          onSelectLetter={(letter) => handleSelectLetter(letter, 'letters')}
          onBack={() => setView(AppView.HOME)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {view === AppView.NUMBER_LIST && (
        <CharacterGridView
          title="数字学习"
          items={NUMBER_ITEMS}
          progress={completedLetters}
          customImages={customImages}
          onSelectLetter={(letter) => handleSelectLetter(letter, 'numbers')}
          onBack={() => setView(AppView.HOME)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {view === AppView.SHAPE_LIST && (
        <CharacterGridView
          title="线条练习"
          items={SHAPE_ITEMS}
          progress={completedLetters}
          customImages={customImages}
          onSelectLetter={(letter) => handleSelectLetter(letter, 'shapes')}
          onBack={() => setView(AppView.HOME)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {view === AppView.LETTER && currentLetter && (
        <LetterView 
          letter={currentLetter} 
          onBack={() => setView(returnViewAfterTrace)}
          onComplete={handleComplete}
          sharkConfig={sharkConfig}
          customImage={customImages[currentLetter.char]}
          onUpdateImage={handleUpdateImage}
          progressLevels={currentProgressLevels}
          onAttemptAnalyzed={handleAttemptAnalyzed}
          difficultyMode={difficultyMode}
          theme={currentTheme}
          themeUpgradeLevel={currentThemeUpgradeLevel}
        />
      )}

      {showReward && (
        <SharkReward sharkConfig={sharkConfig} theme={currentTheme} themeUpgradeLevel={currentThemeUpgradeLevel} />
      )}

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        config={sharkConfig}
        onChange={setSharkConfig}
        theme={currentTheme}
        themeUpgradeLevel={currentThemeUpgradeLevel}
        themePracticeCount={themePracticeCounts[currentTheme]}
        onApplyTheme={applyTheme}
      />
      <MissionRitual isOpen={showMissionRitual} onHighFive={handleHighFiveRitual} />
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
      />
    </div>
  );
}
