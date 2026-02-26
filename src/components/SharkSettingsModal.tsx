import React from 'react';
import { SharkConfig, SharkTheme } from '../../types';
import FriendlyShark from './FriendlyShark';
import {
  createDefaultAccessories,
  getThemeUpgradeLevel,
  SHARK_ACCESSORY_OPTIONS_BY_SLOT,
  SHARK_ACCESSORY_SLOT_LABELS,
  SHARK_ACCESSORY_SLOT_ORDER,
  SHARK_COLOR_OPTIONS,
  SHARK_PALETTES,
  SHARK_THEME_ORDER,
  SHARK_THEME_PRESETS,
} from '../modules/dressup/sharkStyle';

interface SharkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SharkConfig;
  onChange: (config: SharkConfig) => void;
  theme: SharkTheme;
  themePracticeCount: number;
  onApplyTheme: (theme: SharkTheme) => void;
}

const SharkSettingsModal: React.FC<SharkSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  theme,
  themePracticeCount,
  onApplyTheme,
}) => {
  if (!isOpen) return null;
  const themeUpgradeLevel = getThemeUpgradeLevel(themePracticeCount);
  const safeAccessories = createDefaultAccessories(config.accessories);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-2 md:p-4 overflow-y-auto overscroll-contain">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-auto my-1 md:my-3 max-h-[calc(100dvh-0.5rem)] md:max-h-[calc(100dvh-1.5rem)] flex flex-col"
      >
        <div className="flex-none flex justify-between items-center px-4 md:px-6 py-4 border-b border-gray-100 bg-white rounded-t-3xl sticky top-0 z-10">
          <h2 className="text-2xl md:text-3xl font-black text-ocean-900">装扮鲨鱼</h2>
          <button onClick={onClose} className="text-2xl bg-gray-200 rounded-full w-10 h-10 hover:bg-gray-300">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          <div className="flex justify-center mb-4 md:mb-6 bg-ocean-100 rounded-2xl p-3 md:p-4">
            <div className="w-44 h-32 md:w-48 md:h-32">
              <FriendlyShark className="w-full h-full" config={config} theme={theme} upgradeLevel={themeUpgradeLevel} />
            </div>
          </div>

          <div className="space-y-5 md:space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-700 mb-2 md:mb-3">主题表达 (Theme)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SHARK_THEME_ORDER.map((id) => {
                  const preset = SHARK_THEME_PRESETS[id];
                  return (
                    <button
                      key={id}
                      onClick={() => onApplyTheme(id)}
                      className={`rounded-xl border-2 p-3 text-left transition-all active:scale-95 ${
                        theme === id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 hover:border-ocean-300'
                      }`}
                    >
                      <p className="text-sm md:text-base font-black text-ocean-900">
                        {preset.icon} {preset.label}
                      </p>
                      <p className="text-[11px] text-gray-500 font-bold mt-1">{preset.summary}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">练习会提升主题效果：渐变 → 泡泡尾迹 → 闪光徽章</p>
              <p className="text-xs text-ocean-700 mt-1 font-bold">
                当前主题练习 {themePracticeCount} 次，升级层级 {themeUpgradeLevel + 1}
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-700 mb-2 md:mb-3">颜色 (Color)</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2 md:gap-3 justify-items-center">
                {SHARK_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    title={color}
                    onClick={() => onChange({ ...config, color })}
                    className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full border-4 shadow-sm transform transition-transform active:scale-90 ${
                      config.color === color ? 'border-gray-800 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: SHARK_PALETTES[color].body }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-700 mb-2 md:mb-3">配件分类 (Accessory Slots)</h3>
              <div className="space-y-4">
                {SHARK_ACCESSORY_SLOT_ORDER.map((slot) => (
                  <div key={slot} className="rounded-2xl border border-gray-200 p-3">
                    <p className="text-sm md:text-base font-black text-ocean-900 mb-2">{SHARK_ACCESSORY_SLOT_LABELS[slot]}</p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 md:gap-3">
                      {SHARK_ACCESSORY_OPTIONS_BY_SLOT[slot].map((item) => (
                        <button
                          key={`${slot}:${item.id}`}
                          title={item.label}
                          onClick={() =>
                            onChange({
                              ...config,
                              accessories: {
                                ...safeAccessories,
                                [slot]: item.id,
                              },
                            })
                          }
                          className={`relative flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border-2 transition-all min-h-[72px] md:min-h-[84px] ${
                            safeAccessories[slot] === item.id
                              ? 'bg-ocean-100 border-ocean-500'
                              : 'border-gray-200 hover:border-ocean-300'
                          }`}
                        >
                          <span className="text-xl md:text-2xl mb-1">{item.icon}</span>
                          <span className="text-[11px] md:text-xs font-bold text-gray-600 leading-tight">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-none px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 bg-white rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full md:w-auto md:min-w-[180px] block mx-auto bg-ocean-500 text-white text-lg md:text-xl font-bold py-3 px-12 rounded-full shadow-lg hover:bg-ocean-600 active:translate-y-1 active:shadow-none"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharkSettingsModal;
