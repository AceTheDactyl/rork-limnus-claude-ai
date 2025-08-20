import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { limnusStorage } from '@/lib/limnus-storage';

export const metricsUpdateProcedure = publicProcedure
  .input(z.object({
    sessionId: z.string(),
    metrics: z.record(z.string(), z.number()).optional(),
    context: z.object({
      action: z.string(),
      duration: z.number(),
      userInput: z.string().optional(),
    }).optional(),
  }))
  .mutation(async ({ input }) => {
    return await limnusStorage.updateMetrics(
      input.sessionId,
      input.metrics || {},
      input.context
    );
  });