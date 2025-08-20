import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Brain, Layers, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import Colors from '@/constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const GOLDEN_RATIO = 1.618033988749;
const PHI = GOLDEN_RATIO;

interface MemoryNode {
  id: string;
  timestamp: number;
  content: string;
  connections: string[];
  strength: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
  depth: number;
}

interface SpiralPoint {
  x: number;
  y: number;
  angle: number;
  radius: number;
  intensity: number;
}

const generateGoldenSpiral = (centerX: number, centerY: number, maxRadius: number, turns: number = 3): SpiralPoint[] => {
  const points: SpiralPoint[] = [];
  const totalSteps = turns * 100;
  
  for (let i = 0; i <= totalSteps; i++) {
    const t = (i / totalSteps) * turns * 2 * Math.PI;
    const radius = (maxRadius / (turns * 2 * Math.PI)) * t * Math.pow(PHI, t / (2 * Math.PI));
    const x = centerX + radius * Math.cos(t);
    const y = centerY + radius * Math.sin(t);
    const intensity = 1 - (i / totalSteps);
    
    points.push({ x, y, angle: t, radius, intensity });
  }
  
  return points;
};

const generateMemoryNodes = (sessionId: string): MemoryNode[] => {
  const nodes: MemoryNode[] = [];
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;
  const maxRadius = Math.min(screenWidth, screenHeight) * 0.4;
  
  // Generate nodes in golden ratio spiral pattern
  for (let i = 0; i < 12; i++) {
    const angle = i * 2 * Math.PI / PHI;
    const radius = (i / 12) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    nodes.push({
      id: `node-${i}`,
      timestamp: Date.now() - (i * 60000),
      content: `Memory fragment ${i + 1}: Neural pathway activation`,
      connections: i > 0 ? [`node-${i - 1}`] : [],
      strength: Math.random() * 0.8 + 0.2,
      x,
      y,
      angle,
      radius,
      depth: i,
    });
  }
  
  return nodes;
};

const createSpiralPath = (points: SpiralPoint[]): string => {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    // Create smooth curves using quadratic bezier
    const cpX = prev.x + (curr.x - prev.x) * 0.5;
    const cpY = prev.y + (curr.y - prev.y) * 0.5;
    
    path += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
  }
  
  return path;
};

