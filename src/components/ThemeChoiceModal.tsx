import React from 'react';
import { SharkTheme } from '../../types';
import { getThemeUpgradeLevel, SHARK_THEME_ORDER, SHARK_THEME_PRESETS } from '../modules/dressup/sharkStyle';

interface ThemeChoiceModalProps {
  isOpen: boolean;
  currentTheme: SharkTheme;
  themePracticeCounts: Record<SharkTheme, number>;
  onChoose: (theme: SharkTheme) => void;
  onClose: () => void;
}

const ThemeChoiceModal: React.FC<ThemeChoiceModalProps> = ({
  isOpen,
  currentTheme,
  themePracticeCounts,
  onChoose,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[72] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black text-ocean-900 mb-2">今天当哪种鲨鱼？</h2>
        <p className="text-sm font-bold text-gray-500 mb-4">选一个喜欢的风格，马上换装</p>
        <div className="grid grid-cols-1 gap-3">
          {SHARK_THEME_ORDER.map((id) => {
            const preset = SHARK_THEME_PRESETS[id];
            const level = getThemeUpgradeLevel(themePracticeCounts[id]);
            return (
              <button
                key={id}
                onClick={() => onChoose(id)}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-95 ${
                  currentTheme === id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-ocean-900">
                    {preset.icon} {preset.label}
                  </span>
                  <span className="text-xs font-black text-ocean-600">升级 {level + 1}</span>
                </div>
                <p className="text-xs font-bold text-gray-500 mt-1">{preset.summary}</p>
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 bg-ocean-100 text-ocean-900 rounded-2xl py-3 font-black active:scale-95"
        >
          稍后再选
        </button>
      </div>
    </div>
  );
};

export default ThemeChoiceModal;
