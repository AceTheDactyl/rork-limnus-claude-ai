import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { limnusStorage } from '@/lib/limnus-storage';

export const consentStartProcedure = publicProcedure
  .input(z.object({
    phrase: z.string(),
    timestamp: z.string(),
    deviceFingerprint: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    return await limnusStorage.createSession(input.phrase, input.deviceFingerprint);
  });