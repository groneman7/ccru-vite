import { db } from "@/db";
import {
  accountInBetterAuth,
  sessionInBetterAuth,
  userInBetterAuth,
  verificationInBetterAuth,
} from "@/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  trustedOrigins: [process.env.SITE_URL ?? "http://localhost:5173"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: userInBetterAuth,
      session: sessionInBetterAuth,
      account: accountInBetterAuth,
      verification: verificationInBetterAuth,
    },
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
