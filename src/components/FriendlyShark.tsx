import React from 'react';
import { SharkConfig, SharkTheme } from '../../types';
import { SHARK_PALETTES } from '../modules/dressup/sharkStyle';

interface FriendlySharkProps {
  className?: string;
  config?: SharkConfig;
  theme?: SharkTheme;
  upgradeLevel?: number;
}

const FriendlyShark: React.FC<FriendlySharkProps> = ({
  className,
  config,
  theme = 'diver',
  upgradeLevel = 0,
}) => {
  const { color, accessory } = config || { color: 'blue', accessory: 'none' };
  const palette = SHARK_PALETTES[color];

  return (
    <svg viewBox="0 0 200 160" className={className} style={{ overflow: 'visible' }}>
      <g className="animate-float">
        <path
          d="M 160 80 Q 170 80 190 30 L 182 80 L 175 125 Q 165 90 160 80"
          fill={palette.body}
          stroke={palette.stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 30 85 Q 30 35 110 35 Q 160 35 160 80 Q 160 135 90 135 Q 30 135 30 85 Z"
          fill={palette.body}
          stroke={palette.stroke}
          strokeWidth="3"
        />
        <path d="M 35 95 Q 90 130 145 105 Q 100 130 35 95" fill={palette.belly} opacity="0.6" />
        <path
          d="M 95 40 L 115 5 Q 120 30 140 50"
          fill={palette.body}
          stroke={palette.stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 105 95 Q 95 135 70 145 Q 115 125 130 105"
          fill={palette.fin}
          stroke={palette.stroke}
          strokeWidth="3"
          strokeLinejoin="round"
          className="animate-[bounce_2s_infinite]"
        />
        <path d="M 130 70 Q 125 80 130 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M 140 70 Q 135 80 140 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M 150 70 Q 145 80 150 90" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

        <g transform="translate(55, 65)">
          <circle r="13" fill="white" stroke="#0c4a6e" strokeWidth="2" />
          <circle r="5" fill="black" cx="3">
            <animate attributeName="cx" values="3;6;3" dur="4s" repeatCount="indefinite" />
          </circle>
          <path d="M -10 -18 Q 0 -25 10 -18" fill="none" stroke="#0c4a6e" strokeWidth="2" opacity="0.6" />
        </g>
        <path d="M 40 95 Q 60 110 80 95" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <path d="M 75 102 L 78 107 L 81 100" fill="white" stroke="none" />

        {theme === 'space' && (
          <>
            <circle cx="20" cy="28" r="2.2" fill="#e0e7ff" />
            <circle cx="38" cy="18" r="1.6" fill="#c4b5fd" />
            <circle cx="26" cy="40" r="1.5" fill="#fdf2f8" />
          </>
        )}
        {theme === 'fire' && (
          <g opacity="0.78">
            <path d="M 168 72 Q 178 62 188 70 Q 182 70 178 80 Z" fill="#fb923c" />
            <path d="M 170 88 Q 180 78 188 88 Q 182 88 176 98 Z" fill="#f97316" />
          </g>
        )}
        {theme === 'diver' && (
          <g opacity="0.75">
            <circle cx="22" cy="24" r="3.5" fill="#67e8f9" />
            <circle cx="14" cy="34" r="2.5" fill="#a5f3fc" />
          </g>
        )}

        {upgradeLevel >= 1 && (
          <path
            d="M 42 58 Q 88 44 132 62"
            fill="none"
            stroke="white"
            strokeOpacity="0.35"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
        {upgradeLevel >= 2 && (
          <g opacity="0.8">
            <circle cx="175" cy="54" r="3" fill="#bae6fd" />
            <circle cx="182" cy="68" r="2.2" fill="#dbeafe" />
            <circle cx="174" cy="83" r="2.4" fill="#bfdbfe" />
          </g>
        )}
        {upgradeLevel >= 3 && (
          <g transform="translate(150, 42)">
            <circle r="9" fill="#fef08a" opacity="0.9" />
            <path d="M -5 0 L 5 0 M 0 -5 L 0 5" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

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
          </g>
        )}
        {accessory === 'bowtie' && (
          <g transform="translate(60, 115) rotate(10)">
            <path d="M 0 0 L -10 -10 L -10 10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <path d="M 0 0 L 10 -10 L 10 10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <circle cx="0" cy="0" r="3" fill="#b91c1c" />
          </g>
        )}
        {accessory === 'crown' && (
          <g transform="translate(88, 8) rotate(-8)">
            <path
              d="M 0 20 L 8 5 L 16 20 L 24 5 L 32 20 L 40 5 L 48 20 Z"
              fill="#facc15"
              stroke="#b45309"
              strokeWidth="2"
            />
            <rect x="0" y="20" width="48" height="8" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
          </g>
        )}
        {accessory === 'headphones' && (
          <g transform="translate(55, 52)">
            <path d="M -18 5 C -18 -20 38 -20 38 5" fill="none" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
            <rect x="-23" y="0" width="10" height="20" rx="5" fill="#374151" />
            <rect x="33" y="0" width="10" height="20" rx="5" fill="#374151" />
            <rect x="-20" y="4" width="4" height="12" rx="2" fill="#93c5fd" />
            <rect x="36" y="4" width="4" height="12" rx="2" fill="#93c5fd" />
          </g>
        )}
        {accessory === 'scarf' && (
          <g transform="translate(72, 108) rotate(6)">
            <path
              d="M -28 -6 Q -8 -14 12 -8 Q 24 -4 30 4 Q 20 16 -4 18 Q -20 18 -30 8 Z"
              fill="#ef4444"
              stroke="#991b1b"
              strokeWidth="2"
            />
            <path d="M 20 10 L 30 34 L 14 28 L 10 45 L 2 24 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          </g>
        )}
        {accessory === 'redBag' && (
          <g transform="translate(98, 95) rotate(8)">
            <path d="M -8 -6 Q 5 -16 18 -6" fill="none" stroke="#9f1239" strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-6" width="34" height="28" rx="6" fill="#f43f5e" stroke="#9f1239" strokeWidth="2.5" />
            <rect x="-10" y="-2" width="26" height="8" rx="3" fill="#fb7185" opacity="0.75" />
            <circle cx="3" cy="9" r="2" fill="#881337" />
          </g>
        )}
        {accessory === 'greenBag' && (
          <g transform="translate(98, 95) rotate(8)">
            <path d="M -8 -6 Q 5 -16 18 -6" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-6" width="34" height="28" rx="6" fill="#22c55e" stroke="#166534" strokeWidth="2.5" />
            <rect x="-10" y="-2" width="26" height="8" rx="3" fill="#4ade80" opacity="0.7" />
            <circle cx="3" cy="9" r="2" fill="#14532d" />
          </g>
        )}
        {accessory === 'blueBag' && (
          <g transform="translate(98, 95) rotate(8)">
            <path d="M -8 -6 Q 5 -16 18 -6" fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-6" width="34" height="28" rx="6" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2.5" />
            <rect x="-10" y="-2" width="26" height="8" rx="3" fill="#93c5fd" opacity="0.8" />
            <circle cx="3" cy="9" r="2" fill="#1e3a8a" />
          </g>
        )}
        {accessory === 'lightCoralBag' && (
          <g transform="translate(98, 95) rotate(8)">
            <path d="M -8 -6 Q 5 -16 18 -6" fill="none" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-6" width="34" height="28" rx="6" fill="#fda4af" stroke="#fb7185" strokeWidth="2.5" />
            <rect x="-10" y="-2" width="26" height="8" rx="3" fill="#fecdd3" opacity="0.85" />
            <circle cx="3" cy="9" r="2" fill="#e11d48" />
          </g>
        )}
      </g>
    </svg>
  );
};

export default FriendlyShark;
