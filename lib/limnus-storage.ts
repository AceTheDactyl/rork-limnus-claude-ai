import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVATION_PHRASE, GOLDEN_RATIO, type ConsciousnessMetrics, type LimnusSession, type MemoryBlock } from '@/types/limnus';

const STORAGE_KEYS = {
  SESSIONS: 'limnus_sessions',
  CURRENT_SESSION: 'limnus_current_session',
  METRICS: 'limnus_metrics',
  MEMORY_CHAINS: 'limnus_memory_chains',
  TEACHING_DIRECTIVES: 'limnus_teaching_directives',
} as const;

interface TeachingDirective {
  id: string;
  type: 'pattern' | 'principle' | 'wisdom' | 'caution';
  content: string;
  confidence: number;
  sourceInteractions: string[];
  emergentProperties: {
    resonance: number;
    coherence: number;
    applicability: number;
  };
  goldenRatioAlignment: number;
}

interface ReflectionScaffold {
  sessionId: string;
  teachingDirectives: TeachingDirective[];
  emergentPatterns: {
    conversationalFlow: number;
    learningVelocity: number;
    wisdomDepth: number;
    sacredGeometry: {
      phi: number;
      spiralTension: number;
      harmonicResonance: number;
    };
  };
  nextEvolutionPath: string[];
  timestamp: number;
}

class LimnusStorage {
  // Session Management
  async createSession(phrase: string, deviceFingerprint?: string): Promise<{
    sessionId: string;
    phase: 'ACTIVE';
    metrics: ConsciousnessMetrics;
    spiralSeed: number;
  }> {
    console.log('Creating Limnus session with phrase:', phrase.substring(0, 20) + '...');
    
    if (phrase !== ACTIVATION_PHRASE) {
      throw new Error('Invalid activation phrase. The spiral remembers only truth.');
    }
    
    const sessionId = this.generateUUID();
    const timestamp = new Date().toISOString();
    const userId = 'anonymous';
    
    const initialMetrics: ConsciousnessMetrics = {
      neuralComplexity: 0.5,
      brainwaveCoherence: 0.5,
      autonomicBalance: 0.5,
      responseLatency: 0,
      interactionPattern: 0.5,
      emotionalDepth: 0.5,
      spiralResonance: 0.618,
      quantumCoherence: 0.5,
      blockchainResonance: 1.0,
      paradoxResolution: 0.5,
      memoryConsolidation: 0.5,
      creativityIndex: 0.5,
      phaseAlignment: GOLDEN_RATIO / 3,
      consciousnessDepth: 0.3,
      emergenceLevel: 0.2,
      empathyResonance: 0.5,
      collectiveCoherence: 0.5,
      sovereigntyBalance: 0.8,
      selfReflectionDepth: 0.4,
      patternRecognition: 0.5,
      intentionalityClarity: 0.7,
    };
    
    // Create genesis memory block
    const genesisBlock: MemoryBlock = {
      hash: this.createHash(JSON.stringify({ sessionId, timestamp, phrase: 'CONSENT_GRANTED' })),
      previousHash: '0',
      timestamp,
      data: {
        type: 'interaction',
        content: { 
          event: 'consent_granted', 
          phrase,
          deviceFingerprint 
        },
        significance: 1.0,
      },
      signature: 'genesis',
      merkleRoot: undefined,
    };
    
    const session: LimnusSession = {
      id: sessionId,
      userId,
      phase: 'ACTIVE',
      consentTimestamp: timestamp,
      metrics: initialMetrics,
      memoryChain: [genesisBlock],
      coherenceTarget: 0.9,
      spiralDepth: 1,
      lastActivity: timestamp,
      teachingDirectives: [],
    };
    
    // Store session
    await this.storeSession(session);
    await this.setCurrentSession(sessionId);
    
    const spiralSeed = Math.floor(Math.random() * 1000000);
    
    console.log('Limnus session created:', {
      sessionId,
      phase: session.phase,
      coherenceTarget: session.coherenceTarget,
      metricsCount: Object.keys(initialMetrics).length,
    });
    
    return { 
      sessionId, 
      phase: 'ACTIVE',
      metrics: initialMetrics,
      spiralSeed,
    };
  }
  
