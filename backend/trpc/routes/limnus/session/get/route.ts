import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { limnusStorage } from '@/lib/limnus-storage';

export const getSessionProcedure = publicProcedure
  .input(z.object({ sessionId: z.string() }))
  .query(async ({ input }) => {
    return await limnusStorage.getSession(input.sessionId);
  });