import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/trpc";

export type RouterOutput = inferRouterOutputs<AppRouter>;

export * from "./calendar";

export type UserForCombobox =
  RouterOutput["users"]["getUsersForCombobox"][number];

export type SystemRole = RouterOutput["authz"]["getAllSystemRoles"][number];
export type UserType = RouterOutput["authz"]["getAllUserTypes"][number];

export type CurrentUser = RouterOutput["users"]["getCurrentUser"];
