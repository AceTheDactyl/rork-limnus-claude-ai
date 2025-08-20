import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { limnusStorage } from '@/lib/limnus-storage';

const scaffoldInputSchema = z.object({
  sessionId: z.string(),
  interactions: z.array(z.object({
    timestamp: z.number(),
    userInput: z.string(),
    systemResponse: z.string(),
    context: z.record(z.string(), z.any()).optional(),
    emotionalState: z.string().optional(),
    cognitiveLoad: z.number().min(0).max(1).optional()
  })),
  reflectionDepth: z.enum(['surface', 'deep', 'transcendent']).optional().default('deep')
});

export const scaffoldProcedure = publicProcedure
  .input(scaffoldInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof scaffoldInputSchema> }) => {
    const { sessionId, interactions, reflectionDepth } = input;
    
    return await limnusStorage.scaffoldReflection(
      sessionId,
      interactions,
      reflectionDepth
    );
  });