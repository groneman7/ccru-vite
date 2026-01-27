import { auth } from "~client/lib/auth";
import { db } from "~server/db";
import {
  attributeKeysInAuthz as attributeKeys,
  attributeValuesInAuthz as attributeValues,
  junctionUserAttributesInAuthz as junctionUserAttributes,
  userInBetterAuth as users,
} from "~server/db/schema";
import { publicProcedure, router } from "~server/trpc/trpc";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq, inArray, sql } from "drizzle-orm";
import { array, object, string, uuidv7, z } from "zod";

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
  getAllUsersForTable: publicProcedure.query(async () => {
    const usersRows = await db.select().from(users);

    const attributeRows = await db
      .select({
        userId: junctionUserAttributes.userId,
        keyName: attributeKeys.name,
        valueDisplay: attributeValues.display,
      })
      .from(junctionUserAttributes)
      .innerJoin(
        attributeValues,
        eq(attributeValues.id, junctionUserAttributes.valueId),
      )
      .innerJoin(attributeKeys, eq(attributeKeys.id, attributeValues.keyId))
      .where(eq(attributeKeys.type, "single"));

    // Bucket attributes by userId and key
    const attributesByUser: Record<string, Record<string, string | null>> = {};
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
    .input(object({ userId: uuidv7() }))
    .query(async ({ input }) => {
      const { userId } = input;
      const rows = await db
        .select({
          attributeId: junctionUserAttributes.id,
          userId: junctionUserAttributes.userId,
          keyId: attributeKeys.id,
          keyName: attributeKeys.name,
          keyType: attributeKeys.type,
          keyDisplay: attributeKeys.display,
          valueName: attributeValues.name,
          valueDisplay: attributeValues.display,
        })
        .from(junctionUserAttributes)
        .leftJoin(
          attributeValues,
          eq(attributeValues.id, junctionUserAttributes.valueId),
        )
        .leftJoin(attributeKeys, eq(attributeKeys.id, attributeValues.keyId))
        .where(eq(junctionUserAttributes.userId, userId));

      // TODO: Is there a way to map this directly to db schema?
      type Group = {
        keyName: string;
        keyDisplay: string;
        keyType: "single" | "multiple";
        values: {
          attributeId: string;
          valueName: string;
          valueDisplay: string;
        }[];
      };
      type Groups = Record<string, Group>;

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
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    const response = await auth.api.getSession({
      headers: fromNodeHeaders(ctx.req.headers),
    });

    if (!response || !response.session) return null;
    const { session } = response;

    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));

    return row;
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
    .input(object({ userId: uuidv7(), attributeKeysToSelect: array(string()) }))
    .query(async ({ input }) => {
      const { userId, attributeKeysToSelect } = input;

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

      const attributeRows = await db
        .select({
          attributeId: junctionUserAttributes.id,
          keyName: attributeKeys.name,
          keyDisplay: attributeKeys.display,
          valueName: attributeValues.name,
          valueDisplay: attributeValues.display,
        })
        .from(junctionUserAttributes)
        .innerJoin(
          attributeValues,
          eq(attributeValues.id, junctionUserAttributes.valueId),
        )
        .innerJoin(attributeKeys, eq(attributeKeys.id, attributeValues.keyId))
        .where(
          and(
            eq(junctionUserAttributes.userId, userId),
            inArray(attributeKeys.name, attributeKeysToSelect),
          ),
        );

      type AttributeForUserSummary = {
        attributeId: string;
        keyName: string;
        keyDisplay: string;
        valueName: string;
        valueDisplay: string;
      };

      const attributes: Record<string, AttributeForUserSummary> = {};

      for (const row of attributeRows) {
        attributes[row.keyName] = { ...row };
      }

      return {
        ...row,
        attributes,
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
});
