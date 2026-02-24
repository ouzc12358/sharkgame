import React, { useRef, useState } from 'react';
import { SHAPE_ITEMS } from '../../../constants';
import { LetterConfig } from '../../../types';
import { LearningCategory } from '../../logic/tracing';
import LearningModeBase from './LearningModeBase';
import TracePracticeView from './TracePracticeView';
import { LearningModeProps } from './types';

const CATEGORY: LearningCategory = 'shapes';

const ShapesMode: React.FC<LearningModeProps> = ({
  progress,
  customImages,
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
        onUpdateImage={(img) => onUpdateImage(currentItem.char, img)}
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
      title="线条形状"
      subtitle="先练线条，再写字会更轻松"
      icon="🧩"
      items={SHAPE_ITEMS}
      progress={progress}
      onBack={onBack}
      onOpenSettings={onOpenSettings}
      onStartItem={handleStart}
    />
  );
};

export default ShapesMode;
