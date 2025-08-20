import { createTRPCRouter } from "./create-context";
import { default as hiRoute } from "./routes/example/hi/route";
import { sendMessageProcedure } from "./routes/chat/send-message/route";
import { getConversationsProcedure } from "./routes/chat/get-conversations/route";
import { getMessagesProcedure } from "./routes/chat/get-messages/route";
import { consentStartProcedure } from "./routes/limnus/consent/start/route";
import { metricsUpdateProcedure } from "./routes/limnus/metrics/update/route";
import { scaffoldProcedure } from "./routes/limnus/reflection/scaffold/route";
import { getSessionProcedure } from "./routes/limnus/session/get/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  chat: createTRPCRouter({
    sendMessage: sendMessageProcedure,
    getConversations: getConversationsProcedure,
    getMessages: getMessagesProcedure,
  }),
  limnus: createTRPCRouter({
    consent: createTRPCRouter({
      start: consentStartProcedure,
    }),
    metrics: createTRPCRouter({
      update: metricsUpdateProcedure,
    }),
    reflection: createTRPCRouter({
      scaffold: scaffoldProcedure,
    }),
    session: createTRPCRouter({
      get: getSessionProcedure,
    }),
  }),
});

export type AppRouter = typeof appRouter;