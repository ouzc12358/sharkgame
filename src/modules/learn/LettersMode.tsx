import React, { useRef, useState } from 'react';
import { LETTER_ITEMS } from '../../../constants';
import { LetterConfig } from '../../../types';
import { LearningCategory } from '../../logic/tracing';
import LearningModeBase from './LearningModeBase';
import TracePracticeView from './TracePracticeView';
import { LearningModeProps } from './types';

const CATEGORY: LearningCategory = 'letters';

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

  return (
    <LearningModeBase
      title="字母"
      subtitle="写一个字母，给小鲨鱼一点力量"
      icon="🔤"
      items={LETTER_ITEMS}
      progress={progress}
      onBack={onBack}
      onOpenSettings={onOpenSettings}
      onStartItem={handleStart}
    />
  );
};

export default LettersMode;
