import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~server/trpc";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type Position =
  RouterOutput["calendar"]["positions"]["listAllPositions"][number];

export type Template =
  RouterOutput["calendar"]["templates"]["listAllTemplates"][number];

export type UserForCombobox =
  RouterOutput["users"]["getUsersForCombobox"][number];
