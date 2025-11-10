import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const getAllUsers = query({
  args: {},
  handler: async ({ db }) => {
    const users = await db.query("users").collect();
    return users;
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async ({ auth, db }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called getCurrentUser without a user being logged in.");
    }

    const user = await db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User with current toekn identifier not found.");
    }

    return user;
  },
});

// export const getOrCreateUser = mutation({
//   args: {},
//   handler: async ({ auth, db }) => {
//     const identity = await auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Called getOrCreateUser without a user being logged in.");
//     }

//     const user = await db
//       .query("users")
//       .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
//       .unique();

//     if (user) return user;

//     const newUser = await db.insert("users", {
//       tokenIdentifier: identity.tokenIdentifier,
//       // TODO: Validate on client so we have a first and last name
//       firstName: identity.givenName ?? "",
//       lastName: identity.familyName ?? "",
//       imageUrl: identity.imageUrl?.toString(),
//     });

//     return await db.get(newUser);
//   },
// });

export const internalGetOrCreateUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    givenName: v.optional(v.string()),
    familyName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async ({ db }, { tokenIdentifier, givenName, familyName, imageUrl }) => {
    const user = await db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    // If user exists, return it
    if (user) {
      // Optional: You could update a `lastLoginAt` field here
      return user;
    }

    // If user doesn't exist, create one and return it
    const newUserId = await db.insert("users", {
      tokenIdentifier: tokenIdentifier,
      firstName: givenName ?? "",
      lastName: familyName ?? "",
      imageUrl: imageUrl,
    });
    return await db.get(newUserId);
  },
});
