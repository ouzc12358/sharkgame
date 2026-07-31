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
  A: 'A',
  B: 'bee',
  C: 'see',
  D: 'dee',
  E: 'E',
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
let speechRequestId = 0;

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

const getPreferredVoice = (lang: 'en-US' | 'zh-CN') => {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const normalizedLang = lang.toLowerCase();
  const languagePrefix = normalizedLang.split('-')[0];
  const matchingVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(languagePrefix)
  );

  return (
    matchingVoices.find((voice) => voice.lang.toLowerCase() === normalizedLang && voice.localService) ||
    matchingVoices.find((voice) => voice.lang.toLowerCase() === normalizedLang) ||
    matchingVoices.find((voice) => voice.localService) ||
    matchingVoices[0] ||
    null
  );
};

const configureUtterance = (
  utterance: SpeechSynthesisUtterance,
  lang: 'en-US' | 'zh-CN',
  rate: number
) => {
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.lang = lang;
  const voice = getPreferredVoice(lang);
  if (voice) utterance.voice = voice;
};

const queueWhenVoicesReady = (
  requestId: number,
  enqueue: (synthesis: SpeechSynthesis) => void
) => {
  const synthesis = window.speechSynthesis;
  let finished = false;
  let fallbackTimer: number | null = null;

  const run = () => {
    if (finished) return;
    finished = true;
    synthesis.removeEventListener('voiceschanged', run);
    if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
    if (requestId !== speechRequestId || !AUDIO_PREFS.ttsEnabled) return;
    enqueue(synthesis);
  };

  if (synthesis.getVoices().length > 0) {
    run();
    return;
  }

  synthesis.addEventListener('voiceschanged', run, { once: true });
  fallbackTimer = window.setTimeout(run, 240);
};

const beginSpeechRequest = (interrupt: boolean) => {
  if (interrupt) {
    speechRequestId += 1;
    window.speechSynthesis.cancel();
  }
  return speechRequestId;
};

export const speak = (
  text: string,
  lang: 'en-US' | 'zh-CN' = 'zh-CN',
  rate = 0.52,
  options?: SpeakOptions
) => {
  if (!AUDIO_PREFS.ttsEnabled) return;
  if (!('speechSynthesis' in window)) return;
  const requestId = beginSpeechRequest(options?.interrupt !== false);
  queueWhenVoicesReady(requestId, (synthesis) => {
    const utterance = new SpeechSynthesisUtterance(text);
    configureUtterance(utterance, lang, rate);
    synthesis.speak(utterance);
  });
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
  const requestId = beginSpeechRequest(true);
  queueWhenVoicesReady(requestId, (synthesis) => {
    const letterUtterance = new SpeechSynthesisUtterance(getLetterSpeech(letter));
    configureUtterance(letterUtterance, 'en-US', 0.56);

    const wordUtterance = new SpeechSynthesisUtterance(word);
    configureUtterance(wordUtterance, 'en-US', 0.52);

    synthesis.speak(letterUtterance);
    synthesis.speak(wordUtterance);
  });
};

const isNumberItem = (char: string) => /^[0-9]$/.test(char);

export const speakItemPrimary = (item: LetterConfig) => {
  if (isNumberItem(item.char)) {
    const zhNumber = NUMBER_ZH_MAP[item.char] || item.char;
    speak(`数字${zhNumber}`, 'zh-CN');
    return;
  }
  if (/^[A-Za-z]$/.test(item.char)) {
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
