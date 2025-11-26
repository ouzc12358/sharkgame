
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LETTERS } from './constants';
import { LetterConfig, Point, AppView, LetterProgress, SharkConfig, SharkColor, SharkAccessory } from './types';
import { GoogleGenAI } from "@google/genai";

// --- Sound Utilities ---
// Defaults to Chinese (zh-CN) for prompts, allows en-US for letters.
const speak = (text: string, lang: 'en-US' | 'zh-CN' = 'zh-CN', rate = 0.5) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate; // Slower speed
    utterance.pitch = 1.0; 
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
};

// --- Math Helpers ---
const dist = (p1: Point, p2: Point) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

const getPathPoints = (svgPathString: string, numPoints = 100): Point[] => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', svgPathString);
  const length = path.getTotalLength();
  const points: Point[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const p = path.getPointAtLength((i / numPoints) * length);
    points.push({ x: p.x, y: p.y });
  }
  return points;
};

// Helper to extract stroke start points and directions for guides
const getStrokeGuides = (d: string) => {
  if (!d) return [];
  // Split by Move commands (M or m) to separate strokes
  const segments = d.split(/(?=[Mm])/).filter(s => s.trim().length > 0);
  
  return segments.map((seg, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', seg);
    
    const len = path.getTotalLength();
    if (len === 0) return null;

    const start = path.getPointAtLength(0);
    // Use a small offset relative to stroke length, but clamp it to avoid going too far
    const offset = Math.min(8, len / 2);
    const end = path.getPointAtLength(offset); 
    
    // Calculate angle in degrees
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
    
    return {
      id: i + 1,
      x: start.x,
      y: start.y,
      angle
    };
  }).filter((g): g is { id: number, x: number, y: number, angle: number } => !!g);
};

// --- Shark Customization Data ---
const SHARK_PALETTES: Record<SharkColor, { body: string, stroke: string, belly: string, fin: string }> = {
  blue: { body: '#0ea5e9', stroke: '#0369a1', belly: '#bae6fd', fin: '#0284c7' },
  pink: { body: '#f472b6', stroke: '#be185d', belly: '#fbcfe8', fin: '#ec4899' },
  green: { body: '#4ade80', stroke: '#15803d', belly: '#bbf7d0', fin: '#22c55e' },
  purple: { body: '#a78bfa', stroke: '#7c3aed', belly: '#ddd6fe', fin: '#8b5cf6' },
};

// --- Components ---

// 1. Friendly Shark SVG Component
const FriendlyShark: React.FC<{ className?: string, config?: SharkConfig }> = ({ className, config }) => {
  const { color, accessory } = config || { color: 'blue', accessory: 'none' };
  const palette = SHARK_PALETTES[color];

  return (
    <svg viewBox="0 0 200 160" className={className} style={{ overflow: 'visible' }}>
      <g className="animate-float">
        {/* Tail */}
        <path d="M 160 80 Q 170 80 190 30 L 182 80 L 175 125 Q 165 90 160 80" 
              fill={palette.body} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" />
        {/* Body */}
        <path d="M 30 85 Q 30 35 110 35 Q 160 35 160 80 Q 160 135 90 135 Q 30 135 30 85 Z" 
              fill={palette.body} stroke={palette.stroke} strokeWidth="3" />
        {/* Belly */}
        <path d="M 35 95 Q 90 130 145 105 Q 100 130 35 95" 
              fill={palette.belly} opacity="0.6" />
        {/* Dorsal Fin */}
        <path d="M 95 40 L 115 5 Q 120 30 140 50" 
              fill={palette.body} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" />
        {/* Pectoral Fin */}
        <path d="M 105 95 Q 95 135 70 145 Q 115 125 130 105" 
              fill={palette.fin} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" 
              className="animate-[bounce_2s_infinite]" />
        {/* Gills */}
        <path d="M 130 70 Q 125 80 130 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M 140 70 Q 135 80 140 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M 150 70 Q 145 80 150 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        {/* Eyes */}
        <g transform="translate(55, 65)">
           <circle r="13" fill="white" stroke="#0c4a6e" strokeWidth="2" />
           <circle r="5" fill="black" cx="3">
              <animate attributeName="cx" values="3;6;3" dur="4s" repeatCount="indefinite" />
           </circle>
           <path d="M -10 -18 Q 0 -25 10 -18" fill="none" stroke="#0c4a6e" strokeWidth="2" opacity="0.6"/>
        </g>
        {/* Mouth */}
        <path d="M 40 95 Q 60 110 80 95" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <path d="M 75 102 L 78 107 L 81 100" fill="white" stroke="none" />
        
        {/* Accessories */}
        {accessory === 'hat' && (
          <g transform="translate(90, 15) rotate(-10)">
            <path d="M 0 20 L 40 20 L 20 -20 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <circle cx="20" cy="-20" r="5" fill="#ef4444" />
            <path d="M 0 20 Q 20 25 40 20" fill="none" stroke="#d97706" strokeWidth="2" />
          </g>
        )}
        {accessory === 'glasses' && (
          <g transform="translate(58, 65)">
            <circle cx="-5" cy="0" r="15" fill="#1f2937" opacity="0.8" />
            <circle cx="25" cy="0" r="15" fill="#1f2937" opacity="0.8" />
            <line x1="10" y1="0" x2="10" y2="0" stroke="#1f2937" strokeWidth="3" />
            <path d="M 10 0 L 10 0" stroke="#1f2937" strokeWidth="2" />
          </g>
        )}
        {accessory === 'bowtie' && (
          <g transform="translate(60, 115) rotate(10)">
            <path d="M 0 0 L -10 -10 L -10 10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <path d="M 0 0 L 10 -10 L 10 10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <circle cx="0" cy="0" r="3" fill="#b91c1c" />
          </g>
        )}
      </g>
    </svg>
  );
};

