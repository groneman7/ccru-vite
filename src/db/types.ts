import type {
  eventPositions,
  events,
  eventShifts,
  eventShiftSlots,
  users,
} from "./schema";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Event = typeof events.$inferSelect;
export type ShiftSchema = typeof eventShifts.$inferSelect;
export type SlotSchema = typeof eventShiftSlots.$inferSelect;
export type UserSchema = typeof users.$inferSelect;

type _Slot = Pick<SlotSchema, "id"> & {
  user: Pick<UserSchema, "id" | "nameFirst" | "nameLast">;
};
export type Slot = Prettify<_Slot>;

type _Shift = ShiftSchema & { slots: _Slot[] };
export type Shift = Prettify<_Shift>;

export type Position = typeof eventPositions.$inferSelect;
