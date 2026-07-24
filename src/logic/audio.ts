import { LetterConfig } from '../../types';

const AUDIO_PREFS = {
  ttsEnabled: true,
  soundsEnabled: true,
};

const NUMBER_ZH_MAP: Record<string, string> = {
  '0': '零',
  '1': '一',
  '2': '二',
  '3': '三',
  '4': '四',
  '5': '五',
  '6': '六',
  '7': '七',
  '8': '八',
  '9': '九',
};

const LETTER_NAME_SPEECH: Record<string, string> = {
  A: 'ay',
  B: 'bee',
  C: 'see',
  D: 'dee',
  E: 'ee',
  F: 'eff',
  G: 'gee',
  H: 'aitch',
  I: 'eye',
  J: 'jay',
  K: 'kay',
  L: 'el',
  M: 'em',
  N: 'en',
  O: 'oh',
  P: 'pee',
  Q: 'cue',
  R: 'are',
  S: 'ess',
  T: 'tee',
  U: 'you',
  V: 'vee',
  W: 'double you',
  X: 'ex',
  Y: 'why',
  Z: 'zee',
};

let audioCtx: AudioContext | null = null;

const getAudioCtx = () => {
  if (audioCtx) return audioCtx;
  const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
};

export const setAudioPreferenceFlags = (next: { ttsEnabled: boolean; soundsEnabled: boolean }) => {
  AUDIO_PREFS.ttsEnabled = next.ttsEnabled;
  AUDIO_PREFS.soundsEnabled = next.soundsEnabled;
};

type SpeakOptions = {
  interrupt?: boolean;
};

export const speak = (
  text: string,
  lang: 'en-US' | 'zh-CN' = 'zh-CN',
  rate = 0.52,
  options?: SpeakOptions
) => {
  if (!AUDIO_PREFS.ttsEnabled) return;
  if (!('speechSynthesis' in window)) return;
  if (options?.interrupt !== false) {
    window.speechSynthesis.cancel();
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
};

const getLetterSpeech = (letter: string) => {
  const normalized = letter.trim().toUpperCase();
  return LETTER_NAME_SPEECH[normalized] || letter.toLowerCase();
};

export const speakLetterName = (letter: string) => {
  speak(getLetterSpeech(letter), 'en-US', 0.56);
};

export const speakLetterThenWord = (letter: string, word: string) => {
  if (!AUDIO_PREFS.ttsEnabled) return;
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const letterUtterance = new SpeechSynthesisUtterance(getLetterSpeech(letter));
  letterUtterance.rate = 0.56;
  letterUtterance.pitch = 1;
  letterUtterance.lang = 'en-US';

  const wordUtterance = new SpeechSynthesisUtterance(word);
  wordUtterance.rate = 0.52;
  wordUtterance.pitch = 1;
  wordUtterance.lang = 'en-US';

  window.speechSynthesis.speak(letterUtterance);
  window.speechSynthesis.speak(wordUtterance);
};

const isNumberItem = (char: string) => /^[0-9]$/.test(char);

export const speakItemPrimary = (item: LetterConfig) => {
  if (isNumberItem(item.char)) {
    const zhNumber = NUMBER_ZH_MAP[item.char] || item.char;
    speak(`数字${zhNumber}`, 'zh-CN');
    return;
  }
  if (/^[A-Z]$/.test(item.char)) {
    speakLetterName(item.char);
    return;
  }
  speak(item.word, 'zh-CN');
};

export const playSound = (type: 'start' | 'end' | 'guide') => {
  if (!AUDIO_PREFS.soundsEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => undefined);
  }

  const now = ctx.currentTime;

  const playTone = (
    frequency: number,
    startOffset: number,
    duration: number,
    wave: OscillatorType,
    volume: number
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const startAt = now + startOffset;
    osc.type = wave;
    osc.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    osc.start(startAt);
    osc.stop(startAt + duration);
  };

  if (type === 'start') {
    playTone(330, 0, 0.08, 'sine', 0.035);
    playTone(470, 0.055, 0.1, 'sine', 0.025);
    return;
  }

  if (type === 'end') {
    playTone(523.25, 0, 0.12, 'sine', 0.035);
    playTone(659.25, 0.08, 0.13, 'sine', 0.035);
    playTone(783.99, 0.16, 0.16, 'triangle', 0.03);
    return;
  }

  playTone(260, 0, 0.14, 'triangle', 0.02);
  playTone(220, 0.1, 0.16, 'triangle', 0.018);
};
