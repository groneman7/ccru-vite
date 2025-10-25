import { v } from "convex/values";
import { query } from "./_generated/server";

export const getAllPositions = query({
    args: {},
    handler: async (ctx) => {
        const positions = await ctx.db.query("eventPositions").collect();
        return positions;
    },
});

export const getPositionById = query({
    args: { id: v.id("eventPositions") },
    handler: async (ctx, args) => {
        const position = await ctx.db.get(args.id);
        return position;
    },
});
