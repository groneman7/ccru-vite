import type {
  eventsInCalendar as events,
  positionsInCalendar as positions,
  junctionShiftsInCalendar as shifts,
  junctionSlotsInCalendar as slots,
  userInBetterAuth as users,
} from "./schema";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Event = typeof events.$inferSelect;
export type ShiftSchema = typeof shifts.$inferSelect;
export type SlotSchema = typeof slots.$inferSelect;
export type UserSchema = typeof users.$inferSelect;
type _UserSchemaForTable = typeof users.$inferSelect &
  Omit<typeof users.$inferSelect, "id">;
export type UserSchemaForTable = Prettify<_UserSchemaForTable>;

type _Slot = Pick<SlotSchema, "id"> & {
  user: Pick<UserSchema, "id" | "nameFirst" | "nameLast" | "displayName">;
};
export type Slot = Prettify<_Slot>;

type _Shift = ShiftSchema & { slots: _Slot[] };
export type Shift = Prettify<_Shift>;

export type Position = typeof positions.$inferSelect;
