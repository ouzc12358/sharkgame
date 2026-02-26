export interface StickerItem {
  id: string;
  labelZh: string;
  labelEn?: string;
  src: string;
  tags: string[];
}

export const STICKERS: StickerItem[] = [
  { id: 'apple', labelZh: '苹果', labelEn: 'Apple', src: '/stickers/apple.svg', tags: ['apple', 'fruit', 'A', 'a'] },
  { id: 'starfish', labelZh: '海星', labelEn: 'Starfish', src: '/stickers/starfish.svg', tags: ['ocean', 'star', 'shape-star'] },
  { id: 'fish', labelZh: '小鱼', labelEn: 'Fish', src: '/stickers/fish.svg', tags: ['fish', 'ocean', 'count-3'] },
  { id: 'shell', labelZh: '贝壳', labelEn: 'Shell', src: '/stickers/shell.svg', tags: ['shell', 'ocean', 'shape-arc'] },
  { id: 'octopus', labelZh: '章鱼', labelEn: 'Octopus', src: '/stickers/octopus.svg', tags: ['ocean', '8', 'count-8'] },
  { id: 'rainbow', labelZh: '彩虹', labelEn: 'Rainbow', src: '/stickers/rainbow.svg', tags: ['rainbow', 'color', '7'] },
  { id: 'bubble', labelZh: '泡泡', labelEn: 'Bubble', src: '/stickers/bubble.svg', tags: ['ocean', 'circle', 'shape-circle'] },
  { id: 'shark', labelZh: '小鲨鱼', labelEn: 'Shark', src: '/stickers/shark.svg', tags: ['ocean', 'animal', 'S', 's'] },
  { id: 'boat', labelZh: '小船', labelEn: 'Boat', src: '/stickers/boat.svg', tags: ['boat', 'B', 'b', 'ocean'] },
  { id: 'kite', labelZh: '风筝', labelEn: 'Kite', src: '/stickers/kite.svg', tags: ['kite', 'K', 'k'] },
  { id: 'ball', labelZh: '球', labelEn: 'Ball', src: '/stickers/ball.svg', tags: ['ball', 'B', 'b', 'circle'] },
  { id: 'crown', labelZh: '皇冠', labelEn: 'Crown', src: '/stickers/crown.svg', tags: ['crown', 'Q', 'queen', 'royal'] },
  { id: 'zebra', labelZh: '斑马', labelEn: 'Zebra', src: '/stickers/zebra.svg', tags: ['zebra', 'Z', 'z', 'animal'] },
];
