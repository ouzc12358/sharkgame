import React from 'react';
import { ENCOURAGEMENT_FRIENDS, pickFriendLine } from '../data/encouragement';
import { speak } from '../logic/audio';

interface AnimalEncouragementProps {
  compact?: boolean;
  className?: string;
}

const AnimalEncouragement: React.FC<AnimalEncouragementProps> = ({ compact = false, className = '' }) => {
  const handleFriendTap = (friendId: (typeof ENCOURAGEMENT_FRIENDS)[number]['id']) => {
    speak(pickFriendLine(friendId), 'zh-CN', 0.58);
  };

  return (
    <div
      className={`rounded-3xl bg-white/85 border-2 border-white/70 shadow-[0_6px_0_rgba(0,0,0,0.08)] ${
        compact ? 'p-2' : 'p-3 md:p-4'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`font-black text-ocean-900 ${compact ? 'text-sm' : 'text-base md:text-lg'}`}>
          动物小伙伴给你加油
        </p>
        <p className="text-xs md:text-sm font-bold text-ocean-600">点一点听鼓励</p>
      </div>
      <div className={`grid grid-cols-4 ${compact ? 'gap-2 mt-2' : 'gap-3 mt-3'}`}>
        {ENCOURAGEMENT_FRIENDS.map((friend) => (
          <button
            key={friend.id}
            onClick={() => handleFriendTap(friend.id)}
            className={`${friend.bgClass} rounded-2xl ring-2 ${friend.ringClass} active:scale-95 transition-transform ${
              compact ? 'py-2' : 'py-3 md:py-4'
            }`}
            aria-label={`${friend.label}鼓励`}
          >
            <span className={compact ? 'text-2xl' : 'text-4xl md:text-5xl'}>{friend.icon}</span>
            <span className={`block font-black text-ocean-900 ${compact ? 'text-[10px]' : 'text-xs md:text-sm'}`}>
              {friend.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnimalEncouragement;
