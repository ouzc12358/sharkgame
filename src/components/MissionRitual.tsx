import React from 'react';

interface MissionRitualProps {
  isOpen: boolean;
  onHighFive: () => void;
}

const MissionRitual: React.FC<MissionRitualProps> = ({ isOpen, onHighFive }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 w-full max-w-sm text-center shadow-2xl">
        <div className="text-6xl mb-3">🦈✋</div>
        <h2 className="text-3xl font-black text-ocean-900 mb-2">任务完成</h2>
        <p className="text-lg font-bold text-gray-600 mb-5">和小鲨鱼击个掌吧！</p>
        <button
          onClick={onHighFive}
          className="w-full bg-ocean-500 text-white text-2xl font-black py-4 rounded-2xl shadow-lg active:scale-95"
        >
          击掌
        </button>
      </div>
    </div>
  );
};

export default MissionRitual;
