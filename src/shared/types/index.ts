import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/trpc";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type Position =
  RouterOutput["calendar"]["positions"]["listAllPositions"][number];

export type Template =
  RouterOutput["calendar"]["templates"]["listAllTemplates"][number];

export type UserForCombobox =
  RouterOutput["users"]["getUsersForCombobox"][number];

export type SystemRole = RouterOutput["authz"]["getAllSystemRoles"][number];
export type UserType = RouterOutput["authz"]["getAllUserTypes"][number];

export type CalendarEvent = RouterOutput["calendar"]["events"]["getEvent"];

export type CurrentUser = RouterOutput["users"]["getCurrentUser"];
