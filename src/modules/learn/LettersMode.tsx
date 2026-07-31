import React, { useRef, useState } from 'react';
import { LETTER_ITEMS, LOWERCASE_LETTER_ITEMS } from '../../../constants';
import { LetterConfig } from '../../../types';
import { speakLetterThenWord } from '../../logic/audio';
import { LearningCategory } from '../../logic/tracing';
import LearningModeBase from './LearningModeBase';
import TracePracticeView from './TracePracticeView';
import { LearningModeProps } from './types';

const CATEGORY: LearningCategory = 'letters';
const LOWERCASE_BY_LETTER = new Map(
  LOWERCASE_LETTER_ITEMS.map((item) => [item.char.toUpperCase(), item])
);

const LettersMode: React.FC<LearningModeProps> = ({
  progress,
  customImages,
  customImageVoices,
  difficultyMode,
  sharkConfig,
  theme,
  themeUpgradeLevel,
  onBack,
  onOpenSettings,
  onRequestComplete,
  onRequestAttempt,
  getProgressLevels,
  onUpdateImage,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<LetterConfig | null>(null);
  const [currentItem, setCurrentItem] = useState<LetterConfig | null>(null);
  const traceStartRef = useRef<number>(Date.now());

  const handleStart = (item: LetterConfig) => {
    setCurrentItem(item);
    traceStartRef.current = Date.now();
  };

  if (currentItem) {
    return (
      <TracePracticeView
        item={currentItem}
        category={CATEGORY}
        onBack={() => setCurrentItem(null)}
        onComplete={() => {
          const now = Date.now();
          const minutesDelta = Math.max(1 / 6, (now - traceStartRef.current) / 60000);
          onRequestComplete(currentItem, CATEGORY, minutesDelta);
          setCurrentItem(null);
        }}
        sharkConfig={sharkConfig}
        customImage={customImages[currentItem.char] || null}
        customImageVoice={customImageVoices[currentItem.char] || null}
        onUpdateImage={(img, voiceLabel) => onUpdateImage(currentItem.char, img, voiceLabel)}
        progressLevels={getProgressLevels(currentItem, CATEGORY)}
        onAttemptAnalyzed={(attempt) => onRequestAttempt(currentItem, CATEGORY, attempt)}
        difficultyMode={difficultyMode}
        theme={theme}
        themeUpgradeLevel={themeUpgradeLevel}
      />
    );
  }

  if (selectedLetter) {
    const lowercaseItem = LOWERCASE_BY_LETTER.get(selectedLetter.char);
    const choices = lowercaseItem ? [selectedLetter, lowercaseItem] : [selectedLetter];

    return (
      <div className="h-full bg-ocean-500 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6 min-h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedLetter(null)}
              className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95"
              aria-label="返回字母列表"
            >
              🔙
            </button>
            <h1 className="text-3xl md:text-5xl font-black text-white">
              {selectedLetter.char} 和 {selectedLetter.char.toLowerCase()}
            </h1>
            <button
              onClick={onOpenSettings}
              className="bg-white p-3 rounded-full shadow-lg active:scale-95"
              aria-label="打开设置"
            >
              <span className="text-3xl">⚙️</span>
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-5 md:p-8 shadow-[0_8px_0_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-center gap-4 mb-5">
              <span className="text-6xl">{selectedLetter.emoji}</span>
              <div>
                <p className="text-2xl md:text-3xl font-black text-ocean-900">
                  先选一个写
                </p>
                <button
                  onClick={() => speakLetterThenWord(selectedLetter.char, selectedLetter.word)}
                  className="mt-2 rounded-full bg-ocean-100 px-5 py-2 text-lg font-black text-ocean-800 active:scale-95"
                >
                  🔊 听一听
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {choices.map((choice) => {
                const isUppercase = choice.char === choice.char.toUpperCase();
                const done = Boolean(progress[choice.char]);
                return (
                  <button
                    key={choice.char}
                    onClick={() => handleStart(choice)}
                    className={`min-h-56 md:min-h-72 rounded-3xl border-4 p-4 shadow-[0_7px_0_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-none ${
                      done
                        ? 'border-yellow-300 bg-sand'
                        : isUppercase
                          ? 'border-sky-200 bg-sky-50'
                          : 'border-teal-200 bg-teal-50'
                    }`}
                    aria-label={`练习${isUppercase ? '大写' : '小写'}字母${choice.char}`}
                  >
                    <span className="block text-base md:text-xl font-black text-gray-500">
                      {isUppercase ? '大写' : '小写'}
                    </span>
                    <span className="block text-8xl md:text-9xl leading-none font-black text-ocean-900 my-3">
                      {choice.char}
                    </span>
                    <span className="block text-xl md:text-2xl font-black text-ocean-700">
                      跟着泡泡写
                    </span>
                    {done && <span className="block text-2xl mt-2">🦈✨</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LearningModeBase
      title="字母"
      subtitle="写一个字母，给小鲨鱼一点力量"
      icon="🔤"
      items={LETTER_ITEMS}
      progress={progress}
      onBack={onBack}
      onOpenSettings={onOpenSettings}
      onStartItem={setSelectedLetter}
    />
  );
};

export default LettersMode;
