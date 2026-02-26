import React, { useEffect, useMemo, useState } from 'react';
import { LetterConfig } from '../../types';
import { speak, speakLetterThenWord } from '../logic/audio';
import { STICKERS, StickerItem } from '../data/stickers';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LetterConfig;
  currentImage: string | null;
  onSave: (img: string) => void;
}

const LETTER_ASSOCIATIONS: Record<string, string[]> = {
  A: ['Apple', 'Argo', 'Ant', 'Airplane'],
  B: ['Ball', 'Boat', 'Bird', 'Banana'],
  C: ['Cat', 'Car', 'Cake', 'Crab'],
  D: ['Dog', 'Duck', 'Drum', 'Dolphin'],
  E: ['Egg', 'Elephant', 'Earth', 'Engine'],
  F: ['Fish', 'Frog', 'Flower', 'Fox'],
  G: ['Goat', 'Grape', 'Guitar', 'Gift'],
  H: ['Hat', 'House', 'Heart', 'Horse'],
  I: ['Igloo', 'Ice', 'Island', 'Insect'],
  J: ['Jam', 'Juice', 'Jellyfish', 'Jet'],
  K: ['Kite', 'Key', 'Koala', 'Kiwi'],
  L: ['Lion', 'Leaf', 'Lemon', 'Lamp'],
  M: ['Moon', 'Monkey', 'Mango', 'Milk'],
  N: ['Nest', 'Nose', 'Noodles', 'Net'],
  O: ['Owl', 'Orange', 'Octopus', 'Ocean'],
  P: ['Pig', 'Panda', 'Pizza', 'Pear'],
  Q: ['Queen', 'Quilt', 'Quail', 'Quartz'],
  R: ['Rabbit', 'Rainbow', 'Rocket', 'Rose'],
  S: ['Sun', 'Shark', 'Shell', 'Star'],
  T: ['Turtle', 'Train', 'Tree', 'Tiger'],
  U: ['Umbrella', 'Unicorn', 'Up', 'Udon'],
  V: ['Violin', 'Vase', 'Volcano', 'Van'],
  W: ['Whale', 'Wave', 'Watermelon', 'Wind'],
  X: ['Xylophone', 'Xray', 'Xmas', 'Xerox'],
  Y: ['Yacht', 'Yak', 'YoYo', 'Yam'],
  Z: ['Zebra', 'Zoo', 'Zigzag', 'Zipper'],
};

const NUMBER_ASSOCIATIONS: Record<string, string[]> = {
  '0': ['Zero', 'Circle', 'Bubble'],
  '1': ['One', 'Pole', 'Rocket'],
  '2': ['Two', 'Swan', 'Zebra'],
  '3': ['Three', 'Fish', 'Rainbow'],
  '4': ['Four', 'Flag', 'Kite'],
  '5': ['Five', 'Starfish', 'Hand'],
  '6': ['Six', 'Snail', 'Shell'],
  '7': ['Seven', 'Rainbow', 'Hill'],
  '8': ['Eight', 'Octopus', 'Glasses'],
  '9': ['Nine', 'Balloon', 'Hook'],
};

const SHAPE_ASSOCIATIONS: Record<string, string[]> = {
  '—': ['Line', 'Bridge', 'Road'],
  '|': ['Line', 'Tree', 'Pole'],
  '/': ['Slash', 'Slide', 'Mountain'],
  '○': ['Circle', 'Bubble', 'Ball'],
  '⌒': ['Arc', 'Rainbow', 'Smile'],
  '⚡': ['Zigzag', 'Lightning', 'Crown'],
  '✚': ['Cross', 'Starfish', 'Road'],
};

