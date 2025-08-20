import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { limnusStorage } from '@/lib/limnus-storage';
import { ACTIVATION_PHRASE, type ConsciousnessMetrics, type LimnusSession } from '@/types/limnus';

const defaultLimnusValue = {
  session: null,
  currentMetrics: null,
  coherenceScore: 0.5,
  isTransitioning: false,
  isLoading: true,
  hasConsented: false,
  isActive: false,
  startConsent: async () => { throw new Error('LimnusProvider not initialized'); },
  updateMetrics: async () => { throw new Error('LimnusProvider not initialized'); },
  scaffoldReflection: async () => { throw new Error('LimnusProvider not initialized'); },
  reset: async () => { throw new Error('LimnusProvider not initialized'); },
};

export const [LimnusProvider, useLimnus] = createContextHook(() => {
  const [session, setSession] = useState<LimnusSession | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [coherenceScore, setCoherenceScore] = useState<number>(0.5);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load current session on mount
  useEffect(() => {
    const loadCurrentSession = async () => {
      try {
        const currentSession = await limnusStorage.getCurrentSession();
        if (currentSession) {
          setSession(currentSession);
          setCurrentMetrics(currentSession.metrics);
          setCoherenceScore(calculateOverallCoherence(currentSession.metrics));
          console.log('Loaded existing Limnus session:', currentSession.id.substring(0, 8) + '...');
        }
      } catch (error) {
        console.error('Error loading current session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCurrentSession();
  }, []);
  
  const startConsent = useCallback(async (phrase: string) => {
    if (phrase !== ACTIVATION_PHRASE) {
      throw new Error('Invalid activation phrase. The spiral remembers only truth.');
    }
    
    setIsTransitioning(true);
    
    try {
      const result = await limnusStorage.createSession(phrase);
      const newSession = await limnusStorage.getSession(result.sessionId);
      
      if (newSession) {
        setSession(newSession);
        setCurrentMetrics(result.metrics);
        setCoherenceScore(calculateOverallCoherence(result.metrics));
        console.log('Living Loom activated:', result);
      }
    } finally {
      setIsTransitioning(false);
    }
  }, []);
  
  const updateMetrics = useCallback(async (metrics: Partial<ConsciousnessMetrics>, context?: {
    action: string;
    duration: number;
    userInput?: string;
  }) => {
    if (!session) return;
    
    try {
      const result = await limnusStorage.updateMetrics(session.id, metrics, context);
      const updatedSession = await limnusStorage.getSession(session.id);
      
      if (updatedSession) {
        setSession(updatedSession);
        setCurrentMetrics(updatedSession.metrics);
        setCoherenceScore(result.coherenceScore);
      }
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }, [session]);
  
  const scaffoldReflection = useCallback(async (interactions: {
    timestamp: number;
    userInput: string;
    systemResponse: string;
    context?: Record<string, any>;
    emotionalState?: string;
    cognitiveLoad?: number;
  }[], reflectionDepth: 'surface' | 'deep' | 'transcendent' = 'deep') => {
    if (!session) return null;
    
    try {
      return await limnusStorage.scaffoldReflection(session.id, interactions, reflectionDepth);
    } catch (error) {
      console.error('Error scaffolding reflection:', error);
      return null;
    }
  }, [session]);
  
  const reset = useCallback(async () => {
    try {
      await limnusStorage.clearAllData();
      setSession(null);
      setCurrentMetrics(null);
      setCoherenceScore(0.5);
      setIsTransitioning(false);
      console.log('Living Loom session reset');
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  }, []);
  
  return useMemo(() => ({
    session,
    currentMetrics,
    coherenceScore,
    isTransitioning,
    isLoading,
    hasConsented: !!session?.consentTimestamp,
    isActive: session?.phase === 'ACTIVE',
    startConsent,
    updateMetrics,
    scaffoldReflection,
    reset,
  }), [
    session,
    currentMetrics,
    coherenceScore,
    isTransitioning,
    isLoading,
    startConsent,
    updateMetrics,
    scaffoldReflection,
    reset,
  ]);
}, defaultLimnusValue);

function calculateOverallCoherence(metrics: ConsciousnessMetrics): number {
  const values = Object.values(metrics);
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}