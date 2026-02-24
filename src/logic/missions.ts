export type MissionItemType = 'letter' | 'number' | 'shape';

export interface MissionItem {
  id: string;
  type: MissionItemType;
  char: string;
}

export interface DailyMission {
  date: string;
  story: string;
  items: MissionItem[];
  sticker: string;
}

const STORY_TEMPLATES = [
  '今天小鲨鱼要去海底图书馆借书。',
  '今天小鲨鱼想给朋友写一张小卡片。',
  '今天小鲨鱼要帮海龟整理数字牌。',
  '今天小鲨鱼在珊瑚乐园找线条宝藏。',
  '今天小鲨鱼准备一场海底派对邀请函。',
  '今天小鲨鱼要画一张旅行路线图。',
];

const STICKER_POOL = ['🐚', '⭐', '🫧', '🌈', '🐠', '🪸', '🌊', '🐬'];

export const getDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const hashSeed = (value: string) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const createSeededRandom = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const pickUnique = (values: string[], count: number, rnd: () => number) => {
  const pool = [...values];
  const picks: string[] = [];
  while (pool.length > 0 && picks.length < count) {
    const idx = Math.floor(rnd() * pool.length);
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picks;
};

export const missionItemKey = (item: MissionItem) => `${item.type}:${item.char}`;

export const buildDailyMission = (
  dateKey: string,
  letterChars: string[],
  numberChars: string[]
): DailyMission => {
  const rnd = createSeededRandom(hashSeed(dateKey));
  const letterCount = rnd() > 0.5 ? 2 : 1;
  const numberCount = 3 - letterCount;
  const letters = pickUnique(letterChars, letterCount, rnd);
  const numbers = pickUnique(numberChars, numberCount, rnd);

  const items: MissionItem[] = [
    ...letters.map((char, idx) => ({ id: `L${idx}-${char}`, type: 'letter' as const, char })),
    ...numbers.map((char, idx) => ({ id: `N${idx}-${char}`, type: 'number' as const, char })),
  ];

  // Small deterministic shuffle to avoid same order feeling.
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  const story = STORY_TEMPLATES[Math.floor(rnd() * STORY_TEMPLATES.length)];
  const sticker = STICKER_POOL[Math.floor(rnd() * STICKER_POOL.length)];

  return {
    date: dateKey,
    story,
    items,
    sticker,
  };
};
