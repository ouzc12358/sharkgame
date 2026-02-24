import React from 'react';
import { DifficultyMode } from '../../types';

interface ParentZoneProps {
  isOpen: boolean;
  onClose: () => void;
  ttsEnabled: boolean;
  soundsEnabled: boolean;
  difficultyMode: DifficultyMode;
  onToggleTts: (enabled: boolean) => void;
  onToggleSounds: (enabled: boolean) => void;
  onChangeDifficulty: (mode: DifficultyMode) => void;
  todayMinutes: number;
  todayItems: string[];
  streak: number;
  suggestions: string[];
  reviewReminders: string[];
}

const DIFFICULTY_OPTIONS: Array<{ id: DifficultyMode; label: string }> = [
  { id: 'guide', label: '引导' },
  { id: 'practice', label: '练习' },
  { id: 'challenge', label: '挑战' },
];

const ParentZone: React.FC<ParentZoneProps> = ({
  isOpen,
  onClose,
  ttsEnabled,
  soundsEnabled,
  difficultyMode,
  onToggleTts,
  onToggleSounds,
  onChangeDifficulty,
  todayMinutes,
  todayItems,
  streak,
  suggestions,
  reviewReminders,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-5 md:p-7 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-3xl font-black text-ocean-900">Parent Zone</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-200 text-2xl active:scale-95">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="rounded-2xl border border-gray-200 p-4">
            <h3 className="text-lg font-black text-ocean-900 mb-3">开关</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-bold text-gray-700">
                <span>TTS 语音</span>
                <input
                  type="checkbox"
                  checked={ttsEnabled}
                  onChange={(event) => onToggleTts(event.target.checked)}
                  className="w-5 h-5"
                />
              </label>
              <label className="flex items-center justify-between text-sm font-bold text-gray-700">
                <span>音效</span>
                <input
                  type="checkbox"
                  checked={soundsEnabled}
                  onChange={(event) => onToggleSounds(event.target.checked)}
                  className="w-5 h-5"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <h3 className="text-lg font-black text-ocean-900 mb-3">难度</h3>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onChangeDifficulty(option.id)}
                  className={`rounded-xl py-2 font-black text-sm border ${
                    difficultyMode === option.id
                      ? 'bg-ocean-500 text-white border-ocean-500'
                      : 'bg-white text-ocean-900 border-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="rounded-2xl border border-gray-200 p-4">
            <h3 className="text-lg font-black text-ocean-900 mb-2">今日练习</h3>
            <p className="text-sm font-bold text-gray-700 mb-1">时长：{todayMinutes} 分钟</p>
            <p className="text-sm font-bold text-gray-700 mb-2">连击：{streak} 天</p>
            <div className="flex flex-wrap gap-2">
              {todayItems.length > 0 ? (
                todayItems.map((item) => (
                  <span key={item} className="text-xs font-black px-2 py-1 rounded-full bg-ocean-100 text-ocean-800">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs font-bold text-gray-500">今天还没开始练习</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <h3 className="text-lg font-black text-ocean-900 mb-2">建议练习</h3>
            <div className="space-y-1">
              {suggestions.length > 0 ? (
                suggestions.map((text, idx) => (
                  <p key={`${text}-${idx}`} className="text-sm font-bold text-gray-700">
                    • {text}
                  </p>
                ))
              ) : (
                <p className="text-sm font-bold text-gray-500">继续保持，今天状态很好</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-4">
          <h3 className="text-lg font-black text-ocean-900 mb-2">间隔复习提醒</h3>
          <div className="space-y-1">
            {reviewReminders.length > 0 ? (
              reviewReminders.map((text, idx) => (
                <p key={`${text}-${idx}`} className="text-sm font-bold text-gray-700">
                  • {text}
                </p>
              ))
            ) : (
              <p className="text-sm font-bold text-gray-500">暂无提醒，按日常任务节奏继续即可</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentZone;
