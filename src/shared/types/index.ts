import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~server/trpc";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type Template =
  RouterOutput["calendar"]["templates"]["listAllTemplates"][number];
