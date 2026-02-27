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

export const speakLetterThenWord = (letter: string, word: string) => {
  if (!AUDIO_PREFS.ttsEnabled) return;
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const letterUtterance = new SpeechSynthesisUtterance(letter.toUpperCase());
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
    speak(item.char.toUpperCase(), 'en-US');
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

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'start') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
    return;
  }

  if (type === 'end') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
    return;
  }

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(180, now + 0.22);
  gain.gain.setValueAtTime(0.03, now);
  gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
  osc.start(now);
  osc.stop(now + 0.22);
};