// 2. Intro Screen
const IntroScreen: React.FC<{ onStart: () => void, sharkConfig: SharkConfig }> = ({ onStart, sharkConfig }) => {
  const handleStart = () => {
    speak("欢迎来到鲨鱼字母乐园！", 'zh-CN');
    onStart();
  };

  return (
    <div className="h-full bg-ocean-500 flex flex-col items-center justify-center overflow-hidden relative selection:bg-none">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-10 text-4xl animate-bubble-rise opacity-0" style={{animationDelay: '0s'}}>🫧</div>
        <div className="absolute bottom-0 left-1/4 text-2xl animate-bubble-rise opacity-0" style={{animationDelay: '1.5s'}}>🫧</div>
        <div className="absolute bottom-0 right-1/4 text-5xl animate-bubble-rise opacity-0" style={{animationDelay: '0.5s'}}>🫧</div>
        <div className="absolute bottom-0 right-10 text-3xl animate-bubble-rise opacity-0" style={{animationDelay: '2s'}}>🫧</div>
      </div>

      <div className="z-10 flex flex-col items-center text-center p-4">
        <div className="w-64 h-48 mb-4 cursor-pointer transform transition-transform active:scale-95 flex items-center justify-center" onClick={() => speak("我是鲨鱼宝宝！", 'zh-CN')}>
          <FriendlyShark className="w-full h-full drop-shadow-2xl" config={sharkConfig} />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-4 tracking-wide">
          Sharky Letters
        </h1>
        <p className="text-ocean-100 text-xl md:text-3xl font-bold mb-12 opacity-90">
          Ready to learn?
        </p>

        <button 
          onClick={handleStart}
          className="bg-sand text-orange-600 text-3xl md:text-5xl font-black py-6 px-20 rounded-full shadow-[0_8px_0_rgb(234,88,12)] 
                     hover:bg-white hover:scale-105 transition-all duration-300 active:scale-95 active:shadow-none active:translate-y-2"
        >
          开始游戏
        </button>
      </div>
    </div>
  );
};