export default function MemoryChainVisualization() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  
  const rotationValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;
  
  const memoryNodes = useMemo(() => generateMemoryNodes(sessionId || 'default'), [sessionId]);
  
  const spiralPoints = useMemo(() => {
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const maxRadius = Math.min(screenWidth, screenHeight) * 0.35;
    return generateGoldenSpiral(centerX, centerY, maxRadius, 2.5);
  }, []);
  
  const secondarySpirals = useMemo(() => {
    return memoryNodes.slice(0, 3).map((node, index) => {
      const maxRadius = Math.min(screenWidth, screenHeight) * 0.15;
      return generateGoldenSpiral(node.x, node.y, maxRadius, 1.5);
    });
  }, [memoryNodes]);
  
  useEffect(() => {
    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();
    
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotationValue, pulseValue]);
  
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => (prev + 1) % 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);
  

  
  const handleNodePress = (node: MemoryNode) => {
    setSelectedNode(node);
    if (Platform.OS !== 'web') {
      import('expo-haptics').then(Haptics => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      });
    }
  };
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (Platform.OS !== 'web') {
      import('expo-haptics').then(Haptics => {
        Haptics.selectionAsync();
      });
    }
  };
  
  const resetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setSelectedNode(null);
  };
  
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const pulseScale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });
  
  const renderSpiral = (points: SpiralPoint[], color: string, opacity: number = 0.6) => {
    const path = createSpiralPath(points);
    return (
      <Path
        d={path}
        stroke={color}
        strokeWidth={2}
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
      />
    );
  };
  
  const renderMemoryNode = (node: MemoryNode, index: number) => {
    const isSelected = selectedNode?.id === node.id;
    const animatedRadius = 8 + (node.strength * 12);
    const nodeOpacity = 0.7 + (node.strength * 0.3);
    
    return (
      <G key={node.id}>
        <Circle
          cx={node.x + panX}
          cy={node.y + panY}
          r={animatedRadius * (isSelected ? 1.5 : 1)}
          fill={`rgba(139, 92, 246, ${nodeOpacity})`}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={isSelected ? 3 : 1}
        />
        <Circle
          cx={node.x + panX}
          cy={node.y + panY}
          r={animatedRadius * 0.5}
          fill="rgba(255, 255, 255, 0.9)"
          opacity={0.5}
        />
      </G>
    );
  };
  
  const renderConnections = () => {
    return memoryNodes.map((node, nodeIndex) => {
      return node.connections.map((connectionId, connectionIndex) => {
        const connectedNode = memoryNodes.find(n => n.id === connectionId);
        if (!connectedNode) return null;
        
        const opacity = 0.3 + (node.strength * connectedNode.strength * 0.4);
        
        return (
          <Path
            key={`connection-${node.id}-${connectionId}-${nodeIndex}-${connectionIndex}`}
            d={`M ${node.x + panX} ${node.y + panY} Q ${(node.x + connectedNode.x) / 2 + panX} ${(node.y + connectedNode.y) / 2 + panY - 20} ${connectedNode.x + panX} ${connectedNode.y + panY}`}
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth={2}
            fill="none"
            opacity={opacity}
            strokeLinecap="round"
          />
        );
      });
    }).flat().filter(Boolean);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Memory Chain</Text>
          <Text style={styles.headerSubtitle}>Session: {sessionId}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.controlButton} onPress={resetView}>
            <RotateCcw size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Visualization Area */}
      <View 
        style={styles.visualizationContainer}
      >
        <Animated.View
          style={[
            styles.spiralContainer,
            {
              transform: [
                { rotate: rotation },
                { scale: pulseScale },
                { scale: zoom },
              ],
            },
          ]}
        >
          <Svg width={screenWidth} height={screenHeight} style={styles.svg}>
            <Defs>
              <RadialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(139, 92, 246, 1)" />
                <Stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
              </RadialGradient>
              <RadialGradient id="spiralGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(236, 72, 153, 0.8)" />
                <Stop offset="100%" stopColor="rgba(236, 72, 153, 0.1)" />
              </RadialGradient>
            </Defs>
            
            {/* Main Golden Spiral */}
            {renderSpiral(spiralPoints, 'url(#spiralGradient)', 0.8)}
            
            {/* Secondary Spirals */}
            {secondarySpirals.map((spiral, index) => (
              <G key={`secondary-spiral-${index}`}>
                {renderSpiral(spiral, `rgba(139, 92, 246, ${0.4 - index * 0.1})`, 0.5)}
              </G>
            ))}
            
            {/* Node Connections */}
            {renderConnections()}
            
            {/* Memory Nodes */}
            {memoryNodes.map(renderMemoryNode)}
          </Svg>
          
          {/* Touch targets for memory nodes */}
          {memoryNodes.map((node, index) => {
            const animatedRadius = 8 + (node.strength * 12);
            const isSelected = selectedNode?.id === node.id;
            const touchRadius = animatedRadius * (isSelected ? 1.5 : 1) + 10;
            
            return (
              <TouchableOpacity
                key={`touch-${node.id}`}
                style={{
                  position: 'absolute',
                  left: node.x + panX - touchRadius,
                  top: node.y + panY - touchRadius,
                  width: touchRadius * 2,
                  height: touchRadius * 2,
                  borderRadius: touchRadius,
                }}
                onPress={() => handleNodePress(node)}
                activeOpacity={0.7}
              />
            );
          })}
        </Animated.View>
        
        {/* Overlay Information */}
        <View style={styles.overlayInfo}>
          <View style={styles.infoCard}>
            <Brain size={16} color={Colors.light.tint} />
            <Text style={styles.infoText}>Nodes: {memoryNodes.length}</Text>
          </View>
          <View style={styles.infoCard}>
            <Layers size={16} color={Colors.light.warning} />
            <Text style={styles.infoText}>Depth: {Math.max(...memoryNodes.map(n => n.depth))}</Text>
          </View>
          <View style={styles.infoCard}>
            <Activity size={16} color={Colors.light.success} />
            <Text style={styles.infoText}>Active: {memoryNodes.filter(n => n.strength > 0.5).length}</Text>
          </View>
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            style={styles.playButtonGradient}
          >
            {isPlaying ? (
              <Pause size={24} color="white" />
            ) : (
              <Play size={24} color="white" />
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.timelineContainer}>
          <View style={styles.timeline}>
            <View 
              style={[
                styles.timelineProgress,
                { width: `${currentTime}%` }
              ]} 
            />
          </View>
          <Text style={styles.timeText}>{currentTime}%</Text>
        </View>
      </View>
      
      {/* Selected Node Details */}
      {selectedNode && (
        <View style={styles.nodeDetails}>
          <LinearGradient
            colors={['rgba(26, 26, 46, 0.95)', 'rgba(26, 26, 46, 0.8)']}
            style={styles.nodeDetailsGradient}
          >
            <View style={styles.nodeDetailsHeader}>
              <Zap size={20} color={Colors.light.tint} />
              <Text style={styles.nodeDetailsTitle}>Memory Node</Text>
              <TouchableOpacity onPress={() => setSelectedNode(null)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.nodeDetailsContent}>{selectedNode.content}</Text>
            <View style={styles.nodeDetailsStats}>
              <Text style={styles.nodeDetailsStat}>Strength: {(selectedNode.strength * 100).toFixed(0)}%</Text>
              <Text style={styles.nodeDetailsStat}>Depth: {selectedNode.depth}</Text>
              <Text style={styles.nodeDetailsStat}>Connections: {selectedNode.connections.length}</Text>
            </View>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: 'white',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualizationContainer: {
    flex: 1,
    position: 'relative' as const,
  },
  spiralContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
  overlayInfo: {
    position: 'absolute' as const,
    top: 20,
    left: 20,
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500' as const,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  playButton: {
    marginRight: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeline: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  timelineProgress: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 2,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500' as const,
    minWidth: 40,
    textAlign: 'right' as const,
  },
  nodeDetails: {
    position: 'absolute' as const,
    bottom: 100,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  nodeDetailsGradient: {
    padding: 20,
  },
  nodeDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nodeDetailsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'white',
    marginLeft: 8,
  },
  closeButton: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 'bold' as const,
  },
  nodeDetailsContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  nodeDetailsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nodeDetailsStat: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500' as const,
  },
});