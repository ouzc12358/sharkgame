import React, { useMemo, useRef, useState } from 'react';
import { LetterConfig } from '../../../types';
import { speak } from '../../logic/audio';
import { LearningCategory } from '../../logic/tracing';
import TracePracticeView from '../learn/TracePracticeView';
import { LearningModeProps } from '../learn/types';
import {
  HANZI_BASIC_STROKES,
  HANZI_CHARACTER_PAIRS,
  HANZI_NUMBER_CHARACTERS,
  HANZI_WRITING_ITEMS,
  HanziCharacterPair,
  HanziWritingItem,
} from './hanziWritingData';

const CATEGORY: LearningCategory = 'hanzi';

interface HanziGroupProps {
  title: string;
  icon: string;
  items: HanziWritingItem[];
  progress: LearningModeProps['progress'];
  onStart: (item: HanziWritingItem) => void;
}

const HanziGroup: React.FC<HanziGroupProps> = ({
  title,
  icon,
  items,
  progress,
  onStart,
}) => (
  <section className="mb-5">
    <h2 className="text-xl md:text-2xl font-black text-white mb-3">
      {icon} {title}
    </h2>
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {items.map((item) => {
        const done = Boolean(progress[item.char]);
        return (
          <div
            key={item.char}
            className={`relative aspect-square rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.12)] ${
              done ? 'bg-sand ring-4 ring-yellow-300' : 'bg-white'
            }`}
          >
            <button
              onClick={() => onStart(item)}
              aria-label={`练习${item.word}`}
              className="absolute inset-0 w-full h-full rounded-2xl p-2 active:translate-y-1"
            >
              <span className="block text-4xl md:text-5xl font-black text-ocean-900">
                {item.char}
              </span>
              <span className="block text-sm md:text-base font-black text-gray-500 mt-1">
                {item.word}
              </span>
              {done && <span className="block text-sm mt-1">🦈</span>}
            </button>
            <button
              onClick={() => speak(`${item.word}，${item.phonics?.zh || ''}`, 'zh-CN', 0.58)}
              aria-label={`听${item.word}`}
              className="absolute top-1 right-1 z-10 w-8 h-8 rounded-full bg-ocean-100 text-sm active:scale-90"
            >
              🔊
            </button>
          </div>
        );
      })}
    </div>
  </section>
);

interface HanziPairGroupProps {
  pairs: HanziCharacterPair[];
  progress: LearningModeProps['progress'];
  onStart: (item: HanziWritingItem) => void;
}

