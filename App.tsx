
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LETTERS } from './constants';
import { LetterConfig, Point, AppView, LetterProgress, SharkConfig, SharkColor, SharkAccessory } from './types';

// --- Sound Utilities ---
// Defaults to Chinese (zh-CN) for prompts, allows en-US for letters.
// rate 0.5 is slower (approx half speed), pitch 1.0 is gentler/natural.
const speak = (text: string, lang: 'en-US' | 'zh-CN' = 'zh-CN', rate = 0.5) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
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

// --- Shark Customization Data ---
const SHARK_PALETTES: Record<SharkColor, { body: string, stroke: string, belly: string, fin: string }> = {
  blue: { body: '#0ea5e9', stroke: '#0369a1', belly: '#bae6fd', fin: '#0284c7' },
  pink: { body: '#f472b6', stroke: '#be185d', belly: '#fbcfe8', fin: '#ec4899' },
  green: { body: '#4ade80', stroke: '#15803d', belly: '#bbf7d0', fin: '#22c55e' },
  purple: { body: '#a78bfa', stroke: '#7c3aed', belly: '#ddd6fe', fin: '#8b5cf6' },
};

// --- Components ---

// 1. Friendly Shark SVG Component (Redesigned with Customization)
const FriendlyShark: React.FC<{ className?: string, config?: SharkConfig }> = ({ className, config }) => {
  // Default to blue and no accessory if not provided
  const { color, accessory } = config || { color: 'blue', accessory: 'none' };
  const palette = SHARK_PALETTES[color];

  return (
    <svg viewBox="0 0 200 160" className={className} style={{ overflow: 'visible' }}>
      <g className="animate-float">
        {/* Tail - Classic Heterocercal Shark Shape */}
        <path d="M 160 80 Q 170 80 190 30 L 182 80 L 175 125 Q 165 90 160 80" 
              fill={palette.body} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" />

        {/* Body Shape - Streamlined and Shark-like */}
        <path d="M 30 85 Q 30 35 110 35 Q 160 35 160 80 Q 160 135 90 135 Q 30 135 30 85 Z" 
              fill={palette.body} stroke={palette.stroke} strokeWidth="3" />
        
        {/* Belly Patch (Countershading) */}
        <path d="M 35 95 Q 90 130 145 105 Q 100 130 35 95" 
              fill={palette.belly} opacity="0.6" />

        {/* Dorsal Fin - Prominent Triangle */}
        <path d="M 95 40 L 115 5 Q 120 30 140 50" 
              fill={palette.body} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" />

        {/* Pectoral Fin (Side) */}
        <path d="M 105 95 Q 95 135 70 145 Q 115 125 130 105" 
              fill={palette.fin} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" 
              className="animate-[bounce_2s_infinite]" />

        {/* Gills - Distinctive Feature */}
        <path d="M 130 70 Q 125 80 130 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M 140 70 Q 135 80 140 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M 150 70 Q 145 80 150 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

        {/* Eyes - Big & Friendly */}
        <g transform="translate(55, 65)">
           <circle r="13" fill="white" stroke="#0c4a6e" strokeWidth="2" />
           <circle r="5" fill="black" cx="3">
              <animate attributeName="cx" values="3;6;3" dur="4s" repeatCount="indefinite" />
           </circle>
           {/* Cute Eyebrow */}
           <path d="M -10 -18 Q 0 -25 10 -18" fill="none" stroke="#0c4a6e" strokeWidth="2" opacity="0.6"/>
        </g>

        {/* Mouth - Friendly Smile */}
        <path d="M 40 95 Q 60 110 80 95" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        {/* Tiny Tooth (Cute) */}
        <path d="M 75 102 L 78 107 L 81 100" fill="white" stroke="none" />

        {/* --- Accessories --- */}
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
    // Changed min-h-screen to h-full
    <div className="h-full bg-ocean-500 flex flex-col items-center justify-center overflow-hidden relative selection:bg-none">
      {/* Animated Background Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-10 text-4xl animate-bubble-rise opacity-0" style={{animationDelay: '0s'}}>🫧</div>
        <div className="absolute bottom-0 left-1/4 text-2xl animate-bubble-rise opacity-0" style={{animationDelay: '1.5s'}}>🫧</div>
        <div className="absolute bottom-0 right-1/4 text-5xl animate-bubble-rise opacity-0" style={{animationDelay: '0.5s'}}>🫧</div>
        <div className="absolute bottom-0 right-10 text-3xl animate-bubble-rise opacity-0" style={{animationDelay: '2s'}}>🫧</div>
      </div>

      {/* Main Character & Title */}
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

// NEW: Settings Modal
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

// NEW: Confetti Component
const Confetti: React.FC = () => {
  // Generate random particles once
  const particles = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
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

// 3. Shark Reward Animation
const SharkReward: React.FC<{ sharkConfig: SharkConfig }> = ({ sharkConfig }) => {
  useEffect(() => {
    speak("太棒了！", 'zh-CN');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Added Confetti Background */}
      <Confetti />
      
      <div className="absolute animate-swim-across w-64 h-64 md:w-96 md:h-96 z-10">
        <FriendlyShark className="w-full h-full drop-shadow-2xl" config={sharkConfig} />
      </div>
      
      {/* Celebration Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
         <div className="text-6xl animate-bounce-gentle" style={{animationDelay: '0.1s'}}>🫧</div>
         <div className="text-5xl animate-bounce-gentle absolute top-1/4 left-1/4" style={{animationDelay: '0.3s'}}>🫧</div>
         <div className="text-5xl animate-bounce-gentle absolute bottom-1/4 right-1/4" style={{animationDelay: '0.5s'}}>🫧</div>
      </div>
      
      <div className="absolute top-1/4 text-white text-6xl font-black drop-shadow-lg animate-pulse z-20">
        太棒了!
      </div>
    </div>
  );
};

// 4. Letter View
const LetterView: React.FC<{ letter: LetterConfig, onBack: () => void, onComplete: () => void, sharkConfig: SharkConfig }> = ({ letter, onBack, onComplete, sharkConfig }) => {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDemonstrating, setIsDemonstrating] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeCanvas, setShakeCanvas] = useState(false);
  const [guideFlash, setGuideFlash] = useState(false);
  const [showLowercase, setShowLowercase] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Calculate target points from SVG path for validation
  const targetPoints = useMemo(() => getPathPoints(letter.svgPath, 150), [letter]);

  useEffect(() => {
    // Sequence: Say letter -> wait ~1.5s -> Say word
    // Use lowercase char for pronunciation to avoid "Capital A"
    const letterTimeout = setTimeout(() => {
      speak(letter.char.toLowerCase(), 'en-US', 0.5);
    }, 500);
    
    const wordTimeout = setTimeout(() => {
      speak(letter.word, 'en-US', 0.5);
    }, 2000); // 1.5s gap after letter

    // Demonstration animation timer
    const demoTimeout = setTimeout(() => {
      setIsDemonstrating(false);
    }, 3500); // Allow time for animation to finish

    return () => {
      clearTimeout(letterTimeout);
      clearTimeout(wordTimeout);
      clearTimeout(demoTimeout);
      window.speechSynthesis.cancel();
    };
  }, [letter]);

  // Handle Manual Replay/Reset
  const handleReplay = () => {
    setIsDemonstrating(true);
    setStrokes([]);
    speak("我们再试一次", 'zh-CN', 0.6);
    // Important: We must re-enable drawing after the demo finishes
    setTimeout(() => {
      setIsDemonstrating(false);
    }, 3500);
  };

  // Touch Handling
  const getTouchPos = (e: React.TouchEvent | React.MouseEvent): Point | null => {
    if (!svgRef.current) return null;
    const svgRect = svgRef.current.getBoundingClientRect();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // Map screen coordinates to SVG viewBox 0-100
    return {
      x: ((clientX - svgRect.left) / svgRect.width) * 100,
      y: ((clientY - svgRect.top) / svgRect.height) * 100
    };
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (showSuccess || isDemonstrating) return;
    const pos = getTouchPos(e);
    if (pos) setCurrentStroke([pos]);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (showSuccess || isDemonstrating || currentStroke.length === 0) return;
    const pos = getTouchPos(e);
    if (pos) {
      setCurrentStroke(prev => [...prev, pos]);
    }
  };

  const handleEnd = () => {
    if (showSuccess || isDemonstrating || currentStroke.length === 0) return;
    
    // -- STRICTURE CHECK (Anti-Scribble) --
    // Check average distance of the stroke from the guide line
    let totalError = 0;
    currentStroke.forEach(p => {
      let minD = Infinity;
      targetPoints.forEach(tp => {
        const d = dist(p, tp);
        if (d < minD) minD = d;
      });
      totalError += minD;
    });

    const averageError = totalError / currentStroke.length;
    
    // If average error is too high (scribbling), reject the stroke and RESET
    if (averageError > 8) { // Threshold for "messy" drawing
      setShakeCanvas(true);
      setGuideFlash(true); // Visual cue: flash the guide
      speak("请沿着线写哦", 'zh-CN', 0.6); // "Please write along the line"
      setCurrentStroke([]);
      setStrokes([]); // Reset all strokes to give a clean slate
      setTimeout(() => {
        setShakeCanvas(false);
        setGuideFlash(false);
      }, 800);
      return;
    }

    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke([]);
    checkSuccess(newStrokes);
  };

  const checkSuccess = (currentStrokes: Point[][]) => {
    // Flatten user points
    const userPoints = currentStrokes.flat();
    if (userPoints.length < 10) return;

    // 1. Coverage: How many target points are "close enough" to a user point?
    let coveredCount = 0;
    const coverageThreshold = 7; // Distance to consider "covered"
    
    targetPoints.forEach(tp => {
      const isCovered = userPoints.some(up => dist(tp, up) < coverageThreshold);
      if (isCovered) coveredCount++;
    });

    const coverage = coveredCount / targetPoints.length;

    // 2. Strict completion requirement
    if (coverage > 0.92) {
      setShowSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 3500); // Wait for shark animation
    }
  };

  return (
    <div className="fixed inset-0 bg-ocean-300 flex flex-col">
      {/* Header - Fixed at top, flex-none ensures it doesn't shrink */}
      <div className="flex-none flex justify-between items-center p-4 bg-ocean-300 z-10 shadow-sm">
        <button onClick={onBack} className="bg-white/80 p-3 rounded-full text-2xl shadow-md active:scale-90 transition-transform">
          🏠
        </button>
        <div className="flex items-center space-x-3">
           {/* Lowercase Toggle */}
           <button 
            onClick={() => setShowLowercase(!showLowercase)} 
            className={`w-12 h-12 rounded-full font-black text-xl shadow-md active:scale-95 flex items-center justify-center transition-colors ${showLowercase ? 'bg-ocean-500 text-white' : 'bg-white/80 text-ocean-900'}`}
          >
            Aa
          </button>
          
          <button onClick={() => speak(letter.char.toLowerCase(), 'en-US')} className="bg-white/80 px-6 py-2 rounded-full font-bold text-ocean-900 shadow-md active:scale-95">
            🔊 {letter.char}
          </button>
          <button onClick={handleReplay} className="bg-sand p-3 rounded-full text-2xl shadow-md active:scale-90">
            ↺
          </button>
        </div>
      </div>

      {/* Main Learning Area - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col items-center justify-center min-h-full p-4 pb-12">
          
          {/* Emoji */}
          <div className="text-6xl mb-4 animate-bounce-gentle mt-4">{letter.emoji}</div>
          
          {/* Letter Text Display: Shows "A" or "A a" */}
          <div className="text-6xl font-black text-white drop-shadow-md mb-2 flex items-baseline gap-4">
              <span>{letter.char}</span>
              {showLowercase && <span className="text-5xl opacity-90">{letter.char.toLowerCase()}</span>}
          </div>

          <div className="text-3xl font-bold text-white mb-8 drop-shadow-md">{letter.word}</div>

          {/* Tracing Canvas Container - shrink-0 prevents flattening on small screens */}
          <div className={`relative w-[80vw] max-w-[400px] aspect-square bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-white shrink-0 ${shakeCanvas ? 'animate-[bounce-gentle_0.2s_infinite]' : ''} ${shakeCanvas ? 'border-coral' : ''}`}>
            
            <svg 
              ref={svgRef}
              viewBox="0 0 100 100" 
              className="w-full h-full touch-none cursor-crosshair"
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
            >
              {/* 1. Guide Background (Gray Outline) */}
              <path 
                d={letter.svgPath} 
                stroke={guideFlash ? "#fb7185" : "#e2e8f0"} 
                strokeWidth="14" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transition-colors duration-500 ease-in-out"
              />

              {/* 2. Target Guide (Dashed Line) */}
              <path 
                d={letter.svgPath} 
                stroke={guideFlash ? "#fda4af" : "#94a3b8"} 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                strokeDasharray="4 4"
                className="transition-colors duration-500 ease-in-out"
              />

              {/* 3. Demonstration Animation */}
              {isDemonstrating && (
                <path 
                  d={letter.svgPath} 
                  stroke="#fb7185" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="animate-[dash_3s_ease-in-out_forwards]"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                >
                  <style>{`
                    @keyframes dash {
                      to { stroke-dashoffset: 0; }
                    }
                  `}</style>
                </path>
              )}

              {/* 4. User Strokes */}
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
          </div>
          
          {/* Instruction Text */}
          <div className="mt-6 text-white text-xl font-bold opacity-80 mb-6">
            {isDemonstrating ? "仔细看哦..." : "轮到你了！"}
          </div>
        </div>
      </div>

      {showSuccess && <SharkReward sharkConfig={sharkConfig} />}
    </div>
  );
};

// 5. Home View
const HomeView: React.FC<{ 
  progress: LetterProgress, 
  onSelect: (l: LetterConfig) => void,
  onOpenSettings: () => void 
}> = ({ progress, onSelect, onOpenSettings }) => {
  return (
    // Changed min-h-screen to h-full to allow proper scrolling within fixed body
    <div className="h-full bg-ocean-100 p-4 overflow-y-auto pb-24">
      <div className="flex justify-between items-center max-w-6xl mx-auto mt-4 mb-8 px-4">
        <h1 className="text-4xl font-black text-ocean-900 drop-shadow-sm">
          字母表
        </h1>
        <button 
          onClick={onOpenSettings}
          className="bg-white p-3 rounded-full shadow-lg border-2 border-ocean-200 text-2xl hover:bg-ocean-50 active:scale-95 transition-transform"
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
        {LETTERS.map((letter) => {
          const isDone = progress[letter.char];
          return (
            <div 
              key={letter.char}
              className={`
                relative bg-white rounded-2xl shadow-lg p-2 flex flex-col items-center justify-center aspect-[4/3]
                transform transition-all duration-200 hover:scale-105 active:scale-95 border-b-4
                ${isDone ? 'border-ocean-500 bg-ocean-50 ring-2 ring-ocean-200' : 'border-gray-200'}
              `}
              onClick={() => onSelect(letter)}
            >
              <div className="flex justify-between w-full px-2 mb-1">
                 {/* Completion Indicator */}
                {isDone ? <span className="text-lg">🦈</span> : <span></span>}
                
                {/* Sound Button inside the card */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the letter view
                    speak(letter.char.toLowerCase(), 'en-US');
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-ocean-100 text-ocean-600 rounded-full hover:bg-ocean-200 active:scale-90 transition-colors"
                >
                  🔊
                </button>
              </div>

              <div className="text-6xl font-black text-gray-800 mb-1 leading-none font-sans">
                {letter.char}
              </div>
              
              <div className="text-sm text-gray-500 font-medium">
                {letter.word}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main App ---
const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.INTRO);
  const [activeLetter, setActiveLetter] = useState<LetterConfig | null>(null);
  const [progress, setProgress] = useState<LetterProgress>({});
  
  // Customization State
  const [sharkConfig, setSharkConfig] = useState<SharkConfig>({ color: 'blue', accessory: 'none' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleStart = () => {
    setView(AppView.HOME);
  };

  const handleSelectLetter = (letter: LetterConfig) => {
    setActiveLetter(letter);
    setView(AppView.LETTER);
  };

  const handleCompleteLetter = () => {
    if (activeLetter) {
      setProgress(prev => ({ ...prev, [activeLetter.char]: true }));
      setView(AppView.HOME);
      setActiveLetter(null);
    }
  };

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={sharkConfig}
        onChange={setSharkConfig}
      />
      
      {view === AppView.INTRO && <IntroScreen onStart={handleStart} sharkConfig={sharkConfig} />}
      {view === AppView.HOME && (
        <HomeView 
          progress={progress} 
          onSelect={handleSelectLetter} 
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}
      {view === AppView.LETTER && activeLetter && (
        <LetterView 
          letter={activeLetter} 
          onBack={() => setView(AppView.HOME)} 
          onComplete={handleCompleteLetter}
          sharkConfig={sharkConfig} 
        />
      )}
    </>
  );
};

export default App;
