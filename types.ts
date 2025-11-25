
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
  LETTER = 'LETTER',
}

export type LetterProgress = Record<string, boolean>; // char -> isCompleted
