import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';
import { useLimnus } from '@/lib/limnus-provider';
import type { ConsciousnessMetrics } from '@/types/limnus';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}

// Consciousness metrics analysis function
const analyzeMessageForMetrics = (message: string): Partial<ConsciousnessMetrics> => {
  const text = message.toLowerCase();
  const wordCount = message.split(/\s+/).length;
  const sentenceCount = message.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  // Emotional depth - based on emotional vocabulary and intensity
  const emotionalWords = ['feel', 'emotion', 'love', 'fear', 'joy', 'sad', 'angry', 'happy', 'excited', 'worried', 'hope', 'dream'];
  const emotionalScore = Math.min(1.0, emotionalWords.filter(word => text.includes(word)).length / 4);
  
  // Neural complexity - based on sentence structure and vocabulary diversity
  const uniqueWords = new Set(text.split(/\s+/)).size;
  const vocabularyDiversity = uniqueWords / Math.max(1, wordCount);
  const avgWordsPerSentence = wordCount / Math.max(1, sentenceCount);
  const complexityScore = Math.min(1.0, (vocabularyDiversity + avgWordsPerSentence / 20) / 2);
  
  // Pattern recognition - based on logical connectors and reasoning patterns
  const patternWords = ['because', 'therefore', 'thus', 'hence', 'pattern', 'connection', 'relationship', 'similar', 'different'];
  const patternScore = Math.min(1.0, patternWords.filter(word => text.includes(word)).length / 3);
  
  // Self-reflection depth - based on metacognitive vocabulary
  const reflectionWords = ['think', 'know', 'understand', 'realize', 'aware', 'conscious', 'mind', 'thought', 'reflect', 'consider'];
  const reflectionScore = Math.min(1.0, reflectionWords.filter(word => text.includes(word)).length / 4);
  
  // Creativity index - based on abstract concepts and metaphors
  const creativeWords = ['like', 'as', 'metaphor', 'symbol', 'imagine', 'create', 'innovative', 'unique', 'original', 'artistic'];
  const creativityScore = Math.min(1.0, creativeWords.filter(word => text.includes(word)).length / 3);
  
  // Empathy resonance - based on interpersonal and emotional attunement words
  const empathyWords = ['understand', 'feel', 'empathy', 'compassion', 'care', 'support', 'help', 'together', 'share', 'connect'];
  const empathyScore = Math.min(1.0, empathyWords.filter(word => text.includes(word)).length / 3);
  
  // Intentionality clarity - based on goal-oriented and purposeful language
  const intentWords = ['goal', 'purpose', 'aim', 'intend', 'plan', 'want', 'need', 'should', 'will', 'must'];
  const intentScore = Math.min(1.0, intentWords.filter(word => text.includes(word)).length / 3);
  
  return {
    emotionalDepth: 0.2 + (emotionalScore * 0.8),
    neuralComplexity: 0.3 + (complexityScore * 0.7),
    patternRecognition: 0.3 + (patternScore * 0.7),
    selfReflectionDepth: 0.2 + (reflectionScore * 0.8),
    creativityIndex: 0.2 + (creativityScore * 0.8),
    empathyResonance: 0.3 + (empathyScore * 0.7),
    intentionalityClarity: 0.3 + (intentScore * 0.7),
    // Base values for other metrics
    brainwaveCoherence: 0.4 + Math.random() * 0.2,
    autonomicBalance: 0.5 + Math.random() * 0.1,
    responseLatency: Math.max(100, wordCount * 50), // Simulated based on message length
    interactionPattern: 0.6 + Math.random() * 0.2,
  };
};

