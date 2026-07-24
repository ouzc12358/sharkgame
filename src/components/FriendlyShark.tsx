import React from 'react';
import {
  DEFAULT_SHARK_ACCESSORIES,
  SharkAccessoryId,
  SharkAccessorySlot,
  SharkConfig,
  SharkTheme,
} from '../../types';
import { SHARK_PALETTES } from '../modules/dressup/sharkStyle';

interface FriendlySharkProps {
  className?: string;
  config?: SharkConfig;
  theme?: SharkTheme;
  upgradeLevel?: number;
}

const renderBackpack = (fill: string, stroke: string, accent: string) => (
  <g transform="translate(128, 48) rotate(8) scale(0.82)">
    <path d="M -8 -6 Q 5 -16 18 -6" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <rect x="-14" y="-6" width="34" height="28" rx="6" fill={fill} stroke={stroke} strokeWidth="2.5" />
    <rect x="-10" y="-2" width="26" height="8" rx="3" fill={accent} opacity="0.76" />
    <circle cx="3" cy="9" r="2" fill={stroke} />
  </g>
);

const renderAccessory = (id: SharkAccessoryId | 'none') => {
  if (id === 'none') return null;

  switch (id) {
    case 'topHat':
      return (
        <g transform="translate(94, 15)">
          <rect x="2" y="8" width="42" height="7" rx="3" fill="#111827" />
          <rect x="10" y="-18" width="26" height="28" rx="4" fill="#1f2937" />
          <rect x="10" y="-4" width="26" height="5" rx="2" fill="#ef4444" />
        </g>
      );
    case 'crown':
      return (
        <g transform="translate(96, 5) rotate(-8)">
          <path
            d="M 0 20 L 8 5 L 16 20 L 24 5 L 32 20 L 40 5 L 48 20 Z"
            fill="#facc15"
            stroke="#b45309"
            strokeWidth="2"
          />
          <rect x="0" y="20" width="48" height="8" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        </g>
      );
    case 'helmet':
      return (
        <g transform="translate(92, 18)">
          <path d="M 0 12 Q 10 -2 26 4 Q 32 10 32 20 L 0 20 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2.5" />
          <rect x="1" y="18" width="30" height="6" rx="3" fill="#fca5a5" stroke="#991b1b" strokeWidth="1.8" />
          <rect x="8" y="9" width="10" height="4" rx="2" fill="#fef2f2" opacity="0.82" />
        </g>
      );
    case 'beanie':
      return (
        <g transform="translate(92, 14)">
          <path d="M 0 18 Q 6 0 24 0 Q 42 0 48 18 Z" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="2" />
          <rect x="0" y="16" width="48" height="10" rx="4" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2" />
          <circle cx="24" cy="0" r="5" fill="#93c5fd" stroke="#1e3a8a" strokeWidth="1.5" />
        </g>
      );
    case 'rainHat':
      return (
        <g transform="translate(94, 13)">
          <ellipse cx="24" cy="14" rx="28" ry="9" fill="#fef08a" stroke="#a16207" strokeWidth="2" />
          <path d="M 6 14 Q 10 -4 24 -4 Q 38 -4 42 14" fill="#fde047" stroke="#a16207" strokeWidth="2" />
        </g>
      );

    case 'hoodie':
      return (
        <g transform="translate(84, 88) scale(0.9)">
          <path d="M 0 -6 Q 12 -20 28 -6 L 42 -6 Q 58 8 54 28 L 0 28 Q -4 8 0 -6 Z" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="2.2" />
          <circle cx="20" cy="9" r="5" fill="#bae6fd" />
          <circle cx="35" cy="9" r="5" fill="#bae6fd" />
        </g>
      );
    case 'tshirt':
      return (
        <g transform="translate(82, 90) scale(0.9)">
          <path d="M 4 -4 L 18 -12 L 36 -12 L 52 -4 L 52 24 L 4 24 Z" fill="#fde68a" stroke="#a16207" strokeWidth="2" />
          <path d="M 20 -12 Q 28 -4 36 -12" fill="none" stroke="#a16207" strokeWidth="2" />
        </g>
      );
    case 'jacket':
      return (
        <g transform="translate(82, 88) scale(0.9)">
          <rect x="2" y="-8" width="52" height="34" rx="10" fill="#1f2937" stroke="#0f172a" strokeWidth="2.2" />
          <path d="M 28 -6 L 28 24" stroke="#f8fafc" strokeWidth="2" />
          <circle cx="20" cy="9" r="1.8" fill="#f8fafc" />
          <circle cx="36" cy="9" r="1.8" fill="#f8fafc" />
        </g>
      );
    case 'armor':
      return (
        <g transform="translate(82, 87) scale(0.88)">
          <path d="M 6 -6 L 48 -6 L 56 10 L 48 30 L 6 30 L -2 10 Z" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
          <path d="M 10 2 L 44 2" stroke="#e2e8f0" strokeWidth="2" />
          <path d="M 10 12 L 44 12" stroke="#e2e8f0" strokeWidth="2" />
        </g>
      );
    case 'raincoat':
      return (
        <g transform="translate(82, 88) scale(0.9)">
          <path d="M 2 -6 Q 12 -18 28 -12 Q 44 -18 54 -6 L 54 30 L 2 30 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
          <path d="M 28 -10 L 28 30" stroke="#fef3c7" strokeWidth="2" />
        </g>
      );

    case 'sneakers':
      return (
        <g transform="translate(78, 142)">
          <rect x="-4" y="0" width="24" height="8" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
          <rect x="28" y="-4" width="24" height="8" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
        </g>
      );
    case 'flippers':
      return (
        <g transform="translate(74, 143)">
          <path d="M 0 0 Q 14 -4 26 3 Q 18 9 0 8 Z" fill="#22d3ee" stroke="#0e7490" strokeWidth="2" />
          <path d="M 30 -4 Q 46 -8 62 0 Q 54 8 32 6 Z" fill="#22d3ee" stroke="#0e7490" strokeWidth="2" />
        </g>
      );
    case 'boots':
      return (
        <g transform="translate(78, 140)">
          <path d="M 0 -6 L 14 -6 L 14 8 L -2 8 Q -8 8 -8 3 Q -8 -2 0 -2 Z" fill="#92400e" stroke="#451a03" strokeWidth="2" />
          <path d="M 30 -8 L 44 -8 L 44 8 L 28 8 Q 22 8 22 3 Q 22 -2 30 -2 Z" fill="#92400e" stroke="#451a03" strokeWidth="2" />
        </g>
      );
    case 'rollerSkates':
      return (
        <g transform="translate(78, 141)">
          <rect x="-2" y="-6" width="20" height="8" rx="3" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="2" />
          <rect x="30" y="-8" width="20" height="8" rx="3" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="2" />
          <circle cx="2" cy="5" r="2.8" fill="#1f2937" />
          <circle cx="12" cy="5" r="2.8" fill="#1f2937" />
          <circle cx="34" cy="3" r="2.8" fill="#1f2937" />
          <circle cx="44" cy="3" r="2.8" fill="#1f2937" />
        </g>
      );

    case 'board':
      return (
        <g transform="translate(76, 145) scale(0.92)">
          <rect x="-18" y="-4" width="86" height="14" rx="7" fill="#0ea5e9" stroke="#0f172a" strokeWidth="2" />
          <circle cx="-4" cy="14" r="5" fill="#1f2937" />
          <circle cx="54" cy="14" r="5" fill="#1f2937" />
          <circle cx="-4" cy="14" r="2" fill="#f8fafc" />
          <circle cx="54" cy="14" r="2" fill="#f8fafc" />
        </g>
      );
    case 'book':
      return (
        <g transform="translate(174, 94) rotate(-12)">
          <rect x="-14" y="-10" width="26" height="28" rx="3" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
          <line x1="-2" y1="-10" x2="-2" y2="18" stroke="#dbeafe" strokeWidth="2" />
          <circle cx="6" cy="4" r="2" fill="#dbeafe" />
        </g>
      );
    case 'starWand':
      return (
        <g transform="translate(174, 76) rotate(18) scale(0.9)">
          <path d="M 0 0 L 4 11 L 16 11 L 7 17 L 11 28 L 0 21 L -11 28 L -7 17 L -16 11 L -4 11 Z" fill="#facc15" stroke="#b45309" strokeWidth="2" />
          <rect x="-1" y="22" width="2" height="26" rx="1" fill="#92400e" />
        </g>
      );
    case 'backpackRed':
      return renderBackpack('#f43f5e', '#9f1239', '#fb7185');
    case 'backpackGreen':
      return renderBackpack('#22c55e', '#166534', '#4ade80');
    case 'backpackBlue':
      return renderBackpack('#3b82f6', '#1d4ed8', '#93c5fd');
    case 'backpackCoral':
      return renderBackpack('#fda4af', '#fb7185', '#fecdd3');

    case 'sunglasses':
      return (
        <g transform="translate(57, 65)">
          <circle cx="-5" cy="0" r="15" fill="#1f2937" opacity="0.8" />
          <circle cx="25" cy="0" r="15" fill="#1f2937" opacity="0.8" />
          <line x1="10" y1="0" x2="10" y2="0" stroke="#1f2937" strokeWidth="3" />
        </g>
      );
    case 'glasses':
      return (
        <g transform="translate(57, 65)">
          <circle cx="-4" cy="0" r="12" fill="none" stroke="#334155" strokeWidth="2.2" />
          <circle cx="24" cy="0" r="12" fill="none" stroke="#334155" strokeWidth="2.2" />
          <line x1="8" y1="0" x2="12" y2="0" stroke="#334155" strokeWidth="2.2" />
        </g>
      );
    case 'monocle':
      return (
        <g transform="translate(57, 66)">
          <circle cx="-4" cy="0" r="14" fill="none" stroke="#475569" strokeWidth="2.6" />
          <line x1="6" y1="8" x2="14" y2="18" stroke="#475569" strokeWidth="2" />
        </g>
      );
    case 'mask':
      return (
        <g transform="translate(56, 66)">
          <rect x="-12" y="-8" width="40" height="16" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
          <line x1="-14" y1="-3" x2="-20" y2="-8" stroke="#94a3b8" strokeWidth="2" />
          <line x1="30" y1="-3" x2="36" y2="-8" stroke="#94a3b8" strokeWidth="2" />
        </g>
      );

    case 'bowtie':
      return (
        <g transform="translate(110, 96) rotate(10) scale(0.85)">
          <path d="M 0 0 L -10 -10 L -10 10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <path d="M 0 0 L 10 -10 L 10 10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <circle cx="0" cy="0" r="3" fill="#b91c1c" />
        </g>
      );
    case 'scarf':
      return (
        <g transform="translate(124, 84) rotate(6) scale(0.72)">
          <path
            d="M -28 -6 Q -8 -14 12 -8 Q 24 -4 30 4 Q 20 16 -4 18 Q -20 18 -30 8 Z"
            fill="#ef4444"
            stroke="#991b1b"
            strokeWidth="2"
          />
          <path d="M 20 10 L 30 34 L 14 28 L 10 45 L 2 24 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
        </g>
      );
    case 'medal':
      return (
        <g transform="translate(102, 96) scale(0.9)">
          <path d="M 8 -10 L 18 -10 L 14 4 Z" fill="#2563eb" />
          <path d="M 22 -10 L 32 -10 L 26 4 Z" fill="#1d4ed8" />
          <circle cx="20" cy="14" r="11" fill="#facc15" stroke="#b45309" strokeWidth="2" />
          <text x="20" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400e">
            1
          </text>
        </g>
      );
    default:
      return null;
  }
};

const ACCESSORY_RENDER_ORDER: SharkAccessorySlot[] = ['clothes', 'shoes', 'item', 'neck', 'hat', 'face'];

const FriendlyShark: React.FC<FriendlySharkProps> = ({
  className,
  config,
  theme = 'diver',
  upgradeLevel = 0,
}) => {
  const color = config?.color || 'blue';
  const accessories = {
    ...DEFAULT_SHARK_ACCESSORIES,
    ...(config?.accessories || {}),
  };
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
        {theme === 'skate' && (
          <g opacity="0.85">
            <path d="M 12 122 Q 60 138 132 124" fill="none" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
            <circle cx="18" cy="118" r="2.5" fill="#bfdbfe" />
            <circle cx="28" cy="126" r="2" fill="#93c5fd" />
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

        {ACCESSORY_RENDER_ORDER.map((slot) => (
          <React.Fragment key={slot}>{renderAccessory(accessories[slot])}</React.Fragment>
        ))}
      </g>
    </svg>
  );
};

export default FriendlyShark;
