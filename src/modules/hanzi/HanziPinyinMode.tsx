import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SharkConfig, SharkTheme } from '../../../types';
import FriendlyShark from '../../components/FriendlyShark';
import { playSound, speak } from '../../logic/audio';
import { HANZI_PINYIN_ITEMS, HanziPinyinItem } from './hanziData';

interface HanziPinyinModeProps {
  onBack: () => void;
  onOpenSettings: () => void;
  sharkConfig: SharkConfig;
  theme: SharkTheme;
  themeUpgradeLevel: number;
}

const ROUND_LENGTH = 5;

const makeRound = () => {
  const offset = Math.floor(Math.random() * HANZI_PINYIN_ITEMS.length);
  return Array.from(
    { length: ROUND_LENGTH },
    (_, index) => HANZI_PINYIN_ITEMS[(offset + index * 3) % HANZI_PINYIN_ITEMS.length]
  );
};

const buildChoices = (target: HanziPinyinItem) => {
  const targetIndex = HANZI_PINYIN_ITEMS.findIndex((item) => item.id === target.id);
  const distractors = [
    HANZI_PINYIN_ITEMS[(targetIndex + 5) % HANZI_PINYIN_ITEMS.length],
    HANZI_PINYIN_ITEMS[(targetIndex + 9) % HANZI_PINYIN_ITEMS.length],
  ];
  const targetPosition = targetIndex % 3;
  const choices = [...distractors];
  choices.splice(targetPosition, 0, target);
  return choices;
};

const HanziPinyinMode: React.FC<HanziPinyinModeProps> = ({
  onBack,
  onOpenSettings,
  sharkConfig,
  theme,
  themeUpgradeLevel,
}) => {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(makeRound);
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState('听一听，再找它的图片');
  const [celebrating, setCelebrating] = useState(false);
  const [finished, setFinished] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);
  const current = round[step];
  const choices = useMemo(() => buildChoices(current), [current]);

  const narrateCurrent = () => {
    speak(current.association, 'zh-CN', 0.58);
  };

  useEffect(() => {
    if (!started || finished) return;
    const timer = window.setTimeout(() => speak(current.association, 'zh-CN', 0.58), 260);
    return () => window.clearTimeout(timer);
  }, [current.association, started, finished]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    },
    []
  );

  const startRound = () => {
    setRound(makeRound());
    setStep(0);
    setFeedback('听一听，再找它的图片');
    setCelebrating(false);
    setFinished(false);
    setStarted(true);
  };

  const chooseItem = (choice: HanziPinyinItem) => {
    if (celebrating) return;
    if (choice.id !== current.id) {
      playSound('guide');
      setFeedback('再听一听，小鲨鱼陪你找');
      speak(current.association, 'zh-CN', 0.58);
      return;
    }

    playSound('end');
    setCelebrating(true);
    setFeedback(`找到了！${current.char} · ${current.pinyin}`);
    speak(`找到了，${current.word}`, 'zh-CN', 0.6);

    advanceTimerRef.current = window.setTimeout(() => {
      if (step + 1 >= round.length) {
        setFinished(true);
        setCelebrating(false);
        speak('大鲨鱼认识了新朋友，你真棒', 'zh-CN', 0.6);
        return;
      }
      setStep((value) => value + 1);
      setFeedback('听一听，再找它的图片');
      setCelebrating(false);
    }, 900);
  };

  return (
    <div className="h-full bg-ocean-500 overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            🔙
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white">文字拼音</h1>
          <button
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95"
            aria-label="打开设置"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        {!started ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full bg-white rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_0_rgba(0,0,0,0.12)] text-center">
              <div className="w-40 h-32 md:w-52 md:h-40 mx-auto">
                <FriendlyShark
                  className="w-full h-full"
                  config={sharkConfig}
                  theme={theme}
                  upgradeLevel={themeUpgradeLevel}
                />
              </div>
              <p className="text-3xl md:text-4xl font-black text-ocean-900 mt-2">听一听，找朋友</p>
              <div className="flex justify-center gap-3 text-5xl md:text-6xl my-5">
                <span>🐱</span>
                <span>🦈</span>
                <span>🐶</span>
              </div>
              <button
                onClick={startRound}
                className="w-full max-w-xl bg-ocean-500 text-white text-3xl font-black py-5 rounded-2xl shadow-lg active:translate-y-1 active:shadow-none"
              >
                开始
              </button>
            </div>
          </div>
        ) : finished ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full bg-white rounded-[2.5rem] p-7 md:p-10 text-center shadow-[0_10px_0_rgba(0,0,0,0.12)]">
              <div className="text-7xl mb-3">🌟</div>
              <div className="w-48 h-36 mx-auto">
                <FriendlyShark
                  className="w-full h-full"
                  config={sharkConfig}
                  theme={theme}
                  upgradeLevel={themeUpgradeLevel}
                />
              </div>
              <p className="text-3xl md:text-4xl font-black text-ocean-900">认识新朋友啦</p>
              <button
                onClick={startRound}
                className="mt-6 w-full bg-ocean-500 text-white text-2xl font-black py-5 rounded-2xl active:scale-95"
              >
                再玩一次
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-center gap-3 mb-4" aria-label="本轮进度">
              {round.map((item, index) => (
                <span
                  key={item.id}
                  className={`w-5 h-5 rounded-full border-4 border-white ${
                    index < step ? 'bg-yellow-300' : index === step ? 'bg-blue-700 scale-125' : 'bg-sky-200'
                  }`}
                />
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] p-5 md:p-7 shadow-[0_10px_0_rgba(0,0,0,0.12)]">
              <button
                onClick={narrateCurrent}
                className="w-full rounded-3xl bg-sky-50 border-4 border-sky-200 py-4 active:scale-[0.98]"
              >
                <span className="block text-8xl md:text-9xl font-black text-ocean-900 leading-none">{current.char}</span>
                <span className="block text-3xl md:text-4xl font-black text-blue-600 mt-3 tracking-wide">
                  {current.pinyin}
                </span>
                <span className="inline-block mt-3 bg-ocean-500 text-white rounded-full px-5 py-2 text-xl font-black">
                  🔊 听一听
                </span>
              </button>

              <p className="text-center text-lg md:text-2xl font-black text-ocean-800 my-4">{feedback}</p>

              <div className="grid grid-cols-3 gap-3 md:gap-5">
                {choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => chooseItem(choice)}
                    className={`min-h-32 md:min-h-44 rounded-3xl border-4 bg-white shadow-[0_7px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none ${
                      celebrating && choice.id === current.id
                        ? 'border-yellow-300 bg-yellow-50 animate-bounce'
                        : 'border-sky-200'
                    }`}
                  >
                    <span className="block text-6xl md:text-8xl">{choice.emoji}</span>
                    <span className="block mt-2 text-lg md:text-2xl font-black text-ocean-900">{choice.word}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HanziPinyinMode;
