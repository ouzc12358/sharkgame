import React, { useMemo, useState } from 'react';
import { LetterConfig, LetterProgress } from '../../../types';
import { speakItemPrimary } from '../../logic/audio';

interface LearningModeBaseProps {
  title: string;
  subtitle: string;
  icon: string;
  items: LetterConfig[];
  progress: LetterProgress;
  onBack: () => void;
  onOpenSettings: () => void;
  onStartItem: (item: LetterConfig) => void;
}

const LearningModeBase: React.FC<LearningModeBaseProps> = ({
  title,
  subtitle,
  icon,
  items,
  progress,
  onBack,
  onOpenSettings,
  onStartItem,
}) => {
  const [showChooseList, setShowChooseList] = useState(false);

  const recommended = useMemo(
    () => items.find((item) => !progress[item.char]) || items[0],
    [items, progress]
  );

  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-10 py-2">
          <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            🔙
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white">{title}</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_0_rgba(0,0,0,0.12)] mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{icon}</span>
            <div>
              <p className="text-xl md:text-2xl font-black text-ocean-900">{subtitle}</p>
              <p className="text-sm font-bold text-gray-500">每次一个小动作，慢慢来</p>
            </div>
          </div>

          <button
            onClick={() => onStartItem(recommended)}
            className="w-full bg-ocean-500 text-white text-3xl font-black py-5 rounded-2xl shadow-lg active:translate-y-1 active:shadow-none"
          >
            开始
          </button>

          <button
            onClick={() => setShowChooseList((prev) => !prev)}
            className="w-full mt-3 bg-ocean-100 text-ocean-900 text-xl font-black py-4 rounded-2xl active:scale-95"
          >
            {showChooseList ? '收起选择' : '自己选一个'}
          </button>

          {!showChooseList && recommended && (
            <button
              onClick={() => onStartItem(recommended)}
              className="w-full mt-3 rounded-2xl border-2 border-ocean-200 bg-ocean-50 px-4 py-4 text-left"
            >
              <p className="text-sm font-black text-ocean-700">推荐下一项</p>
              <div className="flex items-center justify-between">
                <span className="text-5xl font-black text-ocean-900">{recommended.char}</span>
                <span className="text-xl font-bold text-gray-500">{recommended.word}</span>
              </div>
            </button>
          )}
        </div>

        {showChooseList && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pb-8">
            {items.map((item) => {
              const done = Boolean(progress[item.char]);
              return (
                <button
                  key={item.char}
                  onClick={() => onStartItem(item)}
                  className={`relative rounded-2xl aspect-square p-3 shadow-[0_6px_0_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-none ${
                    done ? 'bg-sand ring-4 ring-yellow-400' : 'bg-white'
                  }`}
                >
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      speakItemPrimary(item);
                    }}
                    className="absolute top-1 right-1 w-7 h-7 rounded-full bg-ocean-100 text-sm"
                  >
                    🔊
                  </button>
                  <p className="text-5xl font-black text-ocean-900 mt-2">{item.char}</p>
                  {done && <p className="text-lg mt-1">🦈</p>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningModeBase;
