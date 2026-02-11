import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  userInBetterAuth as users,
  userTypesInAuthz as userTypes,
} from "~/server/db/schema";
import { publicProcedure, router } from "~/server/trpc/trpc";
import { fromNodeHeaders } from "better-auth/node";
import { eq, sql } from "drizzle-orm";
import { object, uuidv7, z } from "zod";

export const usersRouter = router({
  completeOnboarding: publicProcedure
    .input(
      z.object({
        userId: z.uuidv7(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(users)
        .set({ timestampOnboardingCompleted: sql`CURRENT_TIMESTAMP` })
        .where(eq(users.id, input.userId));
    }),
  getAllUsers: publicProcedure.query(async () => {
    const rows = await db.select().from(users);
    return rows;
  }),
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    const response = await auth.api.getSession({
      headers: fromNodeHeaders(ctx.req.headers),
    });

    if (!response || !response.session) return null;
    const { session } = response;

    const [row] = await db
      .select()
      .from(users)
      .leftJoin(userTypes, eq(userTypes.id, users.userTypeId))
      .where(eq(users.id, session.userId));

    if (!row) return null;

    return {
      ...row.user,
      userType: row.user_types!,
      isImporsonated: !!session.impersonatedBy,
    };
    // flow draft: user first logs in -> goes to "/new-user" -> form to fill out details such as name, etc -> user info updated -> set timestamp first login -> redirect to "/"
  }),
  getUserById: publicProcedure
    .input(object({ userId: uuidv7() }))
    .query(async ({ input }) => {
      const { userId } = input;
      const [row] = await db.select().from(users).where(eq(users.id, userId));
      return row;
    }),
  getUserSummary: publicProcedure
    .input(object({ userId: uuidv7() }))
    .query(async ({ input }) => {
      const { userId } = input;

      const [row] = await db
        .select({
          id: users.id,
          nameFirst: users.nameFirst,
          nameMiddle: users.nameMiddle,
          nameLast: users.nameLast,
          phoneNumber: users.phoneNumber,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId));
      if (!row) return null;

      return {
        ...row,
      };
    }),

  getUsersForCombobox: publicProcedure.query(async () => {
    const rows = await db
      .select({
        id: users.id,
        display: users.displayName,
        nameFirst: users.nameFirst,
        nameLast: users.nameLast,
      })
      .from(users);
    return rows;
  }),
  updateSystemRoleId: publicProcedure
    .input(
      object({
        userId: uuidv7(),
        systemRoleId: uuidv7(),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId, systemRoleId } = input;
      await db
        .update(users)
        .set({
          systemRoleId,
        })
        .where(eq(users.id, userId));
    }),
  updateUserTypeId: publicProcedure
    .input(
      object({
        userId: uuidv7(),
        userTypeId: uuidv7(),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId, userTypeId } = input;
      await db
        .update(users)
        .set({
          userTypeId,
        })
        .where(eq(users.id, userId));
    }),
});
