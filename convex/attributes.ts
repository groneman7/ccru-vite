import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllAttributeKeys = query({
    args: {},
    handler: async (ctx) => {
        const attributeKeys = await ctx.db.query("attributeKeys").collect();
        return attributeKeys;
    },
});

export const getAllAttributeValues = query({
    args: {},
    handler: async (ctx) => {
        const attributeValues = await ctx.db.query("attributeValues").collect();
        return attributeValues;
    },
});

export const getAttributeValuesByKey = query({
    args: {
        keyId: v.optional(v.id("attributeKeys")),
    },
    handler: async (ctx, args) => {
        if (!args.keyId) return [];
        const attributeValues = await ctx.db
            .query("attributeValues")
            .filter((q) => q.eq(q.field("keyId"), args.keyId))
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
    handler: async (ctx, args) => {
        const trimmed = {
            name: args.name.trim(),
            label: args.label?.trim() || null,
        };

        if (trimmed.name.length === 0) {
            throw new Error("Name cannot be blank.");
        }

        const existing = await ctx.db
            .query("attributeValues")
            .withIndex("by_keyId_name", (q) => q.eq("keyId", args.keyId).eq("name", trimmed.name))
            .first();

        if (existing) {
            throw new Error(`An attribute value '${trimmed.name}' already exists for this key.`);
        }

        return await ctx.db.insert("attributeValues", {
            keyId: args.keyId,
            name: trimmed.name,
            label: args.label?.trim() || undefined,
        });
    },
});

export const deleteAttributeValue = mutation({
    args: {
        id: v.id("attributeValues"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
