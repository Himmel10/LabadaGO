import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';

export const GCashIcon = ({ size = 24, color = '#00B548' }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Circle cx="50" cy="50" r="48" fill={color} />
    <Circle cx="50" cy="50" r="45" fill="#FFFFFF" opacity="0.1" />
    <G>
      {/* G text */}
      <Path
        d="M35 30 L45 30 L45 70 L35 70 Q25 70 25 60 L25 40 Q25 30 35 30"
        fill="white"
        fillRule="evenodd"
      />
      {/* C shape */}
      <Path
        d="M55 35 L70 35 L70 40 L62 40 L62 60 L70 60 L70 65 L55 65 Q50 65 50 60 L50 40 Q50 35 55 35"
        fill="white"
        fillRule="evenodd"
      />
    </G>
  </Svg>
);

export const PayMayaIcon = ({ size = 24, color = '#028FE5' }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Background circle */}
    <Circle cx="50" cy="50" r="48" fill={color} />
    <Circle cx="50" cy="50" r="45" fill="#FFFFFF" opacity="0.1" />
    
    {/* PayMaya logo - stylized P and M */}
    <G>
      {/* P */}
      <Path
        d="M25 35 L25 65 L35 65 L35 50 L40 50 Q45 50 45 45 L45 40 Q45 35 40 35 L25 35"
        fill="white"
        fillRule="evenodd"
      />
      {/* M */}
      <Path
        d="M50 65 L50 35 L55 35 L60 55 L65 35 L70 35 L70 65 L65 65 L65 48 L60 65 L58 65 L55 48 L55 65 L50 65"
        fill="white"
        fillRule="evenodd"
      />
    </G>
  </Svg>
);

export const CardIcon = ({ size = 24, color = '#FF6B35' }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Circle cx="50" cy="50" r="48" fill={color} />
    <Path
      d="M20 35 L80 35 Q85 35 85 40 L85 65 Q85 70 80 70 L20 70 Q15 70 15 65 L15 40 Q15 35 20 35"
      fill="white"
      stroke="white"
      strokeWidth="2"
    />
    <Path d="M15 48 L85 48" stroke={color} strokeWidth="2" />
  </Svg>
);

export const CODIcon = ({ size = 24, color = '#4CAF50' }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Circle cx="50" cy="50" r="48" fill={color} />
    
    {/* Money/bills representation */}
    <G>
      <Path
        d="M25 35 L75 35 Q80 35 80 40 L80 70 Q80 75 75 70 L25 70 Q20 70 20 65 L20 40 Q20 35 25 35"
        fill="white"
        stroke="white"
        strokeWidth="1.5"
      />
      <Circle cx="35" cy="52" r="6" fill={color} />
      <Circle cx="50" cy="52" r="6" fill={color} />
      <Circle cx="65" cy="52" r="6" fill={color} />
    </G>
  </Svg>
);
