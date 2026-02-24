import React from 'react';
import { DailyMission } from '../../logic/missions';
import { SharkConfig, SharkTheme } from '../../../types';
import FriendlyShark from '../../components/FriendlyShark';

interface DressUpAdventureProps {
  mission: DailyMission;
  practicedCount: number;
  totalCount: number;
  onBack: () => void;
  onOpenSettings: () => void;
  sharkConfig: SharkConfig;
  theme: SharkTheme;
  themeUpgradeLevel: number;
  onStartNode: () => void;
}

const DressUpAdventure: React.FC<DressUpAdventureProps> = ({
  mission,
  practicedCount,
  totalCount,
  onBack,
  onOpenSettings,
  sharkConfig,
  theme,
  themeUpgradeLevel,
  onStartNode,
}) => {
  const done = practicedCount >= totalCount;

  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-10 py-2">
          <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            🔙
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white">装扮冒险</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_0_rgba(0,0,0,0.12)] mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-24 h-20">
              <FriendlyShark className="w-full h-full" config={sharkConfig} theme={theme} upgradeLevel={themeUpgradeLevel} />
            </div>
            <div>
              <p className="text-2xl font-black text-ocean-900">今日冒险节点</p>
              <p className="text-sm font-bold text-gray-600">{mission.story}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {mission.items.map((item, index) => (
              <div
                key={`${item.type}-${item.char}-${index}`}
                className={`rounded-2xl py-3 text-center font-black text-2xl ${
                  index < practicedCount ? 'bg-sand text-ocean-900 ring-2 ring-yellow-400' : 'bg-ocean-100 text-ocean-700'
                }`}
              >
                {item.char}
              </div>
            ))}
          </div>

          <button
            onClick={onStartNode}
            className="w-full bg-ocean-500 text-white text-2xl font-black py-4 rounded-2xl shadow-lg active:translate-y-1 active:shadow-none"
          >
            {done ? '再玩一次' : '开始今日节点'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DressUpAdventure;
