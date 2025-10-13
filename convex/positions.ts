// import { v } from "convex/values";
import { query } from "./_generated/server";

export const getAllPositions = query({
    args: {},
    handler: async (ctx) => {
        const positions = await ctx.db.query("eventPositions").collect();
        return positions;
    },
});