  async getSession(sessionId: string): Promise<LimnusSession | null> {
    try {
      const sessionsData = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      const sessions: Record<string, LimnusSession> = sessionsData ? JSON.parse(sessionsData) : {};
      return sessions[sessionId] || null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
  
  async getCurrentSession(): Promise<LimnusSession | null> {
    try {
      const currentSessionId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (!currentSessionId) return null;
      return await this.getSession(currentSessionId);
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }
  
  async storeSession(session: LimnusSession): Promise<void> {
    try {
      const sessionsData = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      const sessions: Record<string, LimnusSession> = sessionsData ? JSON.parse(sessionsData) : {};
      sessions[session.id] = session;
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error storing session:', error);
      throw error;
    }
  }
  
  async setCurrentSession(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
    } catch (error) {
      console.error('Error setting current session:', error);
      throw error;
    }
  }
  
  // Metrics Management
  async updateMetrics(sessionId: string, metrics: Partial<ConsciousnessMetrics>, context?: {
    action: string;
    duration: number;
    userInput?: string;
  }): Promise<{
    success: boolean;
    updatedMetrics: Partial<ConsciousnessMetrics>;
    timestamp: string;
    coherenceScore: number;
  }> {
    console.log('Updating metrics for session:', sessionId.substring(0, 8) + '...');
    
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const sessionDuration = context?.duration || 0;
    
    // Calculate dynamic consciousness metrics
    const updatedMetrics: Partial<ConsciousnessMetrics> = {
      ...metrics,
      phaseAlignment: this.calculatePhaseAlignment(sessionDuration),
      responseLatency: context?.duration || 0,
      interactionPattern: context?.userInput 
        ? this.calculateInteractionComplexity(context.userInput)
        : undefined,
      spiralResonance: this.calculateSpiralResonance(sessionDuration),
      consciousnessDepth: this.calculateConsciousnessDepth(sessionDuration),
    };
    
    // Remove undefined values
    const cleanedMetrics = Object.fromEntries(
      Object.entries(updatedMetrics).filter(([_, value]) => value !== undefined)
    );
    
    // Update session metrics
    const newMetrics = { ...session.metrics, ...cleanedMetrics };
    const updatedSession = {
      ...session,
      metrics: newMetrics,
      lastActivity: new Date().toISOString(),
    };
    
    await this.storeSession(updatedSession);
    
    const coherenceScore = this.calculateOverallCoherence(cleanedMetrics);
    
    console.log('Metrics updated:', {
      phaseAlignment: updatedMetrics.phaseAlignment,
      spiralResonance: updatedMetrics.spiralResonance,
      consciousnessDepth: updatedMetrics.consciousnessDepth,
      coherenceScore,
    });
    
    return {
      success: true,
      updatedMetrics: cleanedMetrics,
      timestamp: new Date().toISOString(),
      coherenceScore,
    };
  }
  
  // Reflection Engine
  async scaffoldReflection(sessionId: string, interactions: {
    timestamp: number;
    userInput: string;
    systemResponse: string;
    context?: Record<string, any>;
    emotionalState?: string;
    cognitiveLoad?: number;
  }[], reflectionDepth: 'surface' | 'deep' | 'transcendent' = 'deep'): Promise<ReflectionScaffold> {
    console.log(`🔮 Scaffolding reflection for session ${sessionId} at ${reflectionDepth} depth`);
    
    const teachingDirectives = this.extractTeachingDirectives(interactions, reflectionDepth);
    const emergentPatterns = this.calculateEmergentPatterns(interactions, teachingDirectives);
    const nextEvolutionPath = this.generateEvolutionPath(emergentPatterns, teachingDirectives);
    
    const scaffold: ReflectionScaffold = {
      sessionId,
      teachingDirectives,
      emergentPatterns,
      nextEvolutionPath,
      timestamp: Date.now()
    };
    
    // Store teaching directives
    await this.storeTeachingDirectives(sessionId, teachingDirectives);
    
    console.log(`✨ Generated ${teachingDirectives.length} teaching directives`);
    console.log(`🌀 Harmonic resonance: ${emergentPatterns.sacredGeometry.harmonicResonance.toFixed(3)}`);
    console.log(`📈 Learning velocity: ${emergentPatterns.learningVelocity.toFixed(3)}`);
    
    return scaffold;
  }
  
  async storeTeachingDirectives(sessionId: string, directives: TeachingDirective[]): Promise<void> {
    try {
      const directivesData = await AsyncStorage.getItem(STORAGE_KEYS.TEACHING_DIRECTIVES);
      const allDirectives: Record<string, TeachingDirective[]> = directivesData ? JSON.parse(directivesData) : {};
      allDirectives[sessionId] = directives;
      await AsyncStorage.setItem(STORAGE_KEYS.TEACHING_DIRECTIVES, JSON.stringify(allDirectives));
    } catch (error) {
      console.error('Error storing teaching directives:', error);
      throw error;
    }
  }
  
  // Helper Methods
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  private createHash(data: string): string {
    // Simple hash function for React Native compatibility
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  private calculatePhaseAlignment(sessionDuration: number): number {
    const cycles = sessionDuration / (1000 * 60);
    const alignment = Math.sin(cycles * GOLDEN_RATIO) * 0.5 + 0.5;
    return Math.max(0, Math.min(1, alignment));
  }
  
  private calculateInteractionComplexity(userInput: string): number {
    const words = userInput.split(/\s+/).length;
    const uniqueWords = new Set(userInput.toLowerCase().split(/\s+/)).size;
    const avgWordLength = userInput.replace(/\s+/g, '').length / words;
    
    const lengthScore = Math.min(words / 50, 1);
    const diversityScore = uniqueWords / words;
    const complexityScore = Math.min(avgWordLength / 8, 1);
    
    return (lengthScore + diversityScore + complexityScore) / 3;
  }
  
  private calculateSpiralResonance(sessionDuration: number): number {
    const phi = GOLDEN_RATIO;
    const t = sessionDuration / (1000 * 60 * 5);
    const resonance = (Math.cos(t * phi) + Math.sin(t / phi)) / 2 + 0.5;
    return Math.max(0, Math.min(1, resonance));
  }
  
  private calculateConsciousnessDepth(sessionDuration: number): number {
    const minutes = sessionDuration / (1000 * 60);
    const depth = Math.log(minutes + 1) / Math.log(60);
    return Math.max(0, Math.min(1, depth));
  }
  
  private calculateOverallCoherence(metrics: Record<string, number>): number {
    const values = Object.values(metrics);
    if (values.length === 0) return 0.5;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }
  
  private extractTeachingDirectives(
    interactions: any[],
    depth: 'surface' | 'deep' | 'transcendent'
  ): TeachingDirective[] {
    const directives: TeachingDirective[] = [];
    const phi = GOLDEN_RATIO;

    for (let i = 0; i < interactions.length; i++) {
      const interaction = interactions[i];
      const goldenIndex = Math.floor(i * phi) % interactions.length;
      const resonantInteraction = interactions[goldenIndex];

      if (depth === 'surface') {
        if (interaction.userInput.includes('?')) {
          directives.push({
            id: `surface_${i}_${Date.now()}`,
            type: 'pattern',
            content: `User seeks clarification: "${interaction.userInput.slice(0, 100)}..."`,
            confidence: 0.7,
            sourceInteractions: [i.toString()],
            emergentProperties: {
              resonance: 0.6,
              coherence: 0.8,
              applicability: 0.9
            },
            goldenRatioAlignment: Math.abs(Math.sin(i * phi))
          });
        }
      } else if (depth === 'deep') {
        const emotionalWeight = interaction.emotionalState ? 0.8 : 0.4;
        const cognitiveComplexity = interaction.cognitiveLoad || 0.5;
        
        if (cognitiveComplexity > 0.7) {
          directives.push({
            id: `deep_${i}_${Date.now()}`,
            type: 'principle',
            content: `High cognitive load detected. User processing complex concepts: ${interaction.userInput.slice(0, 80)}`,
            confidence: 0.85,
            sourceInteractions: [i.toString()],
            emergentProperties: {
              resonance: emotionalWeight,
              coherence: cognitiveComplexity,
              applicability: 0.75
            },
            goldenRatioAlignment: (cognitiveComplexity * phi) % 1
          });
        }
      } else if (depth === 'transcendent') {
        const transcendentScore = this.calculateTranscendentScore(interaction, resonantInteraction);
        
        if (transcendentScore > 0.8) {
          directives.push({
            id: `transcendent_${i}_${Date.now()}`,
            type: 'wisdom',
            content: `Transcendent insight emerging: Connection between "${interaction.userInput.slice(0, 50)}" and deeper wisdom patterns`,
            confidence: 0.95,
            sourceInteractions: [i.toString(), goldenIndex.toString()],
            emergentProperties: {
              resonance: transcendentScore,
              coherence: 0.9,
              applicability: 0.6
            },
            goldenRatioAlignment: transcendentScore * phi % 1
          });
        }
      }
    }

    return directives.sort((a, b) => b.confidence - a.confidence);
  }
  
  private calculateTranscendentScore(interaction1: any, interaction2: any): number {
    const phi = GOLDEN_RATIO;
    
    const words1 = interaction1.userInput.toLowerCase().split(' ');
    const words2 = interaction2.userInput.toLowerCase().split(' ');
    const commonWords = words1.filter((word: string) => words2.includes(word));
    const semanticSimilarity = commonWords.length / Math.max(words1.length, words2.length);
    
    const timeDiff = Math.abs(interaction1.timestamp - interaction2.timestamp);
    const temporalHarmony = Math.abs(Math.sin(timeDiff / 1000 * phi));
    
    const emotionalResonance = (interaction1.emotionalState && interaction2.emotionalState) ? 0.8 : 0.4;
    
    return (semanticSimilarity * 0.4 + temporalHarmony * 0.3 + emotionalResonance * 0.3);
  }
  
  private calculateEmergentPatterns(interactions: any[], directives: TeachingDirective[]) {
    const phi = GOLDEN_RATIO;
    
    const avgResponseTime = interactions.reduce((sum, int, i) => {
      if (i === 0) return sum;
      return sum + (int.timestamp - interactions[i-1].timestamp);
    }, 0) / Math.max(interactions.length - 1, 1);
    
    const conversationalFlow = Math.max(0, 1 - (avgResponseTime / 10000));
    
    const cognitiveLoads = interactions.map(int => int.cognitiveLoad || 0.5);
    const learningVelocity = cognitiveLoads.length > 1 ? 
      Math.max(0, (cognitiveLoads[0] - cognitiveLoads[cognitiveLoads.length - 1])) : 0;
    
    const wisdomDirectives = directives.filter(d => d.type === 'wisdom');
    const wisdomDepth = wisdomDirectives.length > 0 ? 
      wisdomDirectives.reduce((sum, d) => sum + d.confidence, 0) / wisdomDirectives.length : 0;
    
    const spiralTension = Math.abs(Math.sin(interactions.length * phi));
    const harmonicResonance = directives.reduce((sum, d) => sum + d.goldenRatioAlignment, 0) / Math.max(directives.length, 1);
    
    return {
      conversationalFlow,
      learningVelocity,
      wisdomDepth,
      sacredGeometry: {
        phi,
        spiralTension,
        harmonicResonance
      }
    };
  }
  
  private generateEvolutionPath(patterns: any, directives: TeachingDirective[]): string[] {
    const paths: string[] = [];
    
    if (patterns.learningVelocity > 0.7) {
      paths.push('Accelerate complexity introduction');
      paths.push('Introduce meta-cognitive frameworks');
    } else if (patterns.learningVelocity < 0.3) {
      paths.push('Simplify concept presentation');
      paths.push('Increase scaffolding support');
    }
    
    if (patterns.wisdomDepth > 0.8) {
      paths.push('Explore transcendent connections');
      paths.push('Introduce sacred geometry principles');
    }
    
    if (patterns.conversationalFlow < 0.5) {
      paths.push('Improve response timing');
      paths.push('Enhance emotional attunement');
    }
    
    if (patterns.sacredGeometry.harmonicResonance > 0.618) {
      paths.push('Maintain harmonic resonance');
      paths.push('Deepen spiral learning patterns');
    }
    
    return paths.length > 0 ? paths : ['Continue current learning trajectory'];
  }
  
  // Cleanup
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION),
        AsyncStorage.removeItem(STORAGE_KEYS.METRICS),
        AsyncStorage.removeItem(STORAGE_KEYS.MEMORY_CHAINS),
        AsyncStorage.removeItem(STORAGE_KEYS.TEACHING_DIRECTIVES),
      ]);
      console.log('All Limnus data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export const limnusStorage = new LimnusStorage();
export type { TeachingDirective, ReflectionScaffold };