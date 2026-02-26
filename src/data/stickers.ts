export interface StickerItem {
  id: string;
  labelZh: string;
  labelEn?: string;
  src: string;
  tags: string[];
  relevance: string[];
  phraseZh: string;
}

export const STICKERS: StickerItem[] = [
  {
    id: 'apple',
    labelZh: '苹果',
    labelEn: 'Apple',
    src: '/stickers/apple.svg',
    tags: ['apple', 'fruit', 'A', 'a'],
    relevance: ['letter:A', 'word:apple', 'shape:circle', 'number:1'],
    phraseZh: '苹果圆圆的，像一个小圈圈。',
  },
  {
    id: 'starfish',
    labelZh: '海星',
    labelEn: 'Starfish',
    src: '/stickers/starfish.svg',
    tags: ['ocean', 'star', 'shape-star'],
    relevance: ['word:star', 'shape:zigzag', 'shape:cross', 'number:5'],
    phraseZh: '海星有五个角，像小星星。',
  },
  {
    id: 'fish',
    labelZh: '小鱼',
    labelEn: 'Fish',
    src: '/stickers/fish.svg',
    tags: ['fish', 'ocean', 'count-3'],
    relevance: ['letter:F', 'word:fish', 'number:3', 'shape:arc'],
    phraseZh: '小鱼弯弯游，像一条弧线。',
  },
  {
    id: 'shell',
    labelZh: '贝壳',
    labelEn: 'Shell',
    src: '/stickers/shell.svg',
    tags: ['shell', 'ocean', 'shape-arc'],
    relevance: ['letter:S', 'word:shell', 'shape:arc', 'shape:circle'],
    phraseZh: '贝壳弯弯的，像小弧线。',
  },
  {
    id: 'octopus',
    labelZh: '章鱼',
    labelEn: 'Octopus',
    src: '/stickers/octopus.svg',
    tags: ['ocean', '8', 'count-8'],
    relevance: ['letter:O', 'word:octopus', 'number:8', 'shape:circle'],
    phraseZh: '章鱼有八条触手，和8很像。',
  },
  {
    id: 'rainbow',
    labelZh: '彩虹',
    labelEn: 'Rainbow',
    src: '/stickers/rainbow.svg',
    tags: ['rainbow', 'color', '7'],
    relevance: ['letter:R', 'word:rainbow', 'number:7', 'shape:arc'],
    phraseZh: '彩虹弯弯的，像一道大弧线。',
  },
  {
    id: 'bubble',
    labelZh: '泡泡',
    labelEn: 'Bubble',
    src: '/stickers/bubble.svg',
    tags: ['ocean', 'circle', 'shape-circle'],
    relevance: ['shape:circle', 'word:bubble', 'letter:O', 'number:0'],
    phraseZh: '泡泡圆圆的，像数字0。',
  },
  {
    id: 'shark',
    labelZh: '小鲨鱼',
    labelEn: 'Shark',
    src: '/stickers/shark.svg',
    tags: ['ocean', 'animal', 'S', 's'],
    relevance: ['letter:S', 'word:shark', 'shape:arc', 'number:2'],
    phraseZh: '小鲨鱼的背像一条弧线。',
  },
  {
    id: 'boat',
    labelZh: '小船',
    labelEn: 'Boat',
    src: '/stickers/boat.svg',
    tags: ['boat', 'B', 'b', 'ocean'],
    relevance: ['letter:B', 'word:boat', 'shape:line', 'number:1'],
    phraseZh: '小船有直直的桅杆，像数字1。',
  },
  {
    id: 'kite',
    labelZh: '风筝',
    labelEn: 'Kite',
    src: '/stickers/kite.svg',
    tags: ['kite', 'K', 'k'],
    relevance: ['letter:K', 'word:kite', 'shape:cross', 'shape:line'],
    phraseZh: '风筝有交叉线，像X。',
  },
  {
    id: 'ball',
    labelZh: '球',
    labelEn: 'Ball',
    src: '/stickers/ball.svg',
    tags: ['ball', 'B', 'b', 'circle'],
    relevance: ['letter:B', 'word:ball', 'shape:circle', 'number:0'],
    phraseZh: '球圆圆的，写O时会想到它。',
  },
  {
    id: 'crown',
    labelZh: '皇冠',
    labelEn: 'Crown',
    src: '/stickers/crown.svg',
    tags: ['crown', 'Q', 'queen', 'royal'],
    relevance: ['letter:Q', 'word:queen', 'shape:zigzag', 'number:3'],
    phraseZh: '皇冠有尖尖角，像锯齿线。',
  },
  {
    id: 'zebra',
    labelZh: '斑马',
    labelEn: 'Zebra',
    src: '/stickers/zebra.svg',
    tags: ['zebra', 'Z', 'z', 'animal'],
    relevance: ['letter:Z', 'word:zebra', 'shape:zigzag', 'number:2'],
    phraseZh: '斑马身上有Z字纹路。',
  },
];
