import { v } from "convex/values";
import { query } from "./_generated/server";

export const getAllPositions = query({
  args: {},
  handler: async ({ db }) => {
    const positions = await db.query("eventPositions").collect();
    return positions;
  },
});

export const getPositionById = query({
  args: { id: v.id("eventPositions") },
  handler: async ({ db }, args) => {
    const position = await db.get(args.id);
    return position;
  },
});
