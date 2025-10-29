import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
// import { getCurrentUser, requireAdmin } from "./auth";

// export const createUser = mutation({
//     args: {
//         clerkId: v.optional(v.string()),
//         firstName: v.string(),
//         lastName: v.string(),
//     },
//     handler: async (ctx, args) => {
//         // const existingUser = await ctx.db
//         //     .query("users")
//         //     // .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
//         //     .unique();

//         // if (existingUser) {
//         //     return existingUser._id;
//         // }

//         return await ctx.db.insert("users", {
//             ...args,
//         });
//     },
// });

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users;
    },
});
