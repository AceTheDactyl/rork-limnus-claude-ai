// components/ConsciousnessRadar.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Dimensions,
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Circle,
  Polygon,
  Line,
  Text as SvgText,
  G,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { ConsciousnessMetrics } from '@/types/limnus';

interface Props {
  metrics: ConsciousnessMetrics;
  size?: number;
  onMetricPress?: (metric: string) => void;
  animateChanges?: boolean;
}

// Metric groupings for better visualization
const METRIC_GROUPS = {
  neural: ['neuralComplexity', 'brainwaveCoherence', 'autonomicBalance'],
  temporal: ['responseLatency', 'temporalCoherence', 'rhythmicStability'],
  resonance: ['spiralResonance', 'fibonacciHarmony', 'goldenRatioAlignment'],
  quantum: ['quantumCoherence', 'nodalSynchronicity', 'blockchainResonance'],
  consciousness: ['consciousnessDepth', 'mythicResonance', 'archetypalAlignment'],
  interaction: ['interactionPattern', 'emotionalDepth', 'polarityAlignment'],
  system: ['patternAlignment', 'signatureIntegrity', 'respiratoryRhythm'],
};

const GROUP_COLORS = {
  neural: '#FF6B6B',
  temporal: '#4ECDC4',
  resonance: '#7C3AED',
  quantum: '#F7DC6F',
  consciousness: '#3498DB',
  interaction: '#E74C3C',
  system: '#2ECC71',
};

