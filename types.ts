
export interface Point {
  x: number;
  y: number;
}

export interface LetterConfig {
  char: string;
  word: string;
  emoji: string;
  svgPath: string; // The path for the guide
  viewBox: string; // Viewbox for the path
}

export enum AppView {
  INTRO = 'INTRO',
  HOME = 'HOME',
  LETTER_LIST = 'LETTER_LIST',
  NUMBER_LIST = 'NUMBER_LIST',
  LETTER = 'LETTER',
}

export type LetterProgress = Record<string, boolean>; // char -> isCompleted

export type SharkColor = 'blue' | 'pink' | 'green' | 'purple' | 'orange' | 'teal' | 'yellow' | 'coral';
export type SharkAccessory = 'none' | 'hat' | 'glasses' | 'bowtie' | 'crown' | 'headphones' | 'scarf' | 'redBag' | 'greenBag' | 'blueBag' | 'lightCoralBag';

export interface SharkConfig {
  color: SharkColor;
  accessory: SharkAccessory;
}
