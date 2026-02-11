import { relations } from "drizzle-orm/relations";
import { userInBetterAuth, eventsInCalendar, systemRolesInAuthz, userTypesInAuthz, junctionShiftsInCalendar, positionsInCalendar, junctionSlotsInCalendar } from "./schema";

export const eventsInCalendarRelations = relations(eventsInCalendar, ({one, many}) => ({
	userInBetterAuth: one(userInBetterAuth, {
		fields: [eventsInCalendar.createdBy],
		references: [userInBetterAuth.id]
	}),
	junctionShiftsInCalendars: many(junctionShiftsInCalendar),
}));

export const userInBetterAuthRelations = relations(userInBetterAuth, ({one, many}) => ({
	eventsInCalendars: many(eventsInCalendar),
	systemRolesInAuthz: one(systemRolesInAuthz, {
		fields: [userInBetterAuth.systemRoleId],
		references: [systemRolesInAuthz.id]
	}),
	userTypesInAuthz: one(userTypesInAuthz, {
		fields: [userInBetterAuth.userTypeId],
		references: [userTypesInAuthz.id]
	}),
	junctionSlotsInCalendars: many(junctionSlotsInCalendar),
}));

export const systemRolesInAuthzRelations = relations(systemRolesInAuthz, ({many}) => ({
	userInBetterAuths: many(userInBetterAuth),
}));

export const userTypesInAuthzRelations = relations(userTypesInAuthz, ({many}) => ({
	userInBetterAuths: many(userInBetterAuth),
}));

export const junctionShiftsInCalendarRelations = relations(junctionShiftsInCalendar, ({one, many}) => ({
	eventsInCalendar: one(eventsInCalendar, {
		fields: [junctionShiftsInCalendar.eventId],
		references: [eventsInCalendar.id]
	}),
	positionsInCalendar: one(positionsInCalendar, {
		fields: [junctionShiftsInCalendar.positionId],
		references: [positionsInCalendar.id]
	}),
	junctionSlotsInCalendars: many(junctionSlotsInCalendar),
}));

export const positionsInCalendarRelations = relations(positionsInCalendar, ({many}) => ({
	junctionShiftsInCalendars: many(junctionShiftsInCalendar),
}));

export const junctionSlotsInCalendarRelations = relations(junctionSlotsInCalendar, ({one}) => ({
	junctionShiftsInCalendar: one(junctionShiftsInCalendar, {
		fields: [junctionSlotsInCalendar.shiftId],
		references: [junctionShiftsInCalendar.id]
	}),
	userInBetterAuth: one(userInBetterAuth, {
		fields: [junctionSlotsInCalendar.userId],
		references: [userInBetterAuth.id]
	}),
}));