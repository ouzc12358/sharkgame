import React, { useEffect, useMemo, useState } from 'react';
import { SharkConfig, SharkTheme } from '../../types';
import { speak } from '../logic/audio';
import FriendlyShark from './FriendlyShark';

interface SharkRewardProps {
  isOpen: boolean;
  seed: number;
  sharkConfig: SharkConfig;
  theme: SharkTheme;
  themeUpgradeLevel: number;
  onClose: () => void;
}

const ANIMATION_TYPES = ['celebration-swim', 'celebration-spin', 'celebration-jump', 'celebration-zigzag'] as const;

const SharkReward: React.FC<SharkRewardProps> = ({
  isOpen,
  seed,
  sharkConfig,
  theme,
  themeUpgradeLevel,
  onClose,
}) => {
  const [animationType, setAnimationType] = useState<(typeof ANIMATION_TYPES)[number]>(ANIMATION_TYPES[0]);
  const confetti = useMemo(
    () =>
      Array.from({ length: 84 }).map((_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.22,
        duration: Math.random() * 1.9 + 1.7,
        color: ['#fb7185', '#fcd34d', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'][Math.floor(Math.random() * 6)],
      })),
    [seed]
  );

  useEffect(() => {
    if (!isOpen) return;
    setAnimationType(ANIMATION_TYPES[Math.floor(Math.random() * ANIMATION_TYPES.length)]);
    speak('太棒了！', 'zh-CN', 0.58, { interrupt: false });
    const timer = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timer);
  }, [isOpen, seed, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-hidden pointer-events-none">
      <style>{`
        @keyframes reward-confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(115vh) rotate(680deg); opacity: 0; }
        }
        @keyframes celebration-swim {
          0% { transform: translate(-100vw, 80px) rotate(-15deg) scale(0.55); opacity: 0; }
          20% { transform: translate(-45vw, 35px) rotate(10deg) scale(0.85); opacity: 1; }
          50% { transform: translate(0, 0) rotate(0deg) scale(1.45); opacity: 1; }
          80% { transform: translate(45vw, 35px) rotate(-10deg) scale(0.85); opacity: 1; }
          100% { transform: translate(100vw, 80px) rotate(15deg) scale(0.55); opacity: 0; }
        }
        @keyframes celebration-spin {
          0% { transform: scale(0.1) rotate(0deg); opacity: 0; }
          30% { transform: scale(1.15) rotate(120deg); opacity: 1; }
          60% { transform: scale(1.35) rotate(290deg); opacity: 1; }
          100% { transform: scale(0.15) rotate(360deg); opacity: 0; }
        }
        @keyframes celebration-jump {
          0% { transform: translateY(95vh) scale(0.45); opacity: 0; }
          35% { transform: translateY(0) scale(1.3); opacity: 1; }
          55% { transform: translateY(-26px) scale(1.42); opacity: 1; }
          100% { transform: translateY(95vh) scale(0.45); opacity: 0; }
        }
        @keyframes celebration-zigzag {
          0% { transform: translate(-95vw, 0) rotate(0deg) scale(0.75); opacity: 0; }
          25% { transform: translate(-40vw, -90px) rotate(14deg) scale(1); opacity: 1; }
          55% { transform: translate(0, 10px) rotate(-14deg) scale(1.2); opacity: 1; }
          80% { transform: translate(40vw, -80px) rotate(14deg) scale(1); opacity: 1; }
          100% { transform: translate(95vw, 0) rotate(0deg) scale(0.75); opacity: 0; }
        }
        @keyframes reward-text-pop {
          0% { transform: scale(0); opacity: 0; }
          55% { transform: scale(1.2); opacity: 1; }
          80% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {confetti.map((particle) => (
        <div
          key={`${seed}-${particle.id}`}
          className="absolute w-3 h-3 md:w-4 md:h-4 rounded-sm shadow-sm opacity-90"
          style={{
            left: `${particle.left}%`,
            top: '-6%',
            backgroundColor: particle.color,
            animation: `reward-confetti-fall ${particle.duration}s linear ${particle.delay}s infinite`,
          }}
        />
      ))}

      <div
        key={`${seed}-${animationType}`}
        className="absolute z-20 w-64 h-64 md:w-96 md:h-96"
        style={{ animation: `${animationType} 3.1s ease-in-out forwards` }}
      >
        <FriendlyShark className="w-full h-full drop-shadow-2xl" config={sharkConfig} theme={theme} upgradeLevel={themeUpgradeLevel} />
      </div>

      <div
        className="absolute z-30 text-5xl md:text-7xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.45)]"
        style={{ animation: 'reward-text-pop 0.58s cubic-bezier(0.2,0.9,0.2,1.2) 1.2s forwards', opacity: 0 }}
      >
        小鲨鱼庆祝啦!
      </div>
    </div>
  );
};

export default SharkReward;