const WORD_EMOJI: Record<string, string> = {
  apple: '🍎',
  argo: '🚢',
  ant: '🐜',
  airplane: '✈️',
  ball: '⚽',
  boat: '⛵',
  bird: '🐦',
  banana: '🍌',
  cat: '🐱',
  car: '🚗',
  cake: '🎂',
  crab: '🦀',
  dog: '🐶',
  duck: '🦆',
  drum: '🥁',
  dolphin: '🐬',
  egg: '🥚',
  elephant: '🐘',
  earth: '🌍',
  engine: '🚂',
  fish: '🐟',
  frog: '🐸',
  flower: '🌸',
  fox: '🦊',
  goat: '🐐',
  grape: '🍇',
  guitar: '🎸',
  gift: '🎁',
  hat: '🎩',
  house: '🏠',
  heart: '❤️',
  horse: '🐴',
  igloo: '🧊',
  ice: '🧊',
  island: '🏝️',
  insect: '🪲',
  jam: '🍯',
  juice: '🧃',
  jellyfish: '🪼',
  jet: '🛩️',
  kite: '🪁',
  key: '🔑',
  koala: '🐨',
  kiwi: '🥝',
  lion: '🦁',
  leaf: '🍃',
  lemon: '🍋',
  lamp: '💡',
  moon: '🌙',
  monkey: '🐵',
  mango: '🥭',
  milk: '🥛',
  nest: '🪺',
  nose: '👃',
  noodles: '🍜',
  net: '🥅',
  owl: '🦉',
  orange: '🍊',
  octopus: '🐙',
  ocean: '🌊',
  pig: '🐷',
  panda: '🐼',
  pizza: '🍕',
  pear: '🍐',
  queen: '👑',
  quilt: '🧵',
  quail: '🐦',
  quartz: '💎',
  rabbit: '🐰',
  rainbow: '🌈',
  rocket: '🚀',
  rose: '🌹',
  sun: '☀️',
  shark: '🦈',
  shell: '🐚',
  star: '⭐',
  turtle: '🐢',
  train: '🚂',
  tree: '🌳',
  tiger: '🐯',
  umbrella: '☂️',
  unicorn: '🦄',
  up: '⬆️',
  udon: '🍜',
  violin: '🎻',
  vase: '🏺',
  volcano: '🌋',
  van: '🚐',
  whale: '🐋',
  wave: '🌊',
  watermelon: '🍉',
  wind: '💨',
  xylophone: '🎼',
  xray: '🩻',
  xmas: '🎄',
  xerox: '📄',
  yacht: '🛥️',
  yak: '🐂',
  yoyo: '🪀',
  yam: '🍠',
  zebra: '🦓',
  zoo: '🦁',
  zigzag: '⚡',
  zipper: '🧥',
  zero: '0️⃣',
  circle: '⭕',
  bubble: '🫧',
  one: '1️⃣',
  pole: '📏',
  two: '2️⃣',
  swan: '🦢',
  three: '3️⃣',
  four: '4️⃣',
  flag: '🚩',
  five: '5️⃣',
  hand: '✋',
  six: '6️⃣',
  snail: '🐌',
  seven: '7️⃣',
  hill: '⛰️',
  eight: '8️⃣',
  glasses: '👓',
  nine: '9️⃣',
  balloon: '🎈',
  hook: '🪝',
  line: '➖',
  bridge: '🌉',
  road: '🛣️',
  slash: '/',
  slide: '🛝',
  mountain: '⛰️',
  arc: '🌙',
  smile: '😊',
  lightning: '⚡',
  cross: '✚',
};

