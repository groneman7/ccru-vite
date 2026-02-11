import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";
import type { CurrentUser } from "~/shared/types";

type CalendarEventSubject = "CalendarEvent";
type CalendarEventPermission = [
  "create" | "update" | "delete",
  CalendarEventSubject,
];

const NON_STANDARD_SYSTEM_ROLES = [
  "019c0720-810b-7202-8891-bc4103197f07", // Officer
  "019c0720-810c-78cc-b3f1-48e219ec1ee7", // Developer
  "019c0720-810c-7ec6-9c74-ba2a6c3c0379", // Admin
];

export function getUserPermissions(user: CurrentUser) {
  const {
    build,
    can: allow,
    cannot: forbid,
  } = new AbilityBuilder<MongoAbility<CalendarEventPermission>>(
    createMongoAbility,
  );

  if (user) {
    // TODO: Temporary type assertion here, may want to do something more robust in the future
    if (NON_STANDARD_SYSTEM_ROLES.includes(user.systemRoleId!)) {
      allow("update", "CalendarEvent");
    }
  }

  return build();
}
