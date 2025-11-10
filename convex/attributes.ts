import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllAttributeKeys = query({
  args: {},
  handler: async ({ db }) => {
    const attributeKeys = await db.query("attributeKeys").collect();
    return attributeKeys;
  },
});

export const getAllAttributeValues = query({
  args: {},
  handler: async ({ db }) => {
    const attributeValues = await db.query("attributeValues").collect();
    return attributeValues;
  },
});

export const getAttributeValuesByKey = query({
  args: {
    keyId: v.optional(v.id("attributeKeys")),
  },
  handler: async ({ db }, { keyId }) => {
    if (!keyId) return [];
    const attributeValues = await db
      .query("attributeValues")
      .filter((q) => q.eq(q.field("keyId"), keyId))
      .collect();
    return attributeValues;
  },
});

export const createAttributeValue = mutation({
  args: {
    keyId: v.id("attributeKeys"),
    name: v.string(),
    label: v.optional(v.string()),
  },
  handler: async ({ db }, { keyId, name, label }) => {
    const trimmed = {
      name: name.trim(),
      label: label?.trim() || null,
    };

    if (trimmed.name.length === 0) {
      throw new Error("Name cannot be blank.");
    }

    const existing = await db
      .query("attributeValues")
      .withIndex("by_keyId_name", (q) => q.eq("keyId", keyId).eq("name", trimmed.name))
      .first();

    if (existing) {
      throw new Error(`An attribute value '${trimmed.name}' already exists for this key.`);
    }

    return await db.insert("attributeValues", {
      keyId: keyId,
      name: trimmed.name,
      label: label?.trim() || undefined,
    });
  },
});

export const deleteAttributeValue = mutation({
  args: {
    id: v.id("attributeValues"),
  },
  handler: async ({ db }, { id }) => {
    await db.delete(id);
  },
});
