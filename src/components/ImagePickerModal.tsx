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

const LETTER_PACK_MAP: Record<string, string[]> = {
  A: ['apple', 'ball', 'bubble'],
  B: ['ball', 'boat', 'bubble'],
  C: ['crown', 'bubble', 'shell'],
  D: ['boat', 'fish', 'shell'],
  E: ['zebra', 'shell', 'bubble'],
  F: ['fish', 'starfish', 'shark'],
  G: ['fish', 'bubble', 'shell'],
  H: ['shark', 'fish', 'starfish'],
  I: ['boat', 'bubble', 'rainbow'],
  J: ['fish', 'shell', 'bubble'],
  K: ['kite', 'boat', 'ball'],
  L: ['boat', 'ball', 'bubble'],
  M: ['starfish', 'shell', 'rainbow'],
  N: ['fish', 'bubble', 'boat'],
  O: ['octopus', 'bubble', 'ball'],
  P: ['apple', 'ball', 'shell'],
  Q: ['crown', 'bubble', 'ball'],
  R: ['rainbow', 'starfish', 'shell'],
  S: ['shark', 'starfish', 'shell'],
  T: ['boat', 'rainbow', 'fish'],
  U: ['bubble', 'boat', 'fish'],
  V: ['fish', 'shark', 'starfish'],
  W: ['shark', 'fish', 'boat'],
  X: ['kite', 'starfish', 'crown'],
  Y: ['kite', 'rainbow', 'boat'],
  Z: ['zebra', 'rainbow', 'crown'],
};

const NUMBER_PACK_MAP: Record<string, string[]> = {
  '0': ['bubble', 'ball', 'octopus'],
  '1': ['boat', 'apple', 'crown'],
  '2': ['zebra', 'fish', 'boat'],
  '3': ['fish', 'starfish', 'rainbow'],
  '4': ['kite', 'boat', 'crown'],
  '5': ['starfish', 'apple', 'shell'],
  '6': ['shell', 'fish', 'octopus'],
  '7': ['rainbow', 'kite', 'boat'],
  '8': ['octopus', 'bubble', 'ball'],
  '9': ['bubble', 'fish', 'rainbow'],
};

const SHAPE_PACK_MAP: Record<string, string[]> = {
  '—': ['boat', 'rainbow', 'fish'],
  '|': ['boat', 'apple', 'crown'],
  '/': ['kite', 'zebra', 'rainbow'],
  '○': ['bubble', 'ball', 'octopus'],
  '⌒': ['rainbow', 'shell', 'starfish'],
  '⚡': ['crown', 'starfish', 'kite'],
  '✚': ['starfish', 'crown', 'kite'],
};

const getPackIds = (item: LetterConfig) => {
  if (/^[A-Z]$/.test(item.char)) return LETTER_PACK_MAP[item.char] || [];
  if (/^[0-9]$/.test(item.char)) return NUMBER_PACK_MAP[item.char] || [];
  return SHAPE_PACK_MAP[item.char] || [];
};

const toDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const buildExclusiveSticker = (item: LetterConfig): StickerItem => {
  const seed = item.char.charCodeAt(0) + item.word.length * 37;
  const hue = seed % 360;
  const bgA = `hsl(${hue}, 85%, 78%)`;
  const bgB = `hsl(${(hue + 36) % 360}, 88%, 66%)`;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgA}"/>
        <stop offset="100%" stop-color="${bgB}"/>
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="108" height="108" rx="22" fill="url(#g)"/>
    <circle cx="60" cy="56" r="36" fill="white" fill-opacity="0.92"/>
    <text x="60" y="68" text-anchor="middle" font-family="Verdana" font-size="44" font-weight="700" fill="#0f172a">${item.char}</text>
    <text x="60" y="98" text-anchor="middle" font-family="Verdana" font-size="11" font-weight="600" fill="#0f172a">${item.word}</text>
  </svg>`;

  const relationLabel = /^[A-Z]$/.test(item.char)
    ? `字母${item.char}`
    : /^[0-9]$/.test(item.char)
    ? `数字${item.char}`
    : `${item.word}`;

  return {
    id: `exclusive-${item.char}-${item.word}`,
    labelZh: `${item.char}专属`,
    labelEn: 'Exclusive',
    src: toDataUrl(svg),
    tags: [item.char.toLowerCase(), item.word.toLowerCase(), 'exclusive'],
    relevance: [`char:${item.char}`, `word:${item.word.toLowerCase()}`],
    phraseZh: `这是${relationLabel}的专属贴纸。`,
  };
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

  const exclusiveSticker = useMemo(() => buildExclusiveSticker(item), [item]);

  const itemSignals = useMemo(() => {
    const normalizedWord = item.word.toLowerCase();
    const relevanceKeys = new Set<string>();
    const fallbackTags = new Set<string>();

    relevanceKeys.add(`char:${item.char}`);
    relevanceKeys.add(`word:${normalizedWord}`);
    fallbackTags.add(item.char.toLowerCase());
    fallbackTags.add(normalizedWord);

    for (const tag of item.stickerTags || []) {
      const clean = tag.trim().toLowerCase();
      if (!clean) continue;
      fallbackTags.add(clean);
      if (/^[a-z]$/.test(clean)) relevanceKeys.add(`letter:${clean.toUpperCase()}`);
      if (/^[0-9]$/.test(clean)) relevanceKeys.add(`number:${clean}`);
      if (clean.startsWith('shape-')) relevanceKeys.add(`shape:${clean.replace('shape-', '')}`);
    }

    return {
      relevanceKeys: Array.from(relevanceKeys),
      fallbackTags: Array.from(fallbackTags),
    };
  }, [item]);

  const recommendedStickers = useMemo(() => {
    const stickerById = new Map(STICKERS.map((s) => [s.id, s]));
    const packIds = getPackIds(item);
    const packStickers = packIds.map((id) => stickerById.get(id)).filter((s): s is StickerItem => Boolean(s));

    const scored = STICKERS.map((sticker) => {
      const normalizedTags = sticker.tags.map((tag) => tag.toLowerCase());
      const normalizedRelevance = sticker.relevance.map((tag) => tag.toLowerCase());
      let score = 0;

      for (const key of itemSignals.relevanceKeys) {
        const token = key.toLowerCase();
        if (normalizedRelevance.includes(token)) score += 50;
      }
      for (const tag of itemSignals.fallbackTags) {
        if (normalizedTags.includes(tag)) score += 8;
      }

      return { sticker, score };
    })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.sticker);

    const merged = [exclusiveSticker, ...packStickers, ...scored];
    const seen = new Set<string>();
    return merged.filter((sticker) => {
      if (seen.has(sticker.id)) return false;
      seen.add(sticker.id);
      return true;
    }).slice(0, 8);
  }, [exclusiveSticker, item, itemSignals]);

  const allStickers = useMemo(() => {
    const merged = [exclusiveSticker, ...STICKERS];
    const seen = new Set<string>();
    return merged.filter((sticker) => {
      if (seen.has(sticker.id)) return false;
      seen.add(sticker.id);
      return true;
    });
  }, [exclusiveSticker]);

  useEffect(() => {
    if (!isOpen) return;
    setShowAll(false);
    setSelected(currentImage || recommendedStickers[0]?.src || allStickers[0].src);
    if (/^[A-Z]$/.test(item.char)) {
      speakLetterThenWord(item.char, item.phonics?.en || item.word);
      return;
    }
    if (/^[0-9]$/.test(item.char)) {
      speak(item.phonics?.zh || `数字${item.char}`, 'zh-CN', 0.56);
      window.setTimeout(() => speak(`${item.char}条小鱼在游泳`, 'zh-CN', 0.58), 380);
      return;
    }
    speak(`${item.word}也有自己的专属贴纸`, 'zh-CN', 0.58);
  }, [isOpen, currentImage, item, recommendedStickers, allStickers]);

  const handleSelectSticker = (option: StickerItem) => {
    setSelected(option.src);
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
          <p className="text-sm font-bold text-gray-500">给 {item.word} 选专属贴纸</p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-black text-ocean-800 mb-2">当前项专属贴纸包</p>
          <div className="grid grid-cols-3 md:grid-cols-8 gap-3">
            {recommendedStickers.map((option) => (
              <button
                key={`recommended-${option.id}`}
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
