import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users
  users: defineTable({
    tokenIdentifier: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_firstName", ["firstName"])
    .index("by_lastName", ["lastName"]),

  // Attribute Keys
  attributeKeys: defineTable({
    description: v.optional(v.string()),
    label: v.optional(v.string()),
    name: v.string(),
  }),

  // Attribute Values
  attributeValues: defineTable({
    description: v.optional(v.string()),
    keyId: v.id("attributeKeys"),
    label: v.optional(v.string()),
    name: v.string(),
  }).index("by_keyId_name", ["keyId", "name"]),

  // User Attributes
  userAttributes: defineTable({
    userId: v.id("users"),
    valueId: v.id("attributeValues"),
  }),

  // Events
  events: defineTable({
    createdBy: v.id("users"),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    name: v.string(),
    timeStart: v.string(),
    timeEnd: v.optional(v.string()),
  }).index("by_start", ["timeStart"]),

  // Event Shifts
  eventShifts: defineTable({
    eventId: v.id("events"),
    positionId: v.id("eventPositions"),
    slots: v.array(v.id("users")),
    quantity: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_slots", ["slots"]),

  // Event Templates
  eventTemplates: defineTable({
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    name: v.string(),
    positions: v.array(
      v.object({
        positionId: v.id("eventPositions"),
        quantity: v.number(),
      })
    ),
    timeStart: v.optional(v.string()),
    timeEnd: v.optional(v.string()),
  }),

  // Event Positions
  eventPositions: defineTable({
    description: v.optional(v.string()),
    label: v.optional(v.string()),
    name: v.string(),
  }),

  // Requirement Groups ('AND' blocks for position requirements)
  requirementGroups: defineTable({
    positionId: v.id("eventPositions"), // linked position
  }).index("by_positionId", ["positionId"]),

  // Requirements ('OR' blocks within a requirement group)
  requirements: defineTable({
    groupId: v.id("requirementGroups"),
    attributeKeyId: v.id("attributeKeys"),
    allowedValueIds: v.array(v.id("attributeValues")),
  }).index("by_groupId", ["groupId"]),
});
