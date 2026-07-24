export interface HanziPinyinItem {
  id: string;
  char: string;
  pinyin: string;
  word: string;
  emoji: string;
  association: string;
}

export const HANZI_PINYIN_ITEMS: HanziPinyinItem[] = [
  { id: 'mao', char: '猫', pinyin: 'māo', word: '小猫', emoji: '🐱', association: '猫，像会轻轻走路的小伙伴' },
  { id: 'gou', char: '狗', pinyin: 'gǒu', word: '小狗', emoji: '🐶', association: '狗，像会摇尾巴的小伙伴' },
  { id: 'sha', char: '鲨', pinyin: 'shā', word: '大鲨鱼', emoji: '🦈', association: '鲨，大鲨鱼游过来啦' },
  { id: 'yu', char: '鱼', pinyin: 'yú', word: '小鱼', emoji: '🐟', association: '鱼，在蓝色海水里游' },
  { id: 'niao', char: '鸟', pinyin: 'niǎo', word: '小鸟', emoji: '🐦', association: '鸟，张开翅膀飞起来' },
  { id: 'tu', char: '兔', pinyin: 'tù', word: '兔子', emoji: '🐰', association: '兔，长耳朵跳一跳' },
  { id: 'xiong', char: '熊', pinyin: 'xióng', word: '小熊', emoji: '🐻', association: '熊，抱一抱软软的' },
  { id: 'ma', char: '马', pinyin: 'mǎ', word: '小马', emoji: '🐴', association: '马，哒哒哒向前跑' },
  { id: 'ri', char: '日', pinyin: 'rì', word: '太阳', emoji: '☀️', association: '日，像天空里的太阳' },
  { id: 'yue', char: '月', pinyin: 'yuè', word: '月亮', emoji: '🌙', association: '月，像弯弯的月亮' },
  { id: 'shan', char: '山', pinyin: 'shān', word: '大山', emoji: '⛰️', association: '山，高高的山峰' },
  { id: 'shui', char: '水', pinyin: 'shuǐ', word: '水滴', emoji: '💧', association: '水，蓝色水滴答滴答' },
  { id: 'hua', char: '花', pinyin: 'huā', word: '小花', emoji: '🌼', association: '花，香香的小花开了' },
  { id: 'guo', char: '果', pinyin: 'guǒ', word: '水果', emoji: '🍎', association: '果，香甜的水果' },
  { id: 'da', char: '大', pinyin: 'dà', word: '大大的', emoji: '🐋', association: '大，像大大的鲸鱼' },
  { id: 'xiao', char: '小', pinyin: 'xiǎo', word: '小小的', emoji: '🐜', association: '小，像小小的蚂蚁' },
];