const HanziPairGroup: React.FC<HanziPairGroupProps> = ({ pairs, progress, onStart }) => (
  <section className="mb-5">
    <h2 className="text-xl md:text-2xl font-black text-white mb-1">🫶 一对好朋友</h2>
    <p className="text-sm md:text-base font-bold text-white/80 mb-3">
      把意思相反或有关联的字放在一起
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {pairs.map((pair) => (
        <div
          key={pair.id}
          className="rounded-3xl bg-ocean-100/95 p-3 shadow-[0_6px_0_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-lg font-black text-ocean-900">{pair.label}</p>
            <span className="text-xl">{pair.icon}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pair.items.map((item) => {
              const done = Boolean(progress[item.char]);
              return (
                <div
                  key={item.char}
                  className={`relative min-h-36 rounded-2xl ${
                    done ? 'bg-sand ring-4 ring-yellow-300' : 'bg-white'
                  }`}
                >
                  <button
                    onClick={() => onStart(item)}
                    className="absolute inset-0 w-full h-full rounded-2xl p-3 active:scale-95"
                    aria-label={`练习${item.word}`}
                  >
                    <span className="block text-6xl font-black text-ocean-900">
                      {item.char}
                    </span>
                    <span className="block text-sm font-black text-gray-500 mt-1">
                      {item.pinyin}
                    </span>
                    {done && <span className="block text-sm mt-1">🦈</span>}
                  </button>
                  <button
                    onClick={() =>
                      speak(`${item.word}，${item.phonics?.zh || ''}`, 'zh-CN', 0.58)
                    }
                    aria-label={`听${item.word}`}
                    className="absolute top-1 right-1 z-10 w-8 h-8 rounded-full bg-ocean-100 text-sm active:scale-90"
                  >
                    🔊
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const HanziWritingMode: React.FC<LearningModeProps> = ({
  progress,
  difficultyMode,
  sharkConfig,
  theme,
  themeUpgradeLevel,
  onBack,
  onOpenSettings,
  onRequestComplete,
  onRequestAttempt,
  getProgressLevels,
}) => {
  const [currentItem, setCurrentItem] = useState<LetterConfig | null>(null);
  const [showChooseList, setShowChooseList] = useState(false);
  const traceStartRef = useRef(Date.now());
  const recommended = useMemo(
    () => HANZI_WRITING_ITEMS.find((item) => !progress[item.char]) || HANZI_WRITING_ITEMS[0],
    [progress]
  );

  const handleStart = (item: LetterConfig) => {
    traceStartRef.current = Date.now();
    setCurrentItem(item);
  };

  if (currentItem) {
    return (
      <TracePracticeView
        item={currentItem}
        category={CATEGORY}
        onBack={() => setCurrentItem(null)}
        onComplete={() => {
          const minutesDelta = Math.max(1 / 6, (Date.now() - traceStartRef.current) / 60000);
          onRequestComplete(currentItem, CATEGORY, minutesDelta);
          setCurrentItem(null);
        }}
        sharkConfig={sharkConfig}
        customImage={null}
        customImageVoice={currentItem.phonics?.zh || null}
        onUpdateImage={() => undefined}
        progressLevels={getProgressLevels(currentItem, CATEGORY)}
        onAttemptAnalyzed={(attempt) => onRequestAttempt(currentItem, CATEGORY, attempt)}
        difficultyMode={difficultyMode}
        theme={theme}
        themeUpgradeLevel={themeUpgradeLevel}
        allowStickerCustomization={false}
      />
    );
  }

  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-20 py-2">
          <button
            onClick={onBack}
            className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95"
          >
            🔙
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white">汉字书写</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95"
            aria-label="打开设置"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_0_rgba(0,0,0,0.12)] mb-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">🖌️</span>
            <div>
              <p className="text-xl md:text-2xl font-black text-ocean-900">
                从小笔画到有意思的汉字
              </p>
              <p className="text-sm font-bold text-gray-500">
                数字排好队，好朋友放一起
              </p>
            </div>
          </div>

          <button
            onClick={() => handleStart(recommended)}
            className="w-full bg-ocean-500 text-white text-3xl font-black py-5 rounded-2xl shadow-lg active:translate-y-1 active:shadow-none"
          >
            开始
          </button>

          <button
            onClick={() => setShowChooseList((value) => !value)}
            className="w-full mt-3 bg-ocean-100 text-ocean-900 text-xl font-black py-4 rounded-2xl active:scale-95"
          >
            {showChooseList ? '收起选择' : '自己选一个'}
          </button>

          {!showChooseList && (
            <button
              onClick={() => handleStart(recommended)}
              className="w-full mt-3 rounded-2xl border-2 border-ocean-200 bg-ocean-50 px-4 py-3 text-left"
            >
              <p className="text-sm font-black text-ocean-700">下一笔</p>
              <div className="flex items-center justify-between">
                <span className="text-6xl font-black text-ocean-900">{recommended.char}</span>
                <span className="text-xl font-black text-gray-500">
                  {recommended.word} · {recommended.pinyin}
                </span>
              </div>
            </button>
          )}
        </div>

        {showChooseList && (
          <div className="pb-8">
            <HanziGroup
              title="小笔画"
              icon="💧"
              items={HANZI_BASIC_STROKES}
              progress={progress}
              onStart={handleStart}
            />
            <HanziGroup
              title="一到十"
              icon="🔟"
              items={HANZI_NUMBER_CHARACTERS}
              progress={progress}
              onStart={handleStart}
            />
            <HanziPairGroup
              pairs={HANZI_CHARACTER_PAIRS}
              progress={progress}
              onStart={handleStart}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HanziWritingMode;
