import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { requireActionCtx, requireRunMutationCtx } from "@convex-dev/better-auth/utils";
import { components, internal } from "./_generated/api";
import { query, QueryCtx } from "./_generated/server";
import { betterAuth } from "better-auth";
import { createAuthMiddleware, emailOTP, magicLink } from "better-auth/plugins";
import { DataModel } from "./_generated/dataModel";
import {
  sendEmailVerification,
  sendMagicLink,
  sendOTPVerification,
  sendResetPassword,
} from "./email";

const AUTH_SYNC_PATH_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/callback",
  "/oauth2/callback",
  "/magic-link/verify",
  "/email-otp/verify-email",
  "/phone-number/verify",
  "/siwe/verify",
] as const;

const deriveNameParts = (name?: string | null, fallback?: string | null) => {
  if (!name && !fallback) {
    return { givenName: undefined, familyName: undefined };
  }

  const normalized = (name ?? fallback ?? "").trim();
  if (!normalized) {
    return { givenName: undefined, familyName: undefined };
  }

  const segments = normalized.split(/\s+/).filter(Boolean);
  if (!segments.length) {
    return { givenName: undefined, familyName: undefined };
  }

  const [givenName, ...rest] = segments;
  return {
    givenName,
    familyName: rest.length ? rest.join(" ") : undefined,
  };
};

export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: false,
});

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  const runMutationCtx = optionsOnly ? null : requireRunMutationCtx(ctx);

  return betterAuth({
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: false,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword(requireActionCtx(ctx), {
          to: user.email,
          url,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmailVerification(requireActionCtx(ctx), {
          to: user.email,
          url,
        });
      },
    },
    hooks: {
      after: createAuthMiddleware(async ({ context, path }) => {
        const shouldSyncUserForPath = (path: string) =>
          AUTH_SYNC_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

        const buildTokenIdentifier = (issuer: string, subject: string) =>
          `${issuer}|${subject}`;

        if (!runMutationCtx) {
          console.log("runMutationCtx is null");
          return;
        }
        if (!shouldSyncUserForPath(path)) {
          return;
        }

        const session = context.session ?? context.newSession;
        if (!session) {
          console.log("session is null");
          return;
        }
        const sessionUser = session.user;
        const tokenIdentifier =
          sessionUser && process.env.CONVEX_SITE_URL
            ? buildTokenIdentifier(process.env.CONVEX_SITE_URL, sessionUser.id)
            : null;

        if (!sessionUser || !tokenIdentifier) {
          return;
        }

        const { givenName, familyName } = deriveNameParts(sessionUser.name, sessionUser.email);

        try {
          await runMutationCtx.runMutation(internal.users.internalGetOrCreateUser, {
            tokenIdentifier,
            givenName,
            familyName,
            imageUrl: sessionUser.image ?? undefined,
          });
        } catch (error) {
          console.error("Failed to sync Convex user from Better Auth session", error);
        }
      }),
    },
    logger: {
      disabled: optionsOnly,
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLink(requireActionCtx(ctx), {
            to: email,
            url,
          });
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification(requireActionCtx(ctx), {
            to: email,
            code: otp,
          });
        },
      }),
      crossDomain({ siteUrl: process.env.SITE_URL! }),
      convex(),
    ],
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
  });
};

// Below are example helpers and functions for getting the current user
// Feel free to edit, omit, etc.
export const safeGetUser = async (ctx: QueryCtx) => {
  return authComponent.safeGetAuthUser(ctx);
};

export const getUserId = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject;
};

export const getUser = async (ctx: QueryCtx) => {
  return authComponent.getAuthUser(ctx);
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    console.log("identity", await ctx.auth.getUserIdentity());
    return safeGetUser(ctx);
  },
});
