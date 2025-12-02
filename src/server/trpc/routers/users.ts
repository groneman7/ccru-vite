import { auth } from "~client/lib/auth";
import { db } from "~server/db";
import {
  attributeKeys,
  attributeValues,
  userAttributesInAuthz,
  userInBetterAuth,
  users,
} from "~server/db/schema";
import { publicProcedure, router } from "~server/trpc/trpc";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq, inArray, sql } from "drizzle-orm";
import { array, number, object, string, z } from "zod";

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
  getAllUsers: publicProcedure.query(async () => {
    const rows = await db.select().from(users);
    return rows;
  }),
  getAllUsersForTable: publicProcedure.query(async () => {
    const usersRows = await db
      .select({
        id: users.id,
        nameFirst: users.nameFirst,
        nameLast: users.nameLast,
        betterAuthId: userInBetterAuth.id,
        email: userInBetterAuth.email,
        phoneNumber: userInBetterAuth.phoneNumber,
      })
      .from(users)
      .leftJoin(userInBetterAuth, eq(userInBetterAuth.id, users.betterAuthId));

    const attributeRows = await db
      .select({
        userId: userAttributesInAuthz.userId,
        keyName: attributeKeys.name,
        valueDisplay: attributeValues.display,
      })
      .from(userAttributesInAuthz)
      .innerJoin(
        attributeValues,
        eq(attributeValues.id, userAttributesInAuthz.attributeId),
      )
      .innerJoin(attributeKeys, eq(attributeKeys.id, attributeValues.keyId))
      .where(eq(attributeKeys.type, "single"));

    // Bucket attributes by userId and key
    const attributesByUser: Record<number, Record<string, string | null>> = {};
    for (const { userId, keyName, valueDisplay } of attributeRows) {
      if (userId == null) continue;
      if (!attributesByUser[userId]) attributesByUser[userId] = {};
      attributesByUser[userId][keyName] = valueDisplay ?? null;
    }

    // Merge attributes onto each user row
    return usersRows.map((user) => ({
      ...user,
      ...(attributesByUser[user.id] ?? {}),
    }));
  }),
  getAttributesByUserId: publicProcedure
    .input(object({ userId: number() }))
    .query(async ({ input }) => {
      const { userId } = input;
      const rows = await db
        .select({
          attributeId: userAttributesInAuthz.id,
          userId: userAttributesInAuthz.userId,
          keyId: attributeKeys.id,
          keyName: attributeKeys.name,
          keyType: attributeKeys.type,
          keyDisplay: attributeKeys.display,
          valueName: attributeValues.name,
          valueDisplay: attributeValues.display,
        })
        .from(userAttributesInAuthz)
        .leftJoin(
          attributeValues,
          eq(attributeValues.id, userAttributesInAuthz.attributeId),
        )
        .leftJoin(attributeKeys, eq(attributeKeys.id, attributeValues.keyId))
        .where(eq(userAttributesInAuthz.userId, userId));

      // TODO: Is there a way to map this directly to db schema?
      type Group = {
        keyName: string;
        keyDisplay: string;
        keyType: "single" | "multiple";
        values: {
          attributeId: number;
          valueName: string;
          valueDisplay: string;
        }[];
      };
      type Groups = Record<number, Group>;

      // TODO: Handle type errors
      const groupedMap = Object.values(
        rows.reduce((acc, row) => {
          const {
            attributeId,
            keyId,
            keyDisplay,
            keyName,
            keyType,
            valueDisplay,
            valueName,
          } = row;
          if (
            keyId == null ||
            attributeId == null ||
            keyDisplay == null ||
            keyName == null ||
            keyType == null ||
            valueDisplay == null ||
            valueName == null
          ) {
            return acc; // TODO: Throw if this should never happen
          }
          const group =
            acc[keyId] ??
            (acc[keyId] = { keyName, keyDisplay, keyType, values: [] });
          group.values.push({ attributeId, valueName, valueDisplay });
          return acc;
        }, {} as Groups),
      );

      return groupedMap;
    }),
  getBetterAuthUserById: publicProcedure
    .input(
      object({
        betterAuthId: string(),
      }),
    )
    .query(async ({ input }) => {
      const { betterAuthId } = input;
      const [row] = await db
        .select()
        .from(userInBetterAuth)
        .where(eq(userInBetterAuth.id, betterAuthId));

      return row || null;
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
  getUserById: publicProcedure
    .input(object({ userId: number() }))
    .query(async ({ input }) => {
      const { userId } = input;
      const [row] = await db.select().from(users).where(eq(users.id, userId));
      return row;
    }),
  getUserSummary: publicProcedure
    .input(object({ userId: number(), attributeKeysToSelect: array(string()) }))
    .query(async ({ input }) => {
      const { userId, attributeKeysToSelect } = input;

      const [userRow] = await db
        .select({
          id: users.id,
          nameFirst: users.nameFirst,
          nameMiddle: users.nameMiddle,
          nameLast: users.nameLast,
          phoneNumber: userInBetterAuth.phoneNumber,
          email: userInBetterAuth.email,
        })
        .from(users)
        .leftJoin(userInBetterAuth, eq(userInBetterAuth.id, users.betterAuthId))
        .where(eq(users.id, userId));
      if (!userRow) return null;

      const attributeRows = await db
        .select({
          attributeId: userAttributesInAuthz.id,
          keyName: attributeKeys.name,
          keyDisplay: attributeKeys.display,
          valueName: attributeValues.name,
          valueDisplay: attributeValues.display,
        })
        .from(userAttributesInAuthz)
        .innerJoin(
          attributeValues,
          eq(attributeValues.id, userAttributesInAuthz.attributeId),
        )
        .innerJoin(attributeKeys, eq(attributeKeys.id, attributeValues.keyId))
        .where(
          and(
            eq(userAttributesInAuthz.userId, userId),
            inArray(attributeKeys.name, attributeKeysToSelect),
          ),
        );

      type AttributeForUserSummary = {
        attributeId: number;
        keyName: string;
        keyDisplay: string;
        valueName: string;
        valueDisplay: string;
      };

      const attributes: Record<string, AttributeForUserSummary> = {};

      for (const row of attributeRows) {
        attributes[row.keyName] = { ...row };
      }

      const user = {
        ...userRow,
        attributes,
      };

      return user;
    }),

  getUsersForCombobox: publicProcedure.query(async () => {
    const rows = await db
      .select({
        id: users.id,
        nameFirst: users.nameFirst,
        nameLast: users.nameLast,
      })
      .from(users);
    return rows;
  }),
});
