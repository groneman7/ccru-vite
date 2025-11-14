import { relations } from "drizzle-orm/relations";
import { users, userAttributes, attributeValues, attributeKeys } from "./schema";

export const userAttributesRelations = relations(userAttributes, ({one}) => ({
	user: one(users, {
		fields: [userAttributes.userClerkId],
		references: [users.clerkId]
	}),
	attributeValue: one(attributeValues, {
		fields: [userAttributes.valueId],
		references: [attributeValues.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userAttributes: many(userAttributes),
}));

export const attributeValuesRelations = relations(attributeValues, ({one, many}) => ({
	userAttributes: many(userAttributes),
	attributeKey: one(attributeKeys, {
		fields: [attributeValues.keyId],
		references: [attributeKeys.id]
	}),
}));

export const attributeKeysRelations = relations(attributeKeys, ({many}) => ({
	attributeValues: many(attributeValues),
}));