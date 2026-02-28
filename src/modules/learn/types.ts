import {
  DifficultyMode,
  LetterConfig,
  LetterProgress,
  SharkConfig,
  SharkTheme,
} from '../../../types';
import { TraceAttempt, TraceMetricLevels } from '../../logic/metrics';
import { LearningCategory } from '../../logic/tracing';

export interface LearningModeProps {
  progress: LetterProgress;
  customImages: Record<string, string>;
  customImageVoices: Record<string, string>;
  difficultyMode: DifficultyMode;
  sharkConfig: SharkConfig;
  theme: SharkTheme;
  themeUpgradeLevel: number;
  onBack: () => void;
  onOpenSettings: () => void;
  onRequestComplete: (item: LetterConfig, category: LearningCategory, minutesDelta: number) => void;
  onRequestAttempt: (item: LetterConfig, category: LearningCategory, attempt: TraceAttempt) => void;
  getProgressLevels: (item: LetterConfig, category: LearningCategory) => TraceMetricLevels;
  onUpdateImage: (char: string, image: string, voiceLabel?: string) => void;
}
