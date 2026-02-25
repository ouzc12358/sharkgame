import React from 'react';
import { DressupMissionPoolMode } from '../../../types';
import FriendlyShark from '../../components/FriendlyShark';
import { SharkConfig, SharkTheme } from '../../../types';

interface HomeScreenProps {
  onOpenShapes: () => void;
  onOpenNumbers: () => void;
  onOpenLetters: () => void;
  onOpenDressup: () => void;
  onOpenSkate: () => void;
  onOpenSettings: () => void;
  streak: number;
  todayCompleted: boolean;
  dressupPoolMode: DressupMissionPoolMode;
  sharkConfig: SharkConfig;
  theme: SharkTheme;
  themeUpgradeLevel: number;
}

const TILE_BASE =
  'rounded-3xl bg-white p-5 shadow-[0_8px_0_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-none transition-all text-left';

const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenShapes,
  onOpenNumbers,
  onOpenLetters,
  onOpenDressup,
  onOpenSkate,
  onOpenSettings,
  streak,
  todayCompleted,
  dressupPoolMode,
  sharkConfig,
  theme,
  themeUpgradeLevel,
}) => {
  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-10 py-2">
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-md">鲨鱼学习乐园</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
            aria-label="open settings"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="bg-white/95 rounded-3xl p-4 mb-4 md:mb-6 flex items-center gap-4">
          <div className="w-20 h-16 md:w-24 md:h-20 shrink-0">
            <FriendlyShark className="w-full h-full" config={sharkConfig} theme={theme} upgradeLevel={themeUpgradeLevel} />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-black text-ocean-900">今天和小鲨鱼玩 5-8 分钟</p>
            <p className="text-sm md:text-base text-gray-600 font-bold">{todayCompleted ? '今日冒险已完成，继续自由练习也很棒' : '先选一个游戏块开始吧'}</p>
            <p className="text-xs md:text-sm text-ocean-700 font-black mt-1">🔥 连续 {streak} 天</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 pb-8">
          <button onClick={onOpenShapes} className={TILE_BASE}>
            <div className="text-5xl mb-2">🧩</div>
            <p className="text-3xl font-black text-ocean-900">线条形状</p>
            <p className="text-base font-bold text-gray-500 mt-1">Line & Shapes</p>
          </button>

          <button onClick={onOpenNumbers} className={TILE_BASE}>
            <div className="text-5xl mb-2">🔢</div>
            <p className="text-3xl font-black text-ocean-900">数字</p>
            <p className="text-base font-bold text-gray-500 mt-1">Numbers</p>
          </button>

          <button onClick={onOpenLetters} className={TILE_BASE}>
            <div className="text-5xl mb-2">🔤</div>
            <p className="text-3xl font-black text-ocean-900">字母</p>
            <p className="text-base font-bold text-gray-500 mt-1">Letters</p>
          </button>

          <button onClick={onOpenDressup} className={TILE_BASE}>
            <div className="text-5xl mb-2">🎨</div>
            <p className="text-3xl font-black text-ocean-900">换装大冒险</p>
            <p className="text-base font-bold text-gray-500 mt-1">Dress-up Adventure</p>
            <p className="text-xs font-black text-ocean-700 mt-2">
              当前挑战池：
              {dressupPoolMode === 'numbers' ? '数字' : dressupPoolMode === 'letters' ? '字母' : '字母+数字'}
            </p>
          </button>

          <button onClick={onOpenSkate} className={TILE_BASE}>
            <div className="text-5xl mb-2">🛹</div>
            <p className="text-3xl font-black text-ocean-900">滑板大冒险</p>
            <p className="text-base font-bold text-gray-500 mt-1">Skate Adventure</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
