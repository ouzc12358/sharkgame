import React from 'react';
import { DailyMission, missionItemKey, MissionItem } from '../logic/missions';

interface MissionFlowProps {
  mission: DailyMission;
  practicedItemKeys: string[];
  isCompletedToday: boolean;
  streak: number;
  diaryStickers: string[];
  onNarrateStory: () => void;
  onStartMissionItem: (item: MissionItem) => void;
  onOpenLetters: () => void;
  onOpenNumbers: () => void;
  onOpenShapes: () => void;
  onOpenSettings: () => void;
}

const MissionFlow: React.FC<MissionFlowProps> = ({
  mission,
  practicedItemKeys,
  isCompletedToday,
  streak,
  diaryStickers,
  onNarrateStory,
  onStartMissionItem,
  onOpenLetters,
  onOpenNumbers,
  onOpenShapes,
  onOpenSettings,
}) => {
  const practicedSet = new Set(practicedItemKeys);

  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-5 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-10 py-2">
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">今日任务</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_0_rgba(0,0,0,0.12)] mb-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-lg md:text-xl font-black text-ocean-900">和鲨鱼一起冒险</p>
            <button
              onClick={onNarrateStory}
              className="w-12 h-12 rounded-full bg-ocean-100 text-2xl active:scale-95"
              title="朗读任务"
            >
              🔊
            </button>
          </div>
          <p className="text-base md:text-lg font-bold text-gray-600 mb-4">{mission.story}</p>
          <p className="text-sm md:text-base font-bold text-gray-500">3 个小关卡，约 5-8 分钟</p>
          <div className="flex items-center gap-2 mt-3 text-sm font-bold text-ocean-700">
            <span>🔥 连续打卡 {streak} 天</span>
            {isCompletedToday && <span className="text-green-600">今日已完成</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {mission.items.map((item) => {
            const done = practicedSet.has(missionItemKey(item));
            return (
              <button
                key={item.id}
                onClick={() => onStartMissionItem(item)}
                className={`rounded-3xl p-6 shadow-[0_6px_0_rgba(0,0,0,0.1)] transition-all active:translate-y-1 active:shadow-none ${
                  done ? 'bg-sand ring-4 ring-yellow-400' : 'bg-white'
                }`}
              >
                <div className="text-6xl font-black text-ocean-900 mb-2">{item.char}</div>
                <div className="text-lg font-black text-gray-600">{done ? '完成啦' : '点我练习'}</div>
                <div className="text-xs font-bold text-gray-400 mt-1">
                  {item.type === 'letter' ? '字母' : item.type === 'number' ? '数字' : '线条'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white/95 rounded-3xl p-4 mb-5">
          <p className="text-base font-black text-ocean-900 mb-2">鲨鱼日记</p>
          <div className="flex flex-wrap gap-2 min-h-10">
            {diaryStickers.length > 0 ? (
              diaryStickers.map((sticker, idx) => (
                <span key={`${sticker}-${idx}`} className="text-2xl">
                  {sticker}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500 font-bold">今天完成任务会获得新贴纸</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-8">
          <button
            onClick={onOpenLetters}
            className="bg-white rounded-2xl p-4 text-left shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none"
          >
            <div className="text-3xl mb-1">🔤</div>
            <div className="text-xl font-black text-ocean-900">自由练字母</div>
          </button>
          <button
            onClick={onOpenNumbers}
            className="bg-white rounded-2xl p-4 text-left shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none"
          >
            <div className="text-3xl mb-1">🔢</div>
            <div className="text-xl font-black text-ocean-900">自由练数字</div>
          </button>
          <button
            onClick={onOpenShapes}
            className="bg-white rounded-2xl p-4 text-left shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none"
          >
            <div className="text-3xl mb-1">🧩</div>
            <div className="text-xl font-black text-ocean-900">自由练线条</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionFlow;
