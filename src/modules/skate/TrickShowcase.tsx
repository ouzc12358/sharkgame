import React, { useMemo } from 'react';
import { SharkConfig, SharkTheme } from '../../../types';
import FriendlyShark from '../../components/FriendlyShark';
import { SkateTrick } from './SkateTricks';

interface TrickShowcaseProps {
  isOpen: boolean;
  trick: SkateTrick;
  sharkConfig: SharkConfig;
  theme: SharkTheme;
  themeUpgradeLevel: number;
  onClose: () => void;
}

const TrickShowcase: React.FC<TrickShowcaseProps> = ({
  isOpen,
  trick,
  sharkConfig,
  theme,
  themeUpgradeLevel,
  onClose,
}) => {
  const keyframes = useMemo(() => {
    const steps = trick.animation.keyframes;
    const count = steps.length - 1;
    return steps
      .map((frame, index) => {
        const percent = count <= 0 ? 0 : Math.round((index / count) * 100);
        const scale = frame.scale ?? 1;
        return `${percent}% { transform: translate(${frame.x}px, ${frame.y}px) rotate(${frame.rotate}deg) scale(${scale}); }`;
      })
      .join('\n');
  }, [trick]);

  if (!isOpen) return null;

  const animationName = `skate-trick-${trick.id}`.replace(/[^a-zA-Z0-9-_]/g, '_');

  return (
    <div className="fixed inset-0 z-[76] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
      <style>{`
        @keyframes ${animationName} {
          ${keyframes}
        }
      `}</style>
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-3xl font-black text-ocean-900">{trick.nameZh}</p>
            <p className="text-sm font-bold text-gray-500">{trick.nameEn}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 text-2xl">
            ✕
          </button>
        </div>

        <p className="text-base font-bold text-gray-600 mb-4">{trick.prompt}</p>

        <div className="bg-ocean-50 rounded-3xl p-4 relative h-64 overflow-hidden">
          <div className="absolute bottom-8 left-6 right-6 h-2 bg-ocean-200 rounded-full" />
          <div className="absolute bottom-[42px] left-0 right-0 flex justify-center">
            <div
              style={{
                animation: `${animationName} ${trick.animation.durationMs}ms ease-in-out infinite`,
              }}
              className="relative"
            >
              <div className="w-48 h-36">
                <FriendlyShark
                  className="w-full h-full"
                  config={sharkConfig}
                  theme={theme}
                  upgradeLevel={themeUpgradeLevel}
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 border-2 border-slate-900" />
              <div className="absolute -bottom-1 left-[38%] w-3 h-3 rounded-full bg-slate-800" />
              <div className="absolute -bottom-1 left-[58%] w-3 h-3 rounded-full bg-slate-800" />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 bg-ocean-500 text-white text-xl font-black py-3 rounded-2xl shadow-lg active:translate-y-1 active:shadow-none"
        >
          再来一个动作
        </button>
      </div>
    </div>
  );
};

export default TrickShowcase;
