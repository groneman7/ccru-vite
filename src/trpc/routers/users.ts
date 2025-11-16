import { db } from "@/db";
import { userInBetterAuth, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { publicProcedure, router } from "@/trpc/trpc";
import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";

export const usersRouter = router({
  getOrCreateUser: publicProcedure.query(async ({ ctx }) => {
    console.log("____GETTING OR CREATING FUCKING USER____");
    const response = await auth.api.getSession({
      headers: fromNodeHeaders(ctx.req.headers),
    });
    console.log(response);
    if (!response || !response.session) return null;

    const { session } = response;
    // LEFT OFF HERE ON NOV 15 - Need to make this dog shit code shit out a fucking user when a nigga logged in cause right now it don't do shit
    const betterAuthUser = await db.query.userInBetterAuth.findFirst({
      where: eq(userInBetterAuth, session.userId),
    });

    if (!betterAuthUser)
      throw new Error("Failed to find user in getOrCreateUser procedure.");

    const user = await db.query.users.findFirst({
      where: eq(users, session.userId),
    });

    if (!user) {
      const nameFirst = betterAuthUser.name.split(" ")[0];
      const nameLast = betterAuthUser.name.split(" ")[-1];
      const newUser = await db
        .insert(users)
        .values({
          nameFirst,
          nameLast,
          betterAuthId: session.userId,
        })
        .returning();
      if (!newUser)
        throw new Error("Failed to create user in getOrCreateUser procedure.");
      return {
        id: newUser[0].id,
        nameFirst,
        nameLast,
      };
    } else {
      return {
        id: user.id,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      };
    }
  }),
});
