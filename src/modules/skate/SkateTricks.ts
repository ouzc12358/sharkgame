export type SkateTrickId =
  | 'stance_regular'
  | 'stance_goofy'
  | 'push'
  | 'foot_brake'
  | 'tic_tac'
  | 'kickturn'
  | 'manual'
  | 'nose_manual'
  | 'ollie'
  | 'fakie_ollie'
  | 'nollie'
  | 'shuvit'
  | 'pop_shuvit'
  | 'frontside_180'
  | 'backside_180'
  | 'boardslide'
  | '50_50_grind'
  | 'rock_to_fakie'
  | 'drop_in'
  | 'pump';

export interface TrickKeyframe {
  x: number;
  y: number;
  rotate: number;
  scale?: number;
}

export interface SkateTrick {
  id: SkateTrickId;
  nameZh: string;
  nameEn: string;
  prompt: string;
  animation: {
    durationMs: number;
    keyframes: TrickKeyframe[];
  };
}

export const SKATE_TRICKS: Record<SkateTrickId, SkateTrick> = {
  stance_regular: {
    id: 'stance_regular',
    nameZh: '正脚站位',
    nameEn: 'Regular Stance',
    prompt: '帮鲨鱼找到最稳的站姿。',
    animation: { durationMs: 1900, keyframes: [{ x: 0, y: 0, rotate: 0 }, { x: 8, y: -2, rotate: 3 }, { x: 0, y: 0, rotate: 0 }] },
  },
  stance_goofy: {
    id: 'stance_goofy',
    nameZh: '反脚站位',
    nameEn: 'Goofy Stance',
    prompt: '换个方向，看看鲨鱼也能稳住。',
    animation: { durationMs: 1900, keyframes: [{ x: 0, y: 0, rotate: 0 }, { x: -8, y: -2, rotate: -3 }, { x: 0, y: 0, rotate: 0 }] },
  },
  push: {
    id: 'push',
    nameZh: '轻轻推行',
    nameEn: 'Push',
    prompt: '帮鲨鱼向前滑过小水道。',
    animation: { durationMs: 1800, keyframes: [{ x: -20, y: 0, rotate: 0 }, { x: 10, y: -2, rotate: 2 }, { x: 34, y: 0, rotate: 0 }] },
  },
  foot_brake: {
    id: 'foot_brake',
    nameZh: '脚刹停停',
    nameEn: 'Foot Brake',
    prompt: '让鲨鱼慢慢停在泡泡边。',
    animation: { durationMs: 1700, keyframes: [{ x: 20, y: 0, rotate: 0 }, { x: 8, y: 0, rotate: -1 }, { x: 0, y: 1, rotate: 0 }] },
  },
  tic_tac: {
    id: 'tic_tac',
    nameZh: '摆摆滑',
    nameEn: 'Tic-Tac',
    prompt: '左右摆一摆，绕过小贝壳。',
    animation: { durationMs: 1800, keyframes: [{ x: -10, y: 0, rotate: -6 }, { x: 8, y: 0, rotate: 6 }, { x: 26, y: 0, rotate: -5 }, { x: 34, y: 0, rotate: 0 }] },
  },
  kickturn: {
    id: 'kickturn',
    nameZh: '抬尾转身',
    nameEn: 'Kickturn',
    prompt: '在角落轻轻转个弯。',
    animation: { durationMs: 1700, keyframes: [{ x: 0, y: 0, rotate: 0 }, { x: 10, y: -5, rotate: 18 }, { x: 0, y: 0, rotate: 4 }] },
  },
  manual: {
    id: 'manual',
    nameZh: '尾轮平衡',
    nameEn: 'Manual',
    prompt: '帮鲨鱼抬头平衡一下。',
    animation: { durationMs: 1800, keyframes: [{ x: -6, y: 0, rotate: 0 }, { x: 8, y: -8, rotate: -10 }, { x: 24, y: -6, rotate: -8 }, { x: 36, y: 0, rotate: 0 }] },
  },
  nose_manual: {
    id: 'nose_manual',
    nameZh: '前轮平衡',
    nameEn: 'Nose Manual',
    prompt: '让鲨鱼身体往前点，稳住哦。',
    animation: { durationMs: 1800, keyframes: [{ x: -6, y: 0, rotate: 0 }, { x: 8, y: -8, rotate: 10 }, { x: 24, y: -6, rotate: 8 }, { x: 36, y: 0, rotate: 0 }] },
  },
  ollie: {
    id: 'ollie',
    nameZh: '小跳跃',
    nameEn: 'Ollie',
    prompt: '帮鲨鱼跳过小水坑。',
    animation: { durationMs: 1700, keyframes: [{ x: -12, y: 0, rotate: 0 }, { x: 4, y: -18, rotate: -8, scale: 1.05 }, { x: 20, y: -20, rotate: 4 }, { x: 36, y: 0, rotate: 0 }] },
  },
  fakie_ollie: {
    id: 'fakie_ollie',
    nameZh: '倒滑小跳',
    nameEn: 'Fakie Ollie',
    prompt: '倒着滑也能跳起来。',
    animation: { durationMs: 1700, keyframes: [{ x: 16, y: 0, rotate: 0 }, { x: 4, y: -18, rotate: 10, scale: 1.04 }, { x: -10, y: -12, rotate: -5 }, { x: -22, y: 0, rotate: 0 }] },
  },
  nollie: {
    id: 'nollie',
    nameZh: '前脚小跳',
    nameEn: 'Nollie',
    prompt: '前脚轻点，鲨鱼跳起来。',
    animation: { durationMs: 1700, keyframes: [{ x: -10, y: 0, rotate: 0 }, { x: 2, y: -15, rotate: 12 }, { x: 22, y: -14, rotate: -6 }, { x: 34, y: 0, rotate: 0 }] },
  },
  shuvit: {
    id: 'shuvit',
    nameZh: '板子转圈',
    nameEn: 'Shuvit',
    prompt: '让板子转一下再落地。',
    animation: { durationMs: 1800, keyframes: [{ x: -8, y: 0, rotate: 0 }, { x: 8, y: -14, rotate: 90 }, { x: 22, y: -10, rotate: 170 }, { x: 34, y: 0, rotate: 0 }] },
  },
  pop_shuvit: {
    id: 'pop_shuvit',
    nameZh: '弹跳转板',
    nameEn: 'Pop Shuvit',
    prompt: '跳起来转板，落地继续笑。',
    animation: { durationMs: 1800, keyframes: [{ x: -8, y: 0, rotate: 0 }, { x: 8, y: -18, rotate: 120 }, { x: 22, y: -14, rotate: 220 }, { x: 36, y: 0, rotate: 0 }] },
  },
  frontside_180: {
    id: 'frontside_180',
    nameZh: '正转180',
    nameEn: 'Frontside 180',
    prompt: '转半圈，和浪花打招呼。',
    animation: { durationMs: 1800, keyframes: [{ x: -8, y: 0, rotate: 0 }, { x: 8, y: -16, rotate: 70 }, { x: 22, y: -10, rotate: 140 }, { x: 34, y: 0, rotate: 180 }] },
  },
  backside_180: {
    id: 'backside_180',
    nameZh: '反转180',
    nameEn: 'Backside 180',
    prompt: '反方向转半圈也很酷。',
    animation: { durationMs: 1800, keyframes: [{ x: -8, y: 0, rotate: 0 }, { x: 8, y: -16, rotate: -70 }, { x: 22, y: -10, rotate: -140 }, { x: 34, y: 0, rotate: -180 }] },
  },
  boardslide: {
    id: 'boardslide',
    nameZh: '板身滑杆',
    nameEn: 'Boardslide',
    prompt: '滑过小彩条就算成功。',
    animation: { durationMs: 1900, keyframes: [{ x: -18, y: 0, rotate: 0 }, { x: 0, y: -8, rotate: 90 }, { x: 24, y: -8, rotate: 90 }, { x: 38, y: 0, rotate: 0 }] },
  },
  '50_50_grind': {
    id: '50_50_grind',
    nameZh: '双桥滑行',
    nameEn: '50-50 Grind',
    prompt: '两轮一起滑过亮亮轨道。',
    animation: { durationMs: 1900, keyframes: [{ x: -18, y: 0, rotate: 0 }, { x: -2, y: -6, rotate: 4 }, { x: 24, y: -6, rotate: 2 }, { x: 38, y: 0, rotate: 0 }] },
  },
  rock_to_fakie: {
    id: 'rock_to_fakie',
    nameZh: '摇到倒滑',
    nameEn: 'Rock to Fakie',
    prompt: '上小坡，摇一摇，再倒滑回来。',
    animation: { durationMs: 2000, keyframes: [{ x: -10, y: 0, rotate: 0 }, { x: 16, y: -12, rotate: 12 }, { x: 6, y: -4, rotate: -8 }, { x: -20, y: 0, rotate: 0 }] },
  },
  drop_in: {
    id: 'drop_in',
    nameZh: '坡顶下滑',
    nameEn: 'Drop In',
    prompt: '从小坡轻轻滑下去。',
    animation: { durationMs: 1800, keyframes: [{ x: -12, y: -16, rotate: -12 }, { x: 4, y: -4, rotate: -4 }, { x: 22, y: 4, rotate: 2 }, { x: 36, y: 0, rotate: 0 }] },
  },
  pump: {
    id: 'pump',
    nameZh: '坡道加速',
    nameEn: 'Pump',
    prompt: '在小坡上下起伏加速前进。',
    animation: { durationMs: 1900, keyframes: [{ x: -18, y: 0, rotate: 0 }, { x: -2, y: -8, rotate: 6 }, { x: 16, y: 6, rotate: -5 }, { x: 36, y: -4, rotate: 4 }] },
  },
};

export const SKATE_TRICK_LIST = Object.values(SKATE_TRICKS);