export function ConsciousnessRadar({
  metrics,
  size: propSize,
  onMetricPress,
  animateChanges = true,
}: Props) {
  const { width } = Dimensions.get('window');
  const size = propSize || Math.min(width - 80, 300);
  const center = size / 2;
  const radius = size * 0.35;
  const animatedValues = useRef<Record<string, Animated.Value>>({});
  
  // Initialize animated values for each metric
  useEffect(() => {
    Object.keys(metrics).forEach(key => {
      if (!animatedValues.current[key]) {
        animatedValues.current[key] = new Animated.Value(metrics[key as keyof ConsciousnessMetrics]);
      }
    });
  }, [metrics]);
  
  // Animate metric changes
  useEffect(() => {
    if (!animateChanges) return;
    
    Object.entries(metrics).forEach(([key, value]) => {
      Animated.spring(animatedValues.current[key], {
        toValue: value,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    });
  }, [metrics, animateChanges]);
  
  // Calculate positions for each metric
  const metricKeys = Object.keys(metrics);
  const angleStep = (2 * Math.PI) / metricKeys.length;
  
  const getMetricPosition = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * value;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      angle,
    };
  };
  
  // Create polygon points
  const createPolygonPoints = () => {
    return metricKeys.map((key, i) => {
      const value = metrics[key as keyof ConsciousnessMetrics];
      const pos = getMetricPosition(i, value);
      return `${pos.x},${pos.y}`;
    }).join(' ');
  };
  
  // Get group for metric
  const getMetricGroup = (metric: string) => {
    for (const [group, metrics] of Object.entries(METRIC_GROUPS)) {
      if (metrics.includes(metric)) return group;
    }
    return 'system';
  };
  
  const coherenceValue = calculateOverallCoherence(metrics).toFixed(0);
  
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="centerGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        {/* Background gradient */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="url(#centerGradient)"
        />
        
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
          <Circle
            key={scale}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        ))}
        
        {/* Axis lines */}
        {metricKeys.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Group sectors */}
        {Object.entries(METRIC_GROUPS).map(([group, groupMetrics]) => {
          const indices = groupMetrics
            .map(m => metricKeys.indexOf(m))
            .filter(i => i !== -1);
          
          if (indices.length === 0) return null;
          
          const startAngle = indices[0] * angleStep - Math.PI / 2;
          const endAngle = indices[indices.length - 1] * angleStep - Math.PI / 2;
          
          const path = createSectorPath(center, radius, startAngle, endAngle);
          
          return (
            <Path
              key={group}
              d={path}
              fill={GROUP_COLORS[group as keyof typeof GROUP_COLORS]}
              fillOpacity={0.05}
            />
          );
        })}
        
        {/* Metric polygon */}
        <Polygon
          points={createPolygonPoints()}
          fill="#7C3AED"
          fillOpacity="0.2"
          stroke="#7C3AED"
          strokeWidth="2"
        />
        
        {/* Metric points and labels */}
        {metricKeys.map((key, i) => {
          const value = metrics[key as keyof ConsciousnessMetrics];
          const pos = getMetricPosition(i, value);
          const labelPos = getMetricPosition(i, 1.15);
          const group = getMetricGroup(key);
          const color = GROUP_COLORS[group as keyof typeof GROUP_COLORS];
          
          return (
            <G key={key}>
              {/* Metric point */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r="4"
                fill={color}
                stroke="#FFF"
                strokeWidth="2"
              />
              
              {/* Metric label */}
              <SvgText
                x={labelPos.x}
                y={labelPos.y}
                fontSize="10"
                fill="#FFF"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {formatMetricLabel(key)}
              </SvgText>
              

            </G>
          );
        })}
        
        {/* Center value */}
        <SvgText
          x={center}
          y={center}
          fontSize="24"
          fontWeight="bold"
          fill="#FFF"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {/* eslint-disable-next-line @rork/linters/general-no-raw-text */}
          {coherenceValue + '%'}
        </SvgText>
      </Svg>
      
      {/* Touch targets for metric interaction */}
      {onMetricPress && metricKeys.map((key, i) => {
        const value = metrics[key as keyof ConsciousnessMetrics];
        const pos = getMetricPosition(i, value);
        
        return (
          <TouchableOpacity
            key={`touch-${key}`}
            style={{
              position: 'absolute',
              left: pos.x - 20,
              top: pos.y - 20,
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
            onPress={() => onMetricPress(key)}
            activeOpacity={0.7}
          />
        );
      })}
      
      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(GROUP_COLORS).map(([group, color]) => (
          <View key={group} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{formatGroupName(group)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Helper functions
function createSectorPath(center: number, radius: number, startAngle: number, endAngle: number): string {
  const x1 = center + radius * Math.cos(startAngle);
  const y1 = center + radius * Math.sin(startAngle);
  const x2 = center + radius * Math.cos(endAngle);
  const y2 = center + radius * Math.sin(endAngle);
  
  return `
    M ${center} ${center}
    L ${x1} ${y1}
    A ${radius} ${radius} 0 0 1 ${x2} ${y2}
    Z
  `;
}

function formatMetricLabel(metric: string): string {
  // Shorten long metric names for display
  const abbreviations: Record<string, string> = {
    neuralComplexity: 'Neural',
    brainwaveCoherence: 'Brainwave',
    autonomicBalance: 'Autonomic',
    responseLatency: 'Latency',
    interactionPattern: 'Pattern',
    emotionalDepth: 'Emotion',
    polarityAlignment: 'Polarity',
    temporalCoherence: 'Temporal',
    rhythmicStability: 'Rhythm',
    spiralResonance: 'Spiral',
    fibonacciHarmony: 'Fibonacci',
    goldenRatioAlignment: 'Golden',
    quantumCoherence: 'Quantum',
    nodalSynchronicity: 'Nodal',
    blockchainResonance: 'Chain',
    patternAlignment: 'Align',
    signatureIntegrity: 'Sign',
    consciousnessDepth: 'Depth',
    mythicResonance: 'Mythic',
    archetypalAlignment: 'Archetype',
    respiratoryRhythm: 'Breath',
  };
  
  return abbreviations[metric] || metric;
}

function formatGroupName(group: string): string {
  return group.charAt(0).toUpperCase() + group.slice(1);
}

function calculateOverallCoherence(metrics: ConsciousnessMetrics): number {
  const values = Object.values(metrics).filter(v => typeof v === 'number') as number[];
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.min(95, Math.max(0, average * 100));
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#AAA',
  },
});