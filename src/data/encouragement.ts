export type EncouragementFriendId = 'shark' | 'cat' | 'dog' | 'dolphin';

export interface EncouragementFriend {
  id: EncouragementFriendId;
  icon: string;
  label: string;
  bgClass: string;
  ringClass: string;
  lines: string[];
}

export const ENCOURAGEMENT_FRIENDS: EncouragementFriend[] = [
  {
    id: 'shark',
    icon: '🦈',
    label: '大鲨鱼',
    bgClass: 'bg-sky-100',
    ringClass: 'ring-sky-300',
    lines: ['大鲨鱼陪你慢慢写', '大鲨鱼看到你很认真', '大鲨鱼说，再来一点点'],
  },
  {
    id: 'cat',
    icon: '🐱',
    label: '小猫',
    bgClass: 'bg-blue-50',
    ringClass: 'ring-blue-200',
    lines: ['小猫轻轻拍手啦', '小猫说，你很专心', '小猫喜欢你的线条'],
  },
  {
    id: 'dog',
    icon: '🐶',
    label: '小狗',
    bgClass: 'bg-cyan-50',
    ringClass: 'ring-cyan-200',
    lines: ['小狗摇尾巴啦', '小狗说，慢慢来很好', '小狗陪你再试一次'],
  },
  {
    id: 'dolphin',
    icon: '🐬',
    label: '海豚',
    bgClass: 'bg-teal-50',
    ringClass: 'ring-teal-200',
    lines: ['海豚跳起来啦', '海豚说，这条线很顺', '海豚陪你游到终点'],
  },
];

export const pickFriendLine = (friendId: EncouragementFriendId) => {
  const friend = ENCOURAGEMENT_FRIENDS.find((entry) => entry.id === friendId) || ENCOURAGEMENT_FRIENDS[0];
  return friend.lines[Math.floor(Math.random() * friend.lines.length)];
};

export const pickAnyEncouragement = () => {
  const friend = ENCOURAGEMENT_FRIENDS[Math.floor(Math.random() * ENCOURAGEMENT_FRIENDS.length)];
  return pickFriendLine(friend.id);
};
