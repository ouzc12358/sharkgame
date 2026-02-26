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

  const itemTags = useMemo(
    () =>
      [
        item.char,
        item.char.toUpperCase(),
        item.char.toLowerCase(),
        item.word.toLowerCase(),
        ...(item.stickerTags || []),
      ].map((tag) => tag.trim()),
    [item]
  );

  const recommendedStickers = useMemo(
    () =>
      STICKERS.map((sticker) => {
        const normalizedTags = sticker.tags.map((tag) => tag.toLowerCase());
        let score = 0;
        for (const rawTag of itemTags) {
          const tag = rawTag.toLowerCase();
          if (!tag) continue;
          if (normalizedTags.includes(tag)) score += 5;
          else if (normalizedTags.some((candidate) => candidate.includes(tag) || tag.includes(candidate))) score += 2;
        }
        if (normalizedTags.includes('ocean')) score += 1;
        return { sticker, score };
      })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((entry) => entry.sticker),
    [itemTags]
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelected(currentImage || recommendedStickers[0]?.src || STICKERS[0].src);
    if (/^[A-Z]$/.test(item.char)) {
      speakLetterThenWord(item.char, item.phonics?.en || item.word);
      return;
    }
    if (/^[0-9]$/.test(item.char)) {
      speak(item.phonics?.zh || `数字${item.char}`, 'zh-CN', 0.56);
      window.setTimeout(() => speak(`${item.char}条小鱼在游泳`, 'zh-CN', 0.58), 380);
      return;
    }
    speak(`${item.word}像小泡泡一样`, 'zh-CN', 0.58);
  }, [isOpen, currentImage, item, recommendedStickers]);

  const handleSelectSticker = (src: string, labelZh: string) => {
    setSelected(src);
    speak(`${labelZh}，好可爱`, 'zh-CN', 0.6);
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
            {recommendedStickers.map((option) => (
              <button
                key={`recommended-${option.id}`}
                onClick={() => handleSelectSticker(option.src, option.labelZh)}
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
              onClick={() => handleSelectSticker(option.src, option.labelZh)}
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