// 3. Settings Modal
const SettingsModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  config: SharkConfig, 
  onChange: (c: SharkConfig) => void 
}> = ({ isOpen, onClose, config, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md animate-bounce-gentle" style={{ animation: 'none' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-ocean-900">装扮鲨鱼</h2>
          <button onClick={onClose} className="text-2xl bg-gray-200 rounded-full w-10 h-10 hover:bg-gray-300">✕</button>
        </div>

        <div className="flex justify-center mb-8 bg-ocean-100 rounded-2xl p-4">
          <div className="w-48 h-32">
            <FriendlyShark className="w-full h-full" config={config} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-3">颜色 (Color)</h3>
            <div className="flex gap-4 justify-center">
              {(['blue', 'pink', 'green', 'purple'] as SharkColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onChange({ ...config, color: c })}
                  className={`w-12 h-12 rounded-full border-4 shadow-sm transform transition-transform active:scale-90 ${config.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: SHARK_PALETTES[c].body }}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-3">装饰 (Accessory)</h3>
            <div className="flex gap-3 justify-center">
              {[
                { id: 'none', label: '无', icon: '🚫' },
                { id: 'hat', label: '帽子', icon: '🎩' },
                { id: 'glasses', label: '墨镜', icon: '🕶️' },
                { id: 'bowtie', label: '领结', icon: '🎀' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChange({ ...config, accessory: item.id as SharkAccessory })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${config.accessory === item.id ? 'bg-ocean-100 border-ocean-500' : 'border-gray-200 hover:border-ocean-300'}`}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs font-bold text-gray-600">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={onClose}
            className="bg-ocean-500 text-white text-xl font-bold py-3 px-12 rounded-full shadow-lg hover:bg-ocean-600 active:translate-y-1 active:shadow-none"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Confetti Component
const Confetti: React.FC = () => {
  const particles = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.2, 
    duration: Math.random() * 2 + 1.5,
    color: ['#fb7185', '#fcd34d', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'][Math.floor(Math.random() * 6)]
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 md:w-4 md:h-4 rounded-sm shadow-sm opacity-90"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`
          }}
        />
      ))}
    </div>
  );
};

