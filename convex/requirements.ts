import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// All groups for a position
export const getGroupsForPosition = query({
  args: { positionId: v.id("eventPositions") },
  handler: async ({ db }, { positionId }) => {
    return await db
      .query("requirementGroups")
      .withIndex("by_positionId", (q) => q.eq("positionId", positionId))
      .collect();
  },
});

export const getRequirementsByPosition = query({
  args: { positionId: v.id("eventPositions") },
  handler: async ({ db }, { positionId }) => {
    // 1) Groups for the position
    const groups = await db
      .query("requirementGroups")
      .withIndex("by_positionId", (q) => q.eq("positionId", positionId))
      .collect();

    // 2) Requirements per group (indexed)
    const groupsWithReqs = await Promise.all(
      groups.map(async (g) => {
        const reqs = await db
          .query("requirements")
          .withIndex("by_groupId", (q) => q.eq("groupId", g._id))
          .collect();

        // 3) Enrich each requirement with attribute key/value names
        const enrichedReqs = await Promise.all(
          reqs.map(async (r) => {
            const keyDoc = await db.get(r.attributeKeyId);

            return {
              ...r,
              attributeKeyName: keyDoc?.name ?? "(unknown key)",
              attributeKeyLabel: keyDoc?.label ?? "(unknown label)",
            };
          })
        );

        return { ...g, requirements: enrichedReqs };
      })
    );

    return groupsWithReqs;
  },
});

// All requirements in a group
export const getForGroup = query({
  args: { groupId: v.id("requirementGroups") },
  handler: async ({ db }, { groupId }) => {
    return await db
      .query("requirements")
      .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
      .collect();
  },
});

// Create a new requirement group
export const createGroup = mutation({
  args: { positionId: v.id("eventPositions") },
  handler: async ({ db }, { positionId }) => {
    return await db.insert("requirementGroups", {
      positionId,
    });
  },
});

// Create a requirement inside a group
export const createRequirement = mutation({
  args: {
    groupId: v.id("requirementGroups"),
    attributeKeyId: v.id("attributeKeys"),
    allowedValueIds: v.array(v.id("attributeValues")),
  },
  handler: async ({ db }, { groupId, attributeKeyId, allowedValueIds }) => {
    // Basic validation
    if (allowedValueIds.length === 0) {
      throw new Error("At least one allowed value is required.");
    }

    return await db.insert("requirements", {
      groupId,
      attributeKeyId,
      allowedValueIds,
    });
  },
});
