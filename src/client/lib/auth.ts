import { db } from "~server/db";
import {
  accountInBetterAuth,
  sessionInBetterAuth,
  userInBetterAuth,
  verificationInBetterAuth,
} from "~server/db/schema";
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
  advanced: {
    database: {
      // Let Neon generate a UUID
      generateId: false,
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
    // phoneNumber({
    //   sendOTP: ({ phoneNumber, code }, ctx) => {
    //     // TODO: Implement sending OTP code via SMS
    //   },
    // }),
  ],
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    fields: {
      createdAt: "timestampCreatedAt",
      name: "displayName",
      updatedAt: "timestampUpdatedAt",
    },
    additionalFields: {
      nameFirst: { type: "string", required: true, input: true },
      nameMiddle: { type: "string", required: true, input: true },
      nameLast: { type: "string", required: true, input: true },
      phoneNumber: { type: "string" },
      phoneNumberVerified: { type: "boolean" },
      postNominals: { type: "string", required: false, input: true },
      status: {
        // IMPORTANT: Any changes to this enum need to be manually reflected in the database schema
        type: ["active", "inactive", "invited"],
        required: false,
        input: false,
      },
      timestampFirstLogin: {
        type: "date",
        required: false,
        input: false,
      },
      timestampOnboardingCompleted: {
        type: "date",
        required: false,
        input: true,
      },
    },
  },
});
