import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';

// Clay Morphism Color Palette
const CLAY_COLORS = {
  gcash: '#A8945F',      // Warm Gold/Bronze
  paymaya: '#C29D7F',    // Warm Terracotta
  card: '#B36B5E',       // Rust Brown
  cod: '#9BA89A',        // Sage Green
  shadow: 'rgba(74, 60, 53, 0.15)',
};

export const GCashIcon = ({ size = 24, color = CLAY_COLORS.gcash }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Defs>
      <RadialGradient id="gcashGrad" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor={color} stopOpacity="1" />
        <Stop offset="100%" stopColor={color} stopOpacity="0.85" />
      </RadialGradient>
    </Defs>
    {/* Main circle with gradient */}
    <Circle cx="50" cy="50" r="48" fill="url(#gcashGrad)" />
    {/* Soft highlight */}
    <Circle cx="50" cy="50" r="45" fill="white" opacity="0.08" />
    {/* Inner shadow effect */}
    <Circle cx="50" cy="50" r="46" fill="none" stroke={CLAY_COLORS.shadow} strokeWidth="0.5" opacity="0.4" />
    <G>
      {/* Stylized G letter - organic shape */}
      <Path
        d="M32 28 Q28 30 28 38 L28 62 Q28 68 32 70 L42 70 L42 60 L35 60 L35 48 L42 48 Q44 48 44 46 L44 42 Q44 40 42 40 L32 40 Q30 40 30 38 L30 38 Q30 32 35 30 L42 30 Q44 30 46 31"
        fill="white"
        opacity="0.95"
        fillRule="evenodd"
      />
    </G>
  </Svg>
);

export const PayMayaIcon = ({ size = 24, color = CLAY_COLORS.paymaya }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Defs>
      <RadialGradient id="payMayaGrad" cx="50%" cy="40%" r="55%">
        <Stop offset="0%" stopColor={color} stopOpacity="1" />
        <Stop offset="100%" stopColor={color} stopOpacity="0.9" />
      </RadialGradient>
    </Defs>
    {/* Main circle with gradient */}
    <Circle cx="50" cy="50" r="48" fill="url(#payMayaGrad)" />
    {/* Soft highlight */}
    <Circle cx="50" cy="50" r="45" fill="white" opacity="0.1" />
    {/* Inner shadow */}
    <Circle cx="50" cy="50" r="46" fill="none" stroke={CLAY_COLORS.shadow} strokeWidth="0.5" opacity="0.4" />
    
    <G>
      {/* Organic P shape */}
      <Path
        d="M24 38 Q22 40 22 48 L22 62 Q22 68 26 70 L36 70 Q38 70 40 68 L40 48 Q40 40 36 38 L24 38 M24 40 L36 40 Q38 40 38 42 L38 48 Q38 52 36 52 L24 52 L24 40"
        fill="white"
        opacity="0.95"
        fillRule="evenodd"
      />
      {/* Organic M shape */}
      <Path
        d="M50 70 L50 38 Q50 36 52 36 L56 36 Q58 36 58 38 L62 56 L66 38 Q66 36 68 36 L72 36 Q74 36 74 38 L74 70 Q74 72 72 72 L70 72 Q68 72 68 70 L68 50 L64 68 Q64 70 62 70 L60 70 Q58 70 58 68 L54 50 L54 70 Q54 72 52 72 L50 72 Q50 70 50 70"
        fill="white"
        opacity="0.95"
        fillRule="evenodd"
      />
    </G>
  </Svg>
);

export const CardIcon = ({ size = 24, color = CLAY_COLORS.card }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Defs>
      <RadialGradient id="cardGrad" cx="50%" cy="30%" r="60%">
        <Stop offset="0%" stopColor={color} stopOpacity="1" />
        <Stop offset="100%" stopColor={color} stopOpacity="0.9" />
      </RadialGradient>
    </Defs>
    {/* Main circle */}
    <Circle cx="50" cy="50" r="48" fill="url(#cardGrad)" />
    {/* Highlight */}
    <Circle cx="50" cy="50" r="45" fill="white" opacity="0.12" />
    {/* Inner shadow */}
    <Circle cx="50" cy="50" r="46" fill="none" stroke={CLAY_COLORS.shadow} strokeWidth="0.5" opacity="0.4" />
    
    {/* Payment card with soft rounded corners */}
    <Path
      d="M18 32 Q15 34 15 38 L15 62 Q15 66 18 68 L82 68 Q85 66 85 62 L85 38 Q85 34 82 32 L18 32"
      fill="white"
      opacity="0.96"
    />
    {/* Magnetic stripe */}
    <Path d="M15 48 L85 48" stroke={color} strokeWidth="3" opacity="0.6" />
  </Svg>
);

export const CODIcon = ({ size = 24, color = CLAY_COLORS.cod }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Defs>
      <RadialGradient id="codGrad" cx="50%" cy="45%" r="55%">
        <Stop offset="0%" stopColor={color} stopOpacity="1" />
        <Stop offset="100%" stopColor={color} stopOpacity="0.88" />
      </RadialGradient>
    </Defs>
    {/* Main circle */}
    <Circle cx="50" cy="50" r="48" fill="url(#codGrad)" />
    {/* Highlight */}
    <Circle cx="50" cy="50" r="45" fill="white" opacity="0.1" />
    {/* Inner shadow */}
    <Circle cx="50" cy="50" r="46" fill="none" stroke={CLAY_COLORS.shadow} strokeWidth="0.5" opacity="0.4" />
    
    {/* Wallet/Money representation with organic shapes */}
    <G>
      {/* Main wallet outline with soft curves */}
      <Path
        d="M22 34 Q20 36 20 40 L20 64 Q20 68 22 70 L78 70 Q80 68 80 64 L80 40 Q80 36 78 34 L22 34"
        fill="white"
        opacity="0.95"
        strokeWidth="0"
      />
      {/* Coin 1 - soft circle */}
      <Circle cx="32" cy="52" r="7" fill={color} opacity="0.4" />
      {/* Coin 2 */}
      <Circle cx="50" cy="52" r="7" fill={color} opacity="0.5" />
      {/* Coin 3 */}
      <Circle cx="68" cy="52" r="7" fill={color} opacity="0.4" />
    </G>
  </Svg>
);