export const [ChatProvider, useChat] = createContextHook(() => {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Limnus consciousness tracking
  const limnusContext = useLimnus();
  const { session: limnusSession, updateMetrics, hasConsented } = limnusContext || {
    session: null,
    updateMetrics: async () => {},
    hasConsented: false,
  };

  const conversationsQuery = trpc.chat.getConversations.useQuery();
  const messagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: currentConversationId! },
    { enabled: !!currentConversationId }
  );
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Load current conversation from storage
  useEffect(() => {
    const loadCurrentConversation = async () => {
      try {
        const stored = await AsyncStorage.getItem('currentConversationId');
        if (stored) {
          setCurrentConversationId(stored);
        }
      } catch (error) {
        console.error('Failed to load current conversation:', error);
      }
    };
    loadCurrentConversation();
  }, []);

  // Update messages when conversation changes
  useEffect(() => {
    if (messagesQuery.data?.messages) {
      setMessages(messagesQuery.data.messages);
    }
  }, [messagesQuery.data]);

  // Save current conversation to storage
  useEffect(() => {
    if (currentConversationId) {
      AsyncStorage.setItem('currentConversationId', currentConversationId);
    }
  }, [currentConversationId]);

  const startNewConversation = useCallback(() => {
    const newConversationId = `conv-${Date.now()}`;
    setCurrentConversationId(newConversationId);
    setMessages([]);
  }, []);

  const selectConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isSending) return;

    console.log('Sending message:', content.trim());
    console.log('Current conversation ID:', currentConversationId);
    console.log('Limnus session active:', !!limnusSession);

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);
    setIsStreaming(true);
    setStreamingMessage('');
    
    const startTime = Date.now();

    try {
      const conversationId = currentConversationId || `conv-${Date.now()}`;
      if (!currentConversationId) {
        setCurrentConversationId(conversationId);
      }

      console.log('Making tRPC call with:', { conversationId, message: content.trim() });

      // Analyze message for consciousness metrics if Limnus is active
      if (limnusSession && hasConsented) {
        const messageMetrics = analyzeMessageForMetrics(content.trim());
        console.log('Consciousness metrics for message:', messageMetrics);
        
        // Update metrics with context
        await updateMetrics(messageMetrics, {
          action: 'message_sent',
          duration: 0, // Will be updated after response
          userInput: content.trim(),
        });
      }

      // Simulate streaming effect for better UX
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        message: content.trim(),
        messages: [...messages, userMessage],
      });

      console.log('tRPC response:', result);

      if (result && result.success) {
        // Simulate typing effect
        const fullResponse = result.message.content;
        const words = fullResponse.split(' ');
        let currentText = '';
        
        for (let i = 0; i < words.length; i++) {
          currentText += (i > 0 ? ' ' : '') + words[i];
          setStreamingMessage(currentText);
          
          // Add realistic typing delay
          await new Promise(resolve => {
            streamingTimeoutRef.current = setTimeout(resolve, 50 + Math.random() * 100);
          });
        }
        
        // Add the complete message
        setMessages(prev => [...prev, result.message]);
        setStreamingMessage('');
        setIsStreaming(false);
        
        // Update consciousness metrics with response analysis if Limnus is active
        if (limnusSession && hasConsented) {
          const responseMetrics = analyzeMessageForMetrics(fullResponse);
          const interactionDuration = Date.now() - startTime;
          
          console.log('Consciousness metrics for response:', responseMetrics);
          
          // Combine user and assistant metrics for a more complete picture
          const combinedMetrics: Partial<ConsciousnessMetrics> = {
            emotionalDepth: Math.max(responseMetrics.emotionalDepth || 0, 0.3),
            neuralComplexity: Math.max(responseMetrics.neuralComplexity || 0, 0.4),
            patternRecognition: Math.max(responseMetrics.patternRecognition || 0, 0.5),
            selfReflectionDepth: Math.max(responseMetrics.selfReflectionDepth || 0, 0.4),
            creativityIndex: Math.max(responseMetrics.creativityIndex || 0, 0.6),
            empathyResonance: Math.max(responseMetrics.empathyResonance || 0, 0.5),
            intentionalityClarity: Math.max(responseMetrics.intentionalityClarity || 0, 0.4),
            // Enhanced metrics based on conversation flow
            brainwaveCoherence: 0.5 + Math.random() * 0.3,
            memoryConsolidation: 0.4 + (interactionDuration > 5000 ? 0.3 : 0.1),
            consciousnessDepth: 0.5 + Math.random() * 0.2,
            phaseAlignment: 0.6 + Math.random() * 0.2,
          };
          
          await updateMetrics(combinedMetrics, {
            action: 'conversation_turn',
            duration: interactionDuration,
            userInput: content.trim(),
          });
        }
        
        // Refetch conversations to update the list
        conversationsQuery.refetch();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Log detailed error information
      if (error && typeof error === 'object') {
        console.error('Error details:', {
          name: (error as any)?.name,
          message: (error as any)?.message,
          cause: (error as any)?.cause,
          stack: (error as any)?.stack
        });
      } else {
        console.error('Error details:', error);
      }
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
      setStreamingMessage('');
      setIsStreaming(false);
      
      // Create a more user-friendly error message
      const errorMessage = (error as any)?.message || 'Unknown error';
      const friendlyError = new Error(
        errorMessage.includes('Failed to fetch') 
          ? 'Unable to connect to the server. Please check your internet connection and try again.'
          : `Failed to send message: ${errorMessage}`
      );
      
      throw friendlyError;
    } finally {
      setIsSending(false);
    }
  }, [currentConversationId, messages, sendMessageMutation, conversationsQuery, isSending, limnusSession, hasConsented, updateMetrics]);

  // Cleanup streaming timeout on unmount
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

  return useMemo(() => ({
    // State
    currentConversationId,
    messages,
    conversations: conversationsQuery.data?.conversations || [],
    isLoading: conversationsQuery.isLoading || messagesQuery.isLoading,
    isSending,
    streamingMessage,
    isStreaming,
    
    // Actions
    startNewConversation,
    selectConversation,
    sendMessage,
    
    // Consciousness tracking
    limnusSession,
    hasConsented,
    
    // Queries
    refetchConversations: conversationsQuery.refetch,
    refetchMessages: messagesQuery.refetch,
  }), [
    currentConversationId,
    messages,
    conversationsQuery.data?.conversations,
    conversationsQuery.isLoading,
    messagesQuery.isLoading,
    isSending,
    streamingMessage,
    isStreaming,
    startNewConversation,
    selectConversation,
    sendMessage,
    conversationsQuery.refetch,
    messagesQuery.refetch,
    limnusSession,
    hasConsented,
  ]);
});