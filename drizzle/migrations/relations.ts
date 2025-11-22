import { relations } from "drizzle-orm/relations";
import { userInBetterAuth, sessionInBetterAuth, events, eventShifts, eventPositions, eventShiftSlots, users, accountInBetterAuth, statusCodeUsers } from "./schema";

export const sessionInBetterAuthRelations = relations(sessionInBetterAuth, ({one}) => ({
	userInBetterAuth: one(userInBetterAuth, {
		fields: [sessionInBetterAuth.userId],
		references: [userInBetterAuth.id]
	}),
}));

export const userInBetterAuthRelations = relations(userInBetterAuth, ({many}) => ({
	sessionInBetterAuths: many(sessionInBetterAuth),
	accountInBetterAuths: many(accountInBetterAuth),
	users: many(users),
}));

export const eventShiftsRelations = relations(eventShifts, ({one, many}) => ({
	event: one(events, {
		fields: [eventShifts.eventId],
		references: [events.id]
	}),
	eventPosition: one(eventPositions, {
		fields: [eventShifts.positionId],
		references: [eventPositions.id]
	}),
	eventShiftSlots: many(eventShiftSlots),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventShifts: many(eventShifts),
	user: one(users, {
		fields: [events.createdBy],
		references: [users.id]
	}),
}));

export const eventPositionsRelations = relations(eventPositions, ({many}) => ({
	eventShifts: many(eventShifts),
}));

export const eventShiftSlotsRelations = relations(eventShiftSlots, ({one}) => ({
	eventShift: one(eventShifts, {
		fields: [eventShiftSlots.shiftId],
		references: [eventShifts.id]
	}),
	user: one(users, {
		fields: [eventShiftSlots.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	eventShiftSlots: many(eventShiftSlots),
	events: many(events),
	userInBetterAuth: one(userInBetterAuth, {
		fields: [users.betterAuthId],
		references: [userInBetterAuth.id]
	}),
	statusCodeUser: one(statusCodeUsers, {
		fields: [users.status],
		references: [statusCodeUsers.id]
	}),
}));

export const accountInBetterAuthRelations = relations(accountInBetterAuth, ({one}) => ({
	userInBetterAuth: one(userInBetterAuth, {
		fields: [accountInBetterAuth.userId],
		references: [userInBetterAuth.id]
	}),
}));

export const statusCodeUsersRelations = relations(statusCodeUsers, ({many}) => ({
	users: many(users),
}));