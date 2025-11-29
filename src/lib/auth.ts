import { db } from "@/db";
import {
  accountInBetterAuth,
  sessionInBetterAuth,
  userInBetterAuth,
  verificationInBetterAuth,
} from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";

export const auth = betterAuth({
  trustedOrigins: [process.env.SITE_URL ?? "http://localhost:5173"],
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
  },
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
    enabled: true,
  },
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber, code }, ctx) => {
        // TODO: Implement sending OTP code via SMS
      },
    }),
  ],
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      phoneNumber: { type: "string" },
      phoneNumberVerified: { type: "boolean" },
    },
  },
});