// 5. Shark Reward Animation
// Enhanced to support multiple random animation types
const SharkReward: React.FC<{ sharkConfig: SharkConfig }> = ({ sharkConfig }) => {
  const [animationType, setAnimationType] = useState('celebration-swim');

  useEffect(() => {
    speak("太棒了！", 'zh-CN');
    const types = [
      'celebration-swim', 
      'celebration-spin', 
      'celebration-jump',
      'celebration-zigzag'
    ];
    // Randomly select an animation
    setAnimationType(types[Math.floor(Math.random() * types.length)]);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-hidden">
      <style>{`
        /* Classic Swim */
        @keyframes celebration-swim {
          0% { transform: translate(-100vw, 100px) rotate(-15deg) scale(0.5); opacity: 0; }
          20% { transform: translate(-50vw, 50px) rotate(10deg) scale(0.8); opacity: 1; }
          40% { transform: translate(-5vw, -50px) rotate(-10deg) scale(1.2); }
          50% { transform: translate(0, 0) rotate(0deg) scale(1.5); }
          60% { transform: translate(5vw, -50px) rotate(10deg) scale(1.2); }
          80% { transform: translate(50vw, 50px) rotate(-10deg) scale(0.8); opacity: 1; }
          100% { transform: translate(100vw, 100px) rotate(15deg) scale(0.5); opacity: 0; }
        }
        /* Happy Spin */
        @keyframes celebration-spin {
          0% { transform: scale(0); opacity: 0; }
          30% { transform: scale(1.2) rotate(0deg); opacity: 1; }
          50% { transform: scale(1) rotate(180deg); }
          70% { transform: scale(1.2) rotate(360deg); }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        /* Jump */
        @keyframes celebration-jump {
          0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
          40% { transform: translateY(0) scale(1.5); opacity: 1; }
          50% { transform: translateY(-20px) scale(1.6); }
          60% { transform: translateY(0) scale(1.5); }
          100% { transform: translateY(100vh) scale(0.5); opacity: 0; }
        }
        /* Zigzag */
        @keyframes celebration-zigzag {
          0% { transform: translate(-100vw, 0) scale(0.8); }
          25% { transform: translate(-50vw, -100px) rotate(15deg) scale(1); }
          50% { transform: translate(0, 0) rotate(-15deg) scale(1.2); }
          75% { transform: translate(50vw, -100px) rotate(15deg) scale(1); }
          100% { transform: translate(100vw, 0) scale(0.8); }
        }

        @keyframes text-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <Confetti />
      <div 
        className="absolute z-20 w-64 h-64 md:w-96 md:h-96"
        style={{ animation: `${animationType} 3.5s ease-in-out forwards` }}
      >
        <FriendlyShark className="w-full h-full drop-shadow-2xl" config={sharkConfig} />
      </div>
      <div 
        className="absolute z-30 text-6xl md:text-8xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
        style={{ animation: 'text-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.5s forwards', opacity: 0, transform: 'scale(0)' }}
      >
        太棒了!
      </div>
    </div>
  );
};

// 6. Image Generation Modal (Gemini)
const ImageGenModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  letter: LetterConfig;
  currentImage: string | null;
  onSave: (img: string) => void;
}> = ({ isOpen, onClose, letter, currentImage, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  
  // Default prompt designed for generation
  const defaultPrompt = `Cute cartoon ${letter.word}, 3d render, vivid colors, children's book style illustration, white background`;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Enforce style consistency for children's app
      const styleSuffix = ", vivid children's book illustration style, 3d render, cute, colorful";
      let activePrompt = prompt.trim();
      
      if (!activePrompt) {
        activePrompt = defaultPrompt; 
      } else {
        // If user provides a prompt (e.g., "Add sunglasses"), we append style instructions
        // to ensure the output remains appropriate for the app's theme.
        activePrompt = `${activePrompt} ${styleSuffix}`;
      }
      
      let response;
      
      // If we have an existing custom image, we edit it
      if (currentImage) {
         // Image-to-Image / Editing
         const base64Data = currentImage.split(',')[1];
         response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png', 
                    data: base64Data
                  }
                },
                { text: activePrompt }
              ]
            }
         });
      } else {
         // Text-to-Image Generation
         // Since we can't easily send the emoji as an image without rasterizing,
         // we just generate a new image from the prompt for the first time.
         response = await ai.models.generateContent({
           model: 'gemini-2.5-flash-image',
           contents: {
             parts: [{ text: activePrompt }]
           }
         });
      }

      // Extract image from response
      let foundImage = false;
      if (response && response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64String = part.inlineData.data;
            const url = `data:image/png;base64,${base64String}`;
            setGeneratedPreview(url);
            foundImage = true;
            break;
          }
        }
      }
      
      if (!foundImage) {
        setError("无法生成图片，请重试 (Could not generate image)");
      }

    } catch (e: any) {
      console.error(e);
      setError("Error: " + (e.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-ocean-900">魔法画笔 (Magic Art)</h2>
          <button onClick={onClose} className="text-2xl bg-gray-100 rounded-full w-10 h-10 hover:bg-gray-200">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center mb-6">
             <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-4 shadow-inner relative">
                {generatedPreview ? (
                  <img src={generatedPreview} alt="Generated" className="w-full h-full object-cover" />
                ) : currentImage ? (
                  <img src={currentImage} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-8xl">{letter.emoji}</span>
                )}
             </div>
             {isLoading && <div className="text-ocean-500 font-bold animate-pulse">正在施展魔法... (Generating...)</div>}
             {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              {currentImage ? "描述你想怎么修改 (Edit):" : "描述你想画什么 (Create):"}
            </label>
            <textarea 
              className="w-full p-3 border-2 border-ocean-200 rounded-xl focus:border-ocean-500 focus:outline-none"
              rows={3}
              placeholder={currentImage ? "Add a hat, Remove background..." : defaultPrompt}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Gemini will enhance your prompt to make it vivid and cute!
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-xl font-black text-white shadow-md transition-transform active:scale-95
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-ocean-500 hover:bg-ocean-600'}
            `}
          >
            {currentImage ? "修改图片 (Update)" : "生成图片 (Create)"}
          </button>
          
          {generatedPreview && (
            <button 
              onClick={() => { onSave(generatedPreview); onClose(); }}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black hover:bg-green-600 shadow-md active:scale-95"
            >
              保存 (Save)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// 7. Home View
const HomeView: React.FC<{ 
  progress: LetterProgress, 
  customImages: Record<string, string>,
  onSelectLetter: (letter: LetterConfig) => void,
  onOpenSettings: () => void 
}> = ({ progress, customImages, onSelectLetter, onOpenSettings }) => {
  return (
    <div className="h-full bg-ocean-500 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-ocean-500/90 backdrop-blur-sm z-10 py-2">
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-md">字母表</h1>
          <button 
            onClick={onOpenSettings}
            className="bg-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-12">
          {LETTERS.map((letter) => {
            const isCompleted = progress[letter.char];
            const customImg = customImages[letter.char];
            
            return (
              <div
                key={letter.char}
                onClick={() => onSelectLetter(letter)}
                className={`
                  relative aspect-square rounded-3xl flex flex-col items-center justify-center cursor-pointer
                  transition-all duration-200 shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none
                  ${isCompleted ? 'bg-sand text-ocean-900 ring-4 ring-yellow-400' : 'bg-white text-gray-700 hover:bg-ocean-100'}
                `}
              >
                {/* Sound Button on the card */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the letter view
                    speak(letter.char.toLowerCase(), 'en-US');
                  }}
                  className="absolute top-2 right-2 w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center text-xl hover:bg-ocean-200 active:scale-90 transition-transform z-10"
                >
                  🔊
                </button>

                <span className="text-6xl md:text-7xl font-black mb-2 select-none relative z-0">
                  {letter.char}
                </span>
                
                {/* Small indicator if custom image exists */}
                {customImg && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                    <img src={customImg} alt="custom" className="w-full h-full object-cover" />
                  </div>
                )}

                {isCompleted && (
                  <div className="absolute bottom-2 right-2 text-3xl animate-bounce-gentle z-10">
                    🦈
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 8. Letter Tracing View
const LetterView: React.FC<{ 
  letter: LetterConfig, 
  onBack: () => void, 
  onComplete: () => void,
  sharkConfig: SharkConfig,
  customImage: string | null,
  onUpdateImage: (img: string) => void
}> = ({ letter, onBack, onComplete, sharkConfig, customImage, onUpdateImage }) => {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDemonstrating, setIsDemonstrating] = useState(true);
  const [averageError, setAverageError] = useState(0);
  const [guideFlash, setGuideFlash] = useState(false);
  const [showLowercase, setShowLowercase] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathPoints = useMemo(() => getPathPoints(letter.svgPath), [letter]);
  // Calculate guides (stroke order indicators)
  const guides = useMemo(() => getStrokeGuides(letter.svgPath), [letter]);
  
  const isDragging = useRef(false);

  // Initial demonstration and audio
  useEffect(() => {
    setStrokes([]);
    setIsDemonstrating(true);
    
    // Audio Sequence: Letter -> Wait -> Word
    speak(letter.char.toLowerCase(), 'en-US'); // Say letter
    const wordTimer = setTimeout(() => {
      speak(letter.word, 'en-US'); // Say word
    }, 1500);

    const timer = setTimeout(() => setIsDemonstrating(false), 3500); // Wait for demo animation
    
    return () => {
      clearTimeout(timer);
      clearTimeout(wordTimer);
    };
  }, [letter]);

  // Handle re-drawing
  const handleReplay = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setAverageError(0);
    setIsDemonstrating(true);
    speak(letter.char.toLowerCase(), 'en-US');
    
    setTimeout(() => {
      setIsDemonstrating(false);
    }, 3500);
  };

  // Canvas drawing logic
  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Map to 0-100 coordinate space
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDemonstrating) return;
    isDragging.current = true;
    const p = getCanvasPoint(e);
    setCurrentStroke([p]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || isDemonstrating) return;
    e.preventDefault(); // Prevent scrolling while drawing
    const p = getCanvasPoint(e);
    setCurrentStroke(prev => [...prev, p]);
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke([]);
    checkSuccess(newStrokes);
  };

  const checkSuccess = (currentStrokes: Point[][]) => {
    const allUserPoints = currentStrokes.flat();
    if (allUserPoints.length < 10) return;

    let totalDist = 0;
    let maxDist = 0;

    // Check 1: Average distance from guide path (Precision)
    for (const p of allUserPoints) {
      let minDist = Infinity;
      for (const targetP of pathPoints) {
        const d = dist(p, targetP);
        if (d < minDist) minDist = d;
      }
      totalDist += minDist;
      if (minDist > maxDist) maxDist = minDist;
    }
    const avgError = totalDist / allUserPoints.length;
    setAverageError(avgError);

    // ANTI-SCRIBBLE CHECK:
    // If drawing is too far from the line on average, reject it immediately.
    if (avgError > 8) { // Threshold for "messy"
       speak("请沿着线写", 'zh-CN');
       setGuideFlash(true); // Trigger visual flash
       setTimeout(() => setGuideFlash(false), 800);
       setStrokes([]); // Reset strokes
       return;
    }

    // Check 2: Coverage (Completeness)
    let coveredCount = 0;
    const coverageThreshold = 7; 
    
    for (const targetP of pathPoints) {
      let isCovered = false;
      for (const p of allUserPoints) {
        if (dist(p, targetP) < coverageThreshold) {
          isCovered = true;
          break;
        }
      }
      if (isCovered) coveredCount++;
    }

    const coverage = coveredCount / pathPoints.length;

    // Success Condition: High coverage + Low error
    if (coverage > 0.92 && avgError < 6) {
      setTimeout(onComplete, 500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-ocean-500">
      {/* Header - Fixed at top */}
      <div className="flex-none flex justify-between items-center p-4">
        <button onClick={onBack} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
          🔙
        </button>
        <div className="flex gap-4">
          <button 
             onClick={() => setShowLowercase(!showLowercase)} 
             className={`bg-white/20 px-4 py-2 rounded-xl text-white font-bold text-xl active:scale-95 border-2 ${showLowercase ? 'border-white bg-white/30' : 'border-transparent'}`}
          >
            Aa
          </button>
          <button onClick={handleReplay} className="bg-white/20 p-3 rounded-full text-white text-2xl active:scale-95">
            ↺
          </button>
        </div>
      </div>

      {/* Main Content - Scrollable if needed, but flex-centered usually */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="min-h-full flex flex-col items-center justify-center p-4">
          
          <div className="bg-white rounded-[3rem] p-6 shadow-2xl flex flex-col items-center w-full max-w-2xl relative">
            {/* Visual Guide Flash Overlay (Anti-scribble feedback) */}
            <div className={`absolute inset-0 rounded-[3rem] border-8 pointer-events-none transition-colors duration-300 ${guideFlash ? 'border-coral animate-pulse' : 'border-transparent'}`}></div>

            <div className="flex items-center gap-8 mb-4">
              <span className="text-8xl md:text-9xl font-black text-ocean-900 select-none">
                {showLowercase ? `${letter.char} ${letter.char.toLowerCase()}` : letter.char}
              </span>
              <div className="flex flex-col items-center relative group">
                <div className="relative">
                  {customImage ? (
                    <img src={customImage} alt={letter.word} className="w-24 h-24 object-contain animate-bounce-gentle rounded-lg" />
                  ) : (
                    <span className="text-6xl select-none animate-bounce-gentle block">{letter.emoji}</span>
                  )}
                  {/* Magic Wand Button */}
                  <button 
                    onClick={() => setShowMagicModal(true)}
                    className="absolute -bottom-2 -right-2 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 hover:bg-purple-600"
                    title="Customize Image"
                  >
                    ✨
                  </button>
                </div>
                <span className="text-2xl text-gray-500 font-bold mt-2">{letter.word}</span>
              </div>
            </div>

            {/* Tracing Area */}
            <div className={`relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] shrink-0 touch-none ${guideFlash ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                   <path id="letterPath" d={letter.svgPath} />
                   <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                   </filter>
                </defs>

                {/* Dashed Background Guide - Mimics worksheet */}
                <use 
                  href="#letterPath" 
                  stroke={guideFlash ? '#fb7185' : '#e5e7eb'} 
                  strokeWidth="12" 
                  strokeDasharray="16 16"
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-colors duration-300"
                />

                {/* Stroke Order Guides (Numbered steps + Arrows) */}
                {!isDemonstrating && guides.map((g) => (
                  <g key={g.id} transform={`translate(${g.x}, ${g.y})`} className="pointer-events-none transition-opacity duration-300 opacity-90">
                    {/* Number Bubble */}
                    <circle r="4" fill="#0ea5e9" stroke="white" strokeWidth="1" className="drop-shadow-sm" />
                    <text 
                      y="1.5" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="white" 
                      fontSize="5" 
                      fontFamily="Varela Round, sans-serif" 
                      fontWeight="bold"
                    >
                      {g.id}
                    </text>
                    
                    {/* Direction Chevron Arrow */}
                    <g transform={`rotate(${g.angle}) translate(9, 0)`}>
                      <path d="M 0 -2 L 3 0 L 0 2" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </g>
                ))}
                
                {/* Demonstration Animation Stroke + Moving Cursor */}
                {isDemonstrating && (
                  <>
                    <use 
                      href="#letterPath" 
                      stroke="#fbbf24" 
                      strokeWidth="12" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="animate-[dash_3.5s_linear_forwards]"
                      strokeDasharray="300"
                      strokeDashoffset="300"
                    />
                    {/* Moving Pencil Icon showing direction */}
                    <circle r="8" fill="#fbbf24" stroke="white" strokeWidth="2" filter="url(#glow)">
                        <animateMotion dur="3.5s" fill="freeze" calcMode="linear">
                           <mpath href="#letterPath" />
                        </animateMotion>
                    </circle>
                  </>
                )}
                
                {/* Render User Strokes */}
                {strokes.map((stroke, i) => (
                  <polyline 
                    key={i} 
                    points={stroke.map(p => `${p.x},${p.y}`).join(' ')} 
                    fill="none" 
                    stroke="#0ea5e9" 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                ))}
                {/* Current Active Stroke */}
                <polyline 
                  points={currentStroke.map(p => `${p.x},${p.y}`).join(' ')} 
                  fill="none" 
                  stroke="#0ea5e9" 
                  strokeWidth="12" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>

              {/* Interaction Layer */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair opacity-0"
                width={400}
                height={400}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            </div>
            
            <p className="mt-6 text-gray-400 font-bold text-lg">
              {isDemonstrating ? "看这里！" : "请沿着线写"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer / Shark Helper */}
      <div className="flex-none p-4 flex justify-center pointer-events-none">
        <FriendlyShark className="w-24 h-24" config={sharkConfig} />
      </div>

      <ImageGenModal 
        isOpen={showMagicModal} 
        onClose={() => setShowMagicModal(false)}
        letter={letter}
        currentImage={customImage}
        onSave={(img) => onUpdateImage(img)}
      />
    </div>
  );
};

// 9. Main App
export default function App() {
  const [view, setView] = useState<AppView>(AppView.INTRO);
  const [currentLetter, setCurrentLetter] = useState<LetterConfig | null>(null);
  const [completedLetters, setCompletedLetters] = useState<LetterProgress>({});
  const [showReward, setShowReward] = useState(false);
  const [sharkConfig, setSharkConfig] = useState<SharkConfig>({ color: 'blue', accessory: 'none' });
  const [showSettings, setShowSettings] = useState(false);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  const handleStart = () => setView(AppView.HOME);

  const handleSelectLetter = (letter: LetterConfig) => {
    setCurrentLetter(letter);
    setView(AppView.LETTER);
  };

  const handleComplete = () => {
    if (currentLetter) {
      setCompletedLetters(prev => ({ ...prev, [currentLetter.char]: true }));
      setShowReward(true);
      setTimeout(() => {
        setShowReward(false);
        setView(AppView.HOME);
        setCurrentLetter(null);
      }, 4000);
    }
  };

  const handleUpdateImage = (img: string) => {
     if (currentLetter) {
       setCustomImages(prev => ({ ...prev, [currentLetter.char]: img }));
     }
  };

  return (
    <div className="h-full w-full relative">
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
      
      {view === AppView.INTRO && (
        <IntroScreen onStart={handleStart} sharkConfig={sharkConfig} />
      )}

      {view === AppView.HOME && (
        <HomeView 
          progress={completedLetters} 
          customImages={customImages}
          onSelectLetter={handleSelectLetter} 
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {view === AppView.LETTER && currentLetter && (
        <LetterView 
          letter={currentLetter} 
          onBack={() => setView(AppView.HOME)} 
          onComplete={handleComplete}
          sharkConfig={sharkConfig}
          customImage={customImages[currentLetter.char]}
          onUpdateImage={handleUpdateImage}
        />
      )}

      {showReward && (
        <SharkReward sharkConfig={sharkConfig} />
      )}

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        config={sharkConfig}
        onChange={setSharkConfig}
      />
    </div>
  );
}
