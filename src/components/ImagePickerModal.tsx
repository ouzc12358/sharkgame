import React, { useEffect, useMemo, useState } from 'react';
import { LetterConfig } from '../../types';
import { speak, speakLetterThenWord } from '../logic/audio';
import { STICKERS } from '../data/stickers';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LetterConfig;
  currentImage: string | null;
  onSave: (img: string) => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  item,
  currentImage,
  onSave,
}) => {
  const [selected, setSelected] = useState<string>(currentImage || STICKERS[0].src);

  const itemSignals = useMemo(() => {
    const rawTags = item.stickerTags || [];
    const normalizedWord = item.word.toLowerCase();
    const isLetter = /^[A-Z]$/.test(item.char);
    const isNumber = /^[0-9]$/.test(item.char);
    const isShape = !isLetter && !isNumber;
    const relevanceKeys = new Set<string>();
    const fallbackTags = new Set<string>();

    if (isLetter) {
      relevanceKeys.add(`letter:${item.char.toUpperCase()}`);
      relevanceKeys.add(`word:${normalizedWord}`);
      fallbackTags.add(item.char.toLowerCase());
      fallbackTags.add(normalizedWord);
    } else if (isNumber) {
      relevanceKeys.add(`number:${item.char}`);
      relevanceKeys.add(`count:${item.char}`);
      fallbackTags.add(item.char);
      fallbackTags.add(`count-${item.char}`);
    } else if (isShape) {
      for (const tag of rawTags) {
        if (tag.startsWith('shape-')) {
          relevanceKeys.add(`shape:${tag.replace('shape-', '')}`);
        }
        if (tag.startsWith('line-')) {
          relevanceKeys.add('shape:line');
        }
      }
      if (item.char === '○') relevanceKeys.add('shape:circle');
      if (item.char === '|') relevanceKeys.add('shape:line');
      if (item.char === '—') relevanceKeys.add('shape:line');
      if (item.char === '/') relevanceKeys.add('shape:line');
      if (item.char === '⌒') relevanceKeys.add('shape:arc');
      if (item.char === '⚡') relevanceKeys.add('shape:zigzag');
      if (item.char === '✚') relevanceKeys.add('shape:cross');
      fallbackTags.add('shape');
      fallbackTags.add('line');
      fallbackTags.add('circle');
      fallbackTags.add('arc');
      fallbackTags.add('zigzag');
      fallbackTags.add('cross');
    }

    for (const tag of rawTags) {
      const clean = tag.trim().toLowerCase();
      if (!clean) continue;
      fallbackTags.add(clean);
      if (/^[a-z]$/.test(clean)) relevanceKeys.add(`letter:${clean.toUpperCase()}`);
      if (/^[0-9]$/.test(clean)) relevanceKeys.add(`number:${clean}`);
      if (clean.startsWith('count-')) relevanceKeys.add(`count:${clean.replace('count-', '')}`);
      if (clean.startsWith('shape-')) relevanceKeys.add(`shape:${clean.replace('shape-', '')}`);
      if (/^[a-z]{2,}$/.test(clean)) relevanceKeys.add(`word:${clean}`);
    }

    relevanceKeys.add('ocean');
    fallbackTags.add('ocean');

    return {
      relevanceKeys: Array.from(relevanceKeys),
      fallbackTags: Array.from(fallbackTags),
      isLetter,
      isNumber,
      isShape,
    };
  }, [item]);

  const recommendedStickers = useMemo(
    () =>
      STICKERS.map((sticker) => {
        const normalizedTags = sticker.tags.map((tag) => tag.toLowerCase());
        const normalizedRelevance = sticker.relevance.map((tag) => tag.toLowerCase());
        let score = 0;
        for (const key of itemSignals.relevanceKeys) {
          const token = key.toLowerCase();
          if (normalizedRelevance.includes(token)) score += 40;
          if (token.startsWith('word:')) {
            const word = token.replace('word:', '');
            if (normalizedTags.includes(word)) score += 10;
          }
        }
        for (const tag of itemSignals.fallbackTags) {
          if (normalizedTags.includes(tag)) score += 6;
        }
        if (normalizedTags.includes('ocean')) score += 2;
        return { sticker, score };
      })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((entry) => entry.sticker),
    [itemSignals]
  );

  const finalRecommended = recommendedStickers.length > 0 ? recommendedStickers : STICKERS.slice(0, 6);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(currentImage || finalRecommended[0]?.src || STICKERS[0].src);
    if (itemSignals.isLetter) {
      speakLetterThenWord(item.char, item.phonics?.en || item.word);
      return;
    }
    if (itemSignals.isNumber) {
      speak(item.phonics?.zh || `数字${item.char}`, 'zh-CN', 0.56);
      window.setTimeout(() => speak(`${item.char}条小鱼在游泳`, 'zh-CN', 0.58), 380);
      return;
    }
    speak(`${item.word}也能配上对应的小贴纸`, 'zh-CN', 0.58);
  }, [isOpen, currentImage, item, finalRecommended, itemSignals]);

  const handleSelectSticker = (src: string, labelZh: string, phraseZh: string) => {
    setSelected(src);
    speak(phraseZh || `${labelZh}，好可爱`, 'zh-CN', 0.6);
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
          <p className="text-sm font-bold text-gray-500">给 {item.word} 选一个贴纸吧</p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-black text-ocean-800 mb-2">推荐贴纸</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {finalRecommended.map((option) => (
              <button
                key={`recommended-${option.id}`}
                onClick={() => handleSelectSticker(option.src, option.labelZh, option.phraseZh)}
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

        <p className="text-sm font-black text-ocean-800 mb-2">全部贴纸</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
          {STICKERS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectSticker(option.src, option.labelZh, option.phraseZh)}
              className={`rounded-xl border-2 p-2 bg-white transition-all active:scale-95 ${
                selected === option.src ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 hover:border-ocean-300'
              }`}
            >
              <img src={option.src} alt={option.labelZh} className="w-full h-16 object-contain" />
              <span className="text-xs font-bold text-gray-600">{option.labelZh}</span>
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

export default ImagePickerModal;
