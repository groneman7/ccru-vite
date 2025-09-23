import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return null;
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

    return user;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
    const user = await getCurrentUser(ctx);
    if (!user) {
        throw new Error("Authentication required");
    }
    return user;
}

// export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
//     const user = await requireAuth(ctx);
//     if (user.role !== "admin") {
//         throw new Error("Admin access required");
//     }
//     return user;
// }
