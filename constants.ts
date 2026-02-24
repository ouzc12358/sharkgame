import { LetterConfig } from './types';

// Simplified SVG paths for Montessori-style tracing.
// The viewBox is consistently 0 0 100 100.
// Paths are designed to be traced in a continuous flow where possible, 
// or simple multi-stroke approximations for toddlers.
export const LETTERS: LetterConfig[] = [
  { char: 'A', word: 'Apple', emoji: '🍎', viewBox: "0 0 100 100", svgPath: "M 50 15 L 20 85 M 50 15 L 80 85 M 30 60 L 70 60" },
  { char: 'B', word: 'Ball', emoji: '⚽', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 C 65 15 65 50 25 50 M 25 50 C 70 50 70 85 25 85" },
  { char: 'C', word: 'Cat', emoji: '🐱', viewBox: "0 0 100 100", svgPath: "M 80 25 C 20 15 20 85 80 75" },
  { char: 'D', word: 'Dog', emoji: '🐶', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 C 80 15 80 85 25 85" },
  { char: 'E', word: 'Egg', emoji: '🥚', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 L 75 15 M 25 50 L 65 50 M 25 85 L 75 85" },
  { char: 'F', word: 'Fish', emoji: '🐟', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 L 75 15 M 25 50 L 65 50" },
  { char: 'G', word: 'Goat', emoji: '🐐', viewBox: "0 0 100 100", svgPath: "M 80 25 C 20 15 20 85 80 75 M 80 50 L 55 50" },
  { char: 'H', word: 'Hat', emoji: '🎩', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 75 15 L 75 85 M 25 50 L 75 50" },
  { char: 'I', word: 'Igloo', emoji: '🏠', viewBox: "0 0 100 100", svgPath: "M 30 15 L 70 15 M 50 15 L 50 85 M 30 85 L 70 85" },
  { char: 'J', word: 'Jam', emoji: '🍯', viewBox: "0 0 100 100", svgPath: "M 30 15 L 70 15 M 60 15 L 60 75 C 60 95 30 95 30 75" },
  { char: 'K', word: 'Kite', emoji: '🪁', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 50 L 75 15 M 25 50 L 75 85" },
  { char: 'L', word: 'Lion', emoji: '🦁', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 85 L 75 85" },
  { char: 'M', word: 'Moon', emoji: '🌙', viewBox: "0 0 100 100", svgPath: "M 20 85 L 20 15 M 20 15 L 50 60 M 50 60 L 80 15 M 80 15 L 80 85" },
  { char: 'N', word: 'Nest', emoji: '🪺', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 85 L 75 15 M 75 15 L 75 85" },
  { char: 'O', word: 'Owl', emoji: '🦉', viewBox: "0 0 100 100", svgPath: "M 50 15 C 15 15 15 85 50 85 C 85 85 85 15 50 15" },
  { char: 'P', word: 'Pig', emoji: '🐷', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 C 70 15 70 55 25 55" },
  { char: 'Q', word: 'Queen', emoji: '👑', viewBox: "0 0 100 100", svgPath: "M 50 15 C 15 15 15 85 50 85 C 85 85 85 15 50 15 M 60 70 L 80 90" },
  { char: 'R', word: 'Rabbit', emoji: '🐰', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 C 70 15 70 55 25 55 M 25 55 L 75 85" },
  { char: 'S', word: 'Sun', emoji: '☀️', viewBox: "0 0 100 100", svgPath: "M 80 20 C 20 10 20 50 50 50 C 80 50 80 90 20 80" },
  { char: 'T', word: 'Turtle', emoji: '🐢', viewBox: "0 0 100 100", svgPath: "M 20 15 L 80 15 M 50 15 L 50 85" },
  { char: 'U', word: 'Umbrella', emoji: '☂️', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 65 C 25 90 75 90 75 65 L 75 15" },
  { char: 'V', word: 'Violin', emoji: '🎻', viewBox: "0 0 100 100", svgPath: "M 20 15 L 50 85 L 80 15" },
  { char: 'W', word: 'Whale', emoji: '🐋', viewBox: "0 0 100 100", svgPath: "M 15 15 L 30 85 L 50 40 L 70 85 L 85 15" },
  { char: 'X', word: 'Xylophone', emoji: '🎼', viewBox: "0 0 100 100", svgPath: "M 20 15 L 80 85 M 80 15 L 20 85" },
  { char: 'Y', word: 'Yacht', emoji: '⛵', viewBox: "0 0 100 100", svgPath: "M 20 15 L 50 50 M 80 15 L 50 50 M 50 50 L 50 85" },
  { char: 'Z', word: 'Zebra', emoji: '🦓', viewBox: "0 0 100 100", svgPath: "M 20 15 L 80 15 M 80 15 L 20 85 M 20 85 L 80 85" },
  { char: '0', word: 'Zero', emoji: '🍩', viewBox: "0 0 100 100", svgPath: "M 50 15 C 20 15 20 85 50 85 C 80 85 80 15 50 15" },
  { char: '1', word: 'One', emoji: '☝️', viewBox: "0 0 100 100", svgPath: "M 50 20 L 50 85" },
  { char: '2', word: 'Two', emoji: '🦆', viewBox: "0 0 100 100", svgPath: "M 25 30 C 35 10 75 10 75 35 C 75 50 60 60 25 85 L 75 85" },
  { char: '3', word: 'Three', emoji: '🌳', viewBox: "0 0 100 100", svgPath: "M 25 20 C 75 15 75 45 40 50 C 75 50 75 85 25 80" },
  { char: '4', word: 'Four', emoji: '🍀', viewBox: "0 0 100 100", svgPath: "M 70 15 L 30 60 L 80 60 M 70 15 L 70 85" },
  { char: '5', word: 'Five', emoji: '✋', viewBox: "0 0 100 100", svgPath: "M 75 15 L 30 15 L 30 50 C 30 50 35 45 55 45 C 80 45 80 85 35 85" },
  { char: '6', word: 'Six', emoji: '🐌', viewBox: "0 0 100 100", svgPath: "M 70 25 C 55 10 30 20 30 50 C 30 85 75 90 75 60 C 75 35 40 35 30 55" },
  { char: '7', word: 'Seven', emoji: '🌈', viewBox: "0 0 100 100", svgPath: "M 25 15 L 80 15 L 45 85" },
  { char: '8', word: 'Eight', emoji: '🐙', viewBox: "0 0 100 100", svgPath: "M 50 15 C 25 15 25 45 50 45 C 75 45 75 15 50 15 M 50 45 C 20 45 20 85 50 85 C 80 85 80 45 50 45" },
  { char: '9', word: 'Nine', emoji: '🎈', viewBox: "0 0 100 100", svgPath: "M 65 45 C 65 20 30 20 30 45 C 30 70 65 70 65 45 M 65 45 L 65 85" }
];

export const LETTER_ITEMS = LETTERS.filter((item) => /^[A-Z]$/.test(item.char));
export const NUMBER_ITEMS = LETTERS.filter((item) => /^[0-9]$/.test(item.char));

export const SHAPE_ITEMS: LetterConfig[] = [
  { char: '—', word: '横线', emoji: '➖', viewBox: "0 0 100 100", svgPath: "M 20 50 L 80 50" },
  { char: '|', word: '竖线', emoji: '📏', viewBox: "0 0 100 100", svgPath: "M 50 20 L 50 80" },
  { char: '/', word: '斜线', emoji: '📐', viewBox: "0 0 100 100", svgPath: "M 25 75 L 75 25" },
  { char: '○', word: '圆圈', emoji: '⭕', viewBox: "0 0 100 100", svgPath: "M 50 20 C 30 20 20 35 20 50 C 20 65 30 80 50 80 C 70 80 80 65 80 50 C 80 35 70 20 50 20" },
  { char: '⌒', word: '弧线', emoji: '🌙', viewBox: "0 0 100 100", svgPath: "M 20 70 C 35 25 65 25 80 70" },
  { char: '⚡', word: '锯齿线', emoji: '⚡', viewBox: "0 0 100 100", svgPath: "M 20 30 L 40 55 L 60 30 L 80 55" },
  { char: '✚', word: '交叉线', emoji: '❌', viewBox: "0 0 100 100", svgPath: "M 25 25 L 75 75 M 75 25 L 25 75" },
];
