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

const LETTER_STATIC_MAP: Record<string, string[]> = {
  A: ['apple', 'ball'],
  B: ['ball', 'boat'],
  C: ['crown', 'shell'],
  D: ['boat', 'fish'],
  E: ['zebra', 'shell'],
  F: ['fish', 'starfish'],
  G: ['fish', 'bubble'],
  H: ['shark', 'fish'],
  I: ['boat', 'bubble'],
  J: ['fish', 'shell'],
  K: ['kite', 'boat'],
  L: ['boat', 'ball'],
  M: ['starfish', 'rainbow'],
  N: ['fish', 'boat'],
  O: ['octopus', 'bubble'],
  P: ['apple', 'ball'],
  Q: ['crown', 'bubble'],
  R: ['rainbow', 'starfish'],
  S: ['shark', 'shell'],
  T: ['boat', 'rainbow'],
  U: ['bubble', 'boat'],
  V: ['fish', 'shark'],
  W: ['shark', 'fish'],
  X: ['kite', 'starfish'],
  Y: ['kite', 'rainbow'],
  Z: ['zebra', 'crown'],
};

const NUMBER_STATIC_MAP: Record<string, string[]> = {
  '0': ['bubble', 'ball'],
  '1': ['boat', 'apple'],
  '2': ['zebra', 'fish'],
  '3': ['fish', 'rainbow'],
  '4': ['kite', 'boat'],
  '5': ['starfish', 'apple'],
  '6': ['shell', 'fish'],
  '7': ['rainbow', 'kite'],
  '8': ['octopus', 'bubble'],
  '9': ['bubble', 'fish'],
};

const SHAPE_STATIC_MAP: Record<string, string[]> = {
  '—': ['boat', 'rainbow'],
  '|': ['boat', 'apple'],
  '/': ['kite', 'zebra'],
  '○': ['bubble', 'ball'],
  '⌒': ['rainbow', 'shell'],
  '⚡': ['crown', 'starfish'],
  '✚': ['starfish', 'crown'],
};

const LETTER_SOUND_HINT: Record<string, string> = {
  A: 'A-a / apple',
  B: 'B-b / ball',
  C: 'C-c / cat',
  D: 'D-d / dog',
  E: 'E-e / egg',
  F: 'F-f / fish',
  G: 'G-g / goat',
  H: 'H-h / hat',
  I: 'I-i / igloo',
  J: 'J-j / jam',
  K: 'K-k / kite',
  L: 'L-l / lion',
  M: 'M-m / moon',
  N: 'N-n / nest',
  O: 'O-o / owl',
  P: 'P-p / pig',
  Q: 'Q-q / queen',
  R: 'R-r / rabbit',
  S: 'S-s / sun',
  T: 'T-t / turtle',
  U: 'U-u / umbrella',
  V: 'V-v / violin',
  W: 'W-w / whale',
  X: 'X-x / xylophone',
  Y: 'Y-y / yacht',
  Z: 'Z-z / zebra',
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const buildGlyphSticker = (
  item: LetterConfig,
  variant: 'solid' | 'dotted'
): StickerItem => {
  const hueSeed = (item.char.codePointAt(0) || 0) + item.word.length * 23;
  const hue = hueSeed % 360;
  const bgA = `hsl(${hue}, 90%, 78%)`;
  const bgB = `hsl(${(hue + 35) % 360}, 90%, 66%)`;
  const pathStroke = variant === 'solid' ? '#0f172a' : '#0284c7';
  const pathStrokeWidth = variant === 'solid' ? 10 : 8;
  const dash = variant === 'solid' ? '' : 'stroke-dasharray="8 5"';

  const label = variant === 'solid' ? '外形' : '轨迹';
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgA}"/>
        <stop offset="100%" stop-color="${bgB}"/>
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="108" height="108" rx="22" fill="url(#bg)"/>
    <rect x="14" y="14" width="92" height="78" rx="16" fill="rgba(255,255,255,0.85)"/>
    <svg x="18" y="18" width="84" height="70" viewBox="${escapeXml(item.viewBox)}">
      <path d="${escapeXml(item.svgPath)}" fill="none" stroke="${pathStroke}" stroke-width="${pathStrokeWidth}" stroke-linecap="round" stroke-linejoin="round" ${dash}/>
    </svg>
    <text x="60" y="102" text-anchor="middle" font-family="Verdana" font-size="12" font-weight="700" fill="#0f172a">${escapeXml(item.char)} ${label}</text>
  </svg>`;

  return {
    id: `${item.char.toLowerCase()}-${variant}-glyph`,
    labelZh: variant === 'solid' ? `${item.char}外形` : `${item.char}轨迹`,
    src: toDataUrl(svg),
    tags: ['glyph', item.char.toLowerCase(), item.word.toLowerCase()],
    relevance: [`char:${item.char}`, `word:${item.word.toLowerCase()}`],
    phraseZh:
      variant === 'solid'
        ? `这个贴纸就是${item.char}的外形。`
        : `这个贴纸是${item.char}的书写轨迹。`,
  };
};

const buildSoundSticker = (item: LetterConfig): StickerItem => {
  const isLetter = /^[A-Z]$/.test(item.char);
  const isNumber = /^[0-9]$/.test(item.char);

  const soundLine = isLetter
    ? LETTER_SOUND_HINT[item.char] || `${item.char} / ${item.word.toLowerCase()}`
    : isNumber
    ? `${item.char} / ${item.phonics?.zh || '数字'}`
    : `${item.word} / 线条`;

  const phrase = isLetter
    ? `${item.char}，${item.word}，听起来很像。`
    : isNumber
    ? `数字${item.char}，跟着读一遍。`
    : `${item.word}，跟着形状念一遍。`;

  const hueSeed = (item.char.codePointAt(0) || 0) + 97;
  const hue = hueSeed % 360;
  const bg = `hsl(${hue}, 85%, 78%)`;
  const textColor = '#0f172a';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect x="6" y="6" width="108" height="108" rx="22" fill="${bg}"/>
    <circle cx="60" cy="43" r="28" fill="white" fill-opacity="0.92"/>
    <text x="60" y="52" text-anchor="middle" font-family="Verdana" font-size="30">${escapeXml(item.emoji)}</text>
    <text x="60" y="86" text-anchor="middle" font-family="Verdana" font-size="12" font-weight="700" fill="${textColor}">${escapeXml(soundLine)}</text>
    <text x="60" y="101" text-anchor="middle" font-family="Verdana" font-size="10" font-weight="600" fill="${textColor}">${escapeXml(item.word)}</text>
  </svg>`;

  return {
    id: `${item.char.toLowerCase()}-sound`,
    labelZh: `${item.word}发音`,
    src: toDataUrl(svg),
    tags: ['sound', item.char.toLowerCase(), item.word.toLowerCase()],
    relevance: [`char:${item.char}`, `word:${item.word.toLowerCase()}`],
    phraseZh: phrase,
  };
};

