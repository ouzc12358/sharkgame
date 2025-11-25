import { LetterConfig } from './types';

// Simplified SVG paths for Montessori-style tracing.
// The viewBox is consistently 0 0 100 100.
// Paths are designed to be traced in a continuous flow where possible, 
// or simple multi-stroke approximations for toddlers.
export const LETTERS: LetterConfig[] = [
  { char: 'A', word: 'Apple', emoji: '🍎', viewBox: "0 0 100 100", svgPath: "M 50 15 L 20 85 M 50 15 L 80 85 M 30 65 L 70 65" },
  { char: 'B', word: 'Ball', emoji: '⚽', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 C 65 15 65 50 25 50 C 70 50 70 85 25 85" },
  { char: 'C', word: 'Cat', emoji: '🐱', viewBox: "0 0 100 100", svgPath: "M 80 25 C 20 15 20 85 80 75" },
  { char: 'D', word: 'Dog', emoji: '🐶', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 C 80 15 80 85 25 85" },
  { char: 'E', word: 'Egg', emoji: '🥚', viewBox: "0 0 100 100", svgPath: "M 75 15 L 25 15 L 25 85 L 75 85 M 25 50 L 65 50" },
  { char: 'F', word: 'Fish', emoji: '🐟', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 L 75 15 M 25 50 L 65 50" },
  { char: 'G', word: 'Goat', emoji: '🐐', viewBox: "0 0 100 100", svgPath: "M 80 25 C 20 15 20 85 80 75 L 80 50 L 50 50" },
  { char: 'H', word: 'Hat', emoji: '🎩', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 75 15 L 75 85 M 25 50 L 75 50" },
  { char: 'I', word: 'Igloo', emoji: '🏠', viewBox: "0 0 100 100", svgPath: "M 50 15 L 50 85 M 30 15 L 70 15 M 30 85 L 70 85" },
  { char: 'J', word: 'Jam', emoji: '🍯', viewBox: "0 0 100 100", svgPath: "M 60 15 L 60 75 C 60 95 30 95 30 75" },
  { char: 'K', word: 'Kite', emoji: '🪁', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 75 15 L 25 50 L 75 85" },
  { char: 'L', word: 'Lion', emoji: '🦁', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 L 75 85" },
  { char: 'M', word: 'Moon', emoji: '🌙', viewBox: "0 0 100 100", svgPath: "M 20 85 L 20 15 L 50 60 L 80 15 L 80 85" },
  { char: 'N', word: 'Nest', emoji: '🪺', viewBox: "0 0 100 100", svgPath: "M 25 85 L 25 15 L 75 85 L 75 15" },
  { char: 'O', word: 'Owl', emoji: '🦉', viewBox: "0 0 100 100", svgPath: "M 50 15 C 15 15 15 85 50 85 C 85 85 85 15 50 15" },
  { char: 'P', word: 'Pig', emoji: '🐷', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 C 70 15 70 55 25 55" },
  { char: 'Q', word: 'Queen', emoji: '👑', viewBox: "0 0 100 100", svgPath: "M 50 15 C 15 15 15 85 50 85 C 85 85 85 15 50 15 M 60 70 L 80 90" },
  { char: 'R', word: 'Rabbit', emoji: '🐰', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 85 M 25 15 C 70 15 70 55 25 55 L 75 85" },
  { char: 'S', word: 'Sun', emoji: '☀️', viewBox: "0 0 100 100", svgPath: "M 80 20 C 20 10 20 50 50 50 C 80 50 80 90 20 80" },
  { char: 'T', word: 'Turtle', emoji: '🐢', viewBox: "0 0 100 100", svgPath: "M 50 15 L 50 85 M 20 15 L 80 15" },
  { char: 'U', word: 'Umbrella', emoji: '☂️', viewBox: "0 0 100 100", svgPath: "M 25 15 L 25 65 C 25 90 75 90 75 65 L 75 15" },
  { char: 'V', word: 'Violin', emoji: '🎻', viewBox: "0 0 100 100", svgPath: "M 20 15 L 50 85 L 80 15" },
  { char: 'W', word: 'Whale', emoji: '🐋', viewBox: "0 0 100 100", svgPath: "M 15 15 L 30 85 L 50 40 L 70 85 L 85 15" },
  { char: 'X', word: 'Xylophone', emoji: '🎼', viewBox: "0 0 100 100", svgPath: "M 20 15 L 80 85 M 80 15 L 20 85" },
  { char: 'Y', word: 'Yacht', emoji: '⛵', viewBox: "0 0 100 100", svgPath: "M 20 15 L 50 55 L 50 85 M 80 15 L 50 55" },
  { char: 'Z', word: 'Zebra', emoji: '🦓', viewBox: "0 0 100 100", svgPath: "M 20 15 L 80 15 L 20 85 L 80 85" }
];
