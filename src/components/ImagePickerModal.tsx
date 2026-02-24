import React, { useEffect, useState } from 'react';
import { LetterConfig } from '../../types';

const LOCAL_STICKER_OPTIONS: Array<{ id: string; label: string; src: string }> = [
  { id: 'apple', label: '苹果', src: '/stickers/apple.svg' },
  { id: 'starfish', label: '海星', src: '/stickers/starfish.svg' },
  { id: 'fish', label: '小鱼', src: '/stickers/fish.svg' },
  { id: 'shell', label: '贝壳', src: '/stickers/shell.svg' },
  { id: 'octopus', label: '章鱼', src: '/stickers/octopus.svg' },
  { id: 'rainbow', label: '彩虹', src: '/stickers/rainbow.svg' },
];

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
  const [selected, setSelected] = useState<string>(currentImage || LOCAL_STICKER_OPTIONS[0].src);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(currentImage || LOCAL_STICKER_OPTIONS[0].src);
  }, [isOpen, currentImage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg">
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

        <div className="grid grid-cols-3 gap-3 mb-5">
          {LOCAL_STICKER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.src)}
              className={`rounded-xl border-2 p-2 bg-white transition-all active:scale-95 ${
                selected === option.src ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 hover:border-ocean-300'
              }`}
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

export default ImagePickerModal;
