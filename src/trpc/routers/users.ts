import { db } from "@/db";
import { userInBetterAuth, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { publicProcedure, router } from "@/trpc/trpc";
import { fromNodeHeaders } from "better-auth/node";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

export const usersRouter = router({
  completeOnboarding: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(users)
        .set({ timestampOnboardingCompleted: sql`CURRENT_TIMESTAMP` })
        .where(eq(users.id, input.userId));
    }),
  getOrCreateUser: publicProcedure.query(async ({ ctx }) => {
    const response = await auth.api.getSession({
      headers: fromNodeHeaders(ctx.req.headers),
    });

    if (!response || !response.session) return null;

    const { session } = response;
    const betterAuthUser = await db.query.userInBetterAuth.findFirst({
      where: eq(userInBetterAuth.id, session.userId),
    });

    if (!betterAuthUser)
      throw new Error("Failed to find user in getOrCreateUser procedure.");

    const user = await db.query.users.findFirst({
      where: eq(users.betterAuthId, session.userId),
    });

    if (!user) {
      const name = betterAuthUser.name.split(" ");
      const nameFirst = name[0];
      const nameMiddle = name.slice(1, -1).join(" ") || undefined;
      const nameLast = name[name.length - 1];
      const newUser = await db
        .insert(users)
        .values({
          nameFirst,
          nameMiddle,
          nameLast,
          betterAuthId: session.userId,
        })
        .returning();
      if (!newUser)
        throw new Error("Failed to create user in getOrCreateUser procedure.");
      return {
        id: newUser[0].id,
        nameFirst: newUser[0].nameFirst,
        nameLast: newUser[0].nameLast,
        timestampFirstLogin: newUser[0].timestampFirstLogin,
        onBoardingCompleted: newUser[0].timestampOnboardingCompleted !== null,
      };
    } else {
      return {
        id: user.id,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        timestampFirstLogin: user.timestampFirstLogin,
        onBoardingCompleted: user.timestampOnboardingCompleted !== null,
      };
    }
  }),
});