const WORD_ZH: Record<string, string> = {
  apple: '苹果',
  argo: '阿尔戈船',
  ant: '蚂蚁',
  airplane: '飞机',
  ball: '球',
  boat: '小船',
  bird: '小鸟',
  banana: '香蕉',
  cat: '猫',
  car: '汽车',
  cake: '蛋糕',
  crab: '螃蟹',
  dog: '狗',
  duck: '鸭子',
  drum: '鼓',
  dolphin: '海豚',
  egg: '鸡蛋',
  elephant: '大象',
  earth: '地球',
  engine: '火车头',
  fish: '小鱼',
  frog: '青蛙',
  flower: '花',
  fox: '狐狸',
  goat: '山羊',
  grape: '葡萄',
  guitar: '吉他',
  gift: '礼物',
  hat: '帽子',
  house: '房子',
  heart: '爱心',
  horse: '马',
  igloo: '冰屋',
  ice: '冰块',
  island: '小岛',
  insect: '昆虫',
  jam: '果酱',
  juice: '果汁',
  jellyfish: '水母',
  jet: '喷气机',
  kite: '风筝',
  key: '钥匙',
  koala: '考拉',
  kiwi: '猕猴桃',
  lion: '狮子',
  leaf: '叶子',
  lemon: '柠檬',
  lamp: '灯',
  moon: '月亮',
  monkey: '猴子',
  mango: '芒果',
  milk: '牛奶',
  nest: '鸟窝',
  nose: '鼻子',
  noodles: '面条',
  net: '网',
  owl: '猫头鹰',
  orange: '橙子',
  octopus: '章鱼',
  ocean: '海洋',
  pig: '小猪',
  panda: '熊猫',
  pizza: '披萨',
  pear: '梨',
  queen: '皇后',
  quilt: '被子',
  quail: '鹌鹑',
  quartz: '水晶',
  rabbit: '兔子',
  rainbow: '彩虹',
  rocket: '火箭',
  rose: '玫瑰',
  sun: '太阳',
  shark: '鲨鱼',
  shell: '贝壳',
  star: '星星',
  turtle: '乌龟',
  train: '火车',
  tree: '树',
  tiger: '老虎',
  umbrella: '雨伞',
  unicorn: '独角兽',
  up: '向上',
  udon: '乌冬面',
  violin: '小提琴',
  vase: '花瓶',
  volcano: '火山',
  van: '面包车',
  whale: '鲸鱼',
  wave: '海浪',
  watermelon: '西瓜',
  wind: '风',
  xylophone: '木琴',
  xray: 'X光',
  xmas: '圣诞树',
  xerox: '复印',
  yacht: '游艇',
  yak: '牦牛',
  yoyo: '悠悠球',
  yam: '红薯',
  zebra: '斑马',
  zoo: '动物园',
  zigzag: '锯齿线',
  zipper: '拉链',
  zero: '零',
  circle: '圆圈',
  bubble: '泡泡',
  one: '一',
  pole: '柱子',
  two: '二',
  swan: '天鹅',
  three: '三',
  four: '四',
  flag: '旗子',
  five: '五',
  hand: '手掌',
  six: '六',
  snail: '蜗牛',
  seven: '七',
  hill: '小山',
  eight: '八',
  glasses: '眼镜',
  nine: '九',
  balloon: '气球',
  hook: '钩子',
  line: '线',
  bridge: '桥',
  road: '路',
  slash: '斜线',
  slide: '滑梯',
  mountain: '山',
  arc: '弧线',
  smile: '笑脸',
  lightning: '闪电',
  cross: '交叉',
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const buildWordSticker = (item: LetterConfig, word: string): StickerItem => {
  const key = word.toLowerCase();
  const emoji = WORD_EMOJI[key] || item.emoji || '✨';
  const labelZh = WORD_ZH[key] || word;
  const hue = ((word.charCodeAt(0) || 0) + (item.char.codePointAt(0) || 0) * 7) % 360;
  const bgA = `hsl(${hue}, 85%, 80%)`;
  const bgB = `hsl(${(hue + 30) % 360}, 85%, 68%)`;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgA}"/>
        <stop offset="100%" stop-color="${bgB}"/>
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="108" height="108" rx="22" fill="url(#bg)"/>
    <circle cx="60" cy="48" r="30" fill="rgba(255,255,255,0.92)"/>
    <text x="60" y="58" text-anchor="middle" font-size="32">${escapeXml(emoji)}</text>
    <text x="60" y="92" text-anchor="middle" font-family="Verdana" font-size="13" font-weight="700" fill="#0f172a">${escapeXml(word)}</text>
    <text x="60" y="106" text-anchor="middle" font-family="Verdana" font-size="10" font-weight="600" fill="#0f172a">${escapeXml(labelZh)}</text>
  </svg>`;

  return {
    id: `${item.char.toLowerCase()}-word-${key}`,
    labelZh,
    labelEn: word,
    src: toDataUrl(svg),
    tags: [key, item.char.toLowerCase(), item.word.toLowerCase(), 'phonics'],
    relevance: [`char:${item.char}`, `word:${key}`],
    phraseZh: `${item.char}，${word}。`,
  };
};

const buildGlyphSticker = (item: LetterConfig): StickerItem => {
  const hue = ((item.char.codePointAt(0) || 0) * 9 + 40) % 360;
  const bg = `hsl(${hue}, 85%, 74%)`;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect x="6" y="6" width="108" height="108" rx="22" fill="${bg}"/>
    <rect x="14" y="16" width="92" height="76" rx="14" fill="rgba(255,255,255,0.92)"/>
    <svg x="18" y="20" width="84" height="68" viewBox="${escapeXml(item.viewBox)}">
      <path d="${escapeXml(item.svgPath)}" fill="none" stroke="#0f172a" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <text x="60" y="104" text-anchor="middle" font-family="Verdana" font-size="11" font-weight="700" fill="#0f172a">${escapeXml(item.char)} 外形</text>
  </svg>`;

  return {
    id: `${item.char.toLowerCase()}-glyph-shape`,
    labelZh: `${item.char}外形`,
    src: toDataUrl(svg),
    tags: [item.char.toLowerCase(), 'shape'],
    relevance: [`char:${item.char}`],
    phraseZh: `这是${item.char}的外形贴纸。`,
  };
};

const buildCurrentPack = (item: LetterConfig): StickerItem[] => {
  if (/^[A-Z]$/.test(item.char)) {
    const pool = LETTER_ASSOCIATIONS[item.char] || [item.word];
    const words = Array.from(new Set([item.word, ...pool])).slice(0, 6);
    return [...words.map((word) => buildWordSticker(item, word)), buildGlyphSticker(item)];
  }

  if (/^[0-9]$/.test(item.char)) {
    const pool = NUMBER_ASSOCIATIONS[item.char] || [item.word];
    const words = Array.from(new Set([item.word, ...pool])).slice(0, 6);
    return [...words.map((word) => buildWordSticker(item, word)), buildGlyphSticker(item)];
  }

  const pool = SHAPE_ASSOCIATIONS[item.char] || [item.word];
  const words = Array.from(new Set([item.word, ...pool])).slice(0, 6);
  return [...words.map((word) => buildWordSticker(item, word)), buildGlyphSticker(item)];
};

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  item,
  currentImage,
  onSave,
}) => {
  const [selected, setSelected] = useState<string>(currentImage || STICKERS[0].src);
  const [showAll, setShowAll] = useState(false);

  const currentPack = useMemo(() => buildCurrentPack(item), [item]);

  const allStickers = useMemo(() => {
    const merged = [...currentPack, ...STICKERS];
    const seen = new Set<string>();
    return merged.filter((sticker) => {
      if (seen.has(sticker.id)) return false;
      seen.add(sticker.id);
      return true;
    });
  }, [currentPack]);

  useEffect(() => {
    if (!isOpen) return;
    setShowAll(false);
    setSelected(currentImage || currentPack[0]?.src || allStickers[0]?.src || STICKERS[0].src);

    if (/^[A-Z]$/.test(item.char)) {
      speakLetterThenWord(item.char, item.word);
      return;
    }
    if (/^[0-9]$/.test(item.char)) {
      speak(item.phonics?.zh || `数字${item.char}`, 'zh-CN', 0.56);
      window.setTimeout(() => speak(`${item.char}条小鱼在游泳`, 'zh-CN', 0.58), 380);
      return;
    }
    speak(`${item.word}，挑一个和它相关的贴纸吧`, 'zh-CN', 0.58);
  }, [isOpen, currentImage, item, currentPack, allStickers]);

  const handleSelectSticker = (option: StickerItem) => {
    setSelected(option.src);
    if (/^[A-Z]$/.test(item.char) && option.labelEn) {
      speakLetterThenWord(item.char, option.labelEn);
      return;
    }
    speak(option.phraseZh || `${option.labelZh}，好可爱`, 'zh-CN', 0.6);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-ocean-900">贴纸盒</h2>
          <button onClick={onClose} className="text-2xl bg-gray-100 rounded-full w-10 h-10 hover:bg-gray-200">
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center mb-5">
          <div className="w-44 h-44 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-3 shadow-inner">
            {selected ? (
              <img src={selected} alt={`${item.word} sticker`} className="w-full h-full object-contain p-3" />
            ) : (
              <span className="text-8xl">{item.emoji}</span>
            )}
          </div>
          <p className="text-sm font-bold text-gray-500">{item.char} 的发音联想贴纸库</p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-black text-ocean-800 mb-2">当前项专属贴纸包</p>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {currentPack.map((option) => (
              <button
                key={`current-${option.id}`}
                onClick={() => handleSelectSticker(option)}
                className={`rounded-xl border-2 p-2 bg-white transition-all active:scale-95 ${
                  selected === option.src ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 hover:border-ocean-300'
                }`}
              >
                <img src={option.src} alt={option.labelZh} className="w-full h-16 object-contain" />
                <span className="text-xs font-bold text-gray-600">{option.labelZh}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm font-black text-ocean-700 bg-ocean-50 px-3 py-2 rounded-xl border border-ocean-200"
          >
            {showAll ? '收起贴纸库' : '更多贴纸'}
          </button>
        </div>

        {showAll && (
          <>
            <p className="text-sm font-black text-ocean-800 mb-2">全部贴纸</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
              {allStickers.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectSticker(option)}
                  className={`rounded-xl border-2 p-2 bg-white transition-all active:scale-95 ${
                    selected === option.src ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 hover:border-ocean-300'
                  }`}
                >
                  <img src={option.src} alt={option.labelZh} className="w-full h-16 object-contain" />
                  <span className="text-xs font-bold text-gray-600">{option.labelZh}</span>
                </button>
              ))}
            </div>
          </>
        )}

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

export default ImagePickerModal;