const buildCountOrShapeSticker = (item: LetterConfig): StickerItem => {
  const isNumber = /^[0-9]$/.test(item.char);
  const amount = isNumber ? Math.max(1, Math.min(6, Number(item.char) || 1)) : 4;
  const bubbles = Array.from({ length: amount })
    .map((_, index) => {
      const x = 22 + (index % 3) * 28;
      const y = 28 + Math.floor(index / 3) * 24;
      return `<circle cx="${x}" cy="${y}" r="8" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>`;
    })
    .join('');

  const bottomText = isNumber ? `${item.char} 个小泡泡` : `${item.word} 形状贴纸`;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect x="6" y="6" width="108" height="108" rx="22" fill="#dbeafe"/>
    ${bubbles}
    <text x="60" y="93" text-anchor="middle" font-family="Verdana" font-size="12" font-weight="700" fill="#0f172a">${escapeXml(bottomText)}</text>
    <text x="60" y="106" text-anchor="middle" font-family="Verdana" font-size="10" font-weight="600" fill="#0f172a">${escapeXml(item.char)} · ${escapeXml(item.word)}</text>
  </svg>`;

  return {
    id: `${item.char.toLowerCase()}-count-shape`,
    labelZh: isNumber ? `${item.char}数量` : `${item.word}联想`,
    src: toDataUrl(svg),
    tags: ['count', 'shape', item.char.toLowerCase()],
    relevance: [`char:${item.char}`, `word:${item.word.toLowerCase()}`],
    phraseZh: isNumber ? `这是${item.char}个小泡泡。` : `${item.word}，像你刚写的线条。`,
  };
};

const getStaticStickerIds = (item: LetterConfig) => {
  if (/^[A-Z]$/.test(item.char)) return LETTER_STATIC_MAP[item.char] || [];
  if (/^[0-9]$/.test(item.char)) return NUMBER_STATIC_MAP[item.char] || [];
  return SHAPE_STATIC_MAP[item.char] || [];
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

  const glyphSticker = useMemo(() => buildGlyphSticker(item, 'solid'), [item]);
  const traceSticker = useMemo(() => buildGlyphSticker(item, 'dotted'), [item]);
  const soundSticker = useMemo(() => buildSoundSticker(item), [item]);
  const countOrShapeSticker = useMemo(() => buildCountOrShapeSticker(item), [item]);

  const recommendedStickers = useMemo(() => {
    const staticById = new Map(STICKERS.map((sticker) => [sticker.id, sticker]));
    const staticItems = getStaticStickerIds(item)
      .map((id) => staticById.get(id))
      .filter((sticker): sticker is StickerItem => Boolean(sticker));

    const merged = [glyphSticker, traceSticker, soundSticker, countOrShapeSticker, ...staticItems];
    const seen = new Set<string>();
    return merged.filter((sticker) => {
      if (seen.has(sticker.id)) return false;
      seen.add(sticker.id);
      return true;
    });
  }, [item, glyphSticker, traceSticker, soundSticker, countOrShapeSticker]);

  const allStickers = useMemo(() => {
    const merged = [glyphSticker, traceSticker, soundSticker, countOrShapeSticker, ...STICKERS];
    const seen = new Set<string>();
    return merged.filter((sticker) => {
      if (seen.has(sticker.id)) return false;
      seen.add(sticker.id);
      return true;
    });
  }, [glyphSticker, traceSticker, soundSticker, countOrShapeSticker]);

  useEffect(() => {
    if (!isOpen) return;
    setShowAll(false);
    setSelected(currentImage || recommendedStickers[0]?.src || allStickers[0]?.src || STICKERS[0].src);

    if (/^[A-Z]$/.test(item.char)) {
      speakLetterThenWord(item.char, item.word);
      return;
    }
    if (/^[0-9]$/.test(item.char)) {
      speak(item.phonics?.zh || `数字${item.char}`, 'zh-CN', 0.56);
      window.setTimeout(() => speak(`${item.char}条小鱼在游泳`, 'zh-CN', 0.58), 380);
      return;
    }
    speak(`${item.word}，我们来选和它形状相关的贴纸`, 'zh-CN', 0.58);
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
          <p className="text-sm font-bold text-gray-500">外形 + 发音 专属贴纸包（{item.char}）</p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-black text-ocean-800 mb-2">当前项专属贴纸包</p>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
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
