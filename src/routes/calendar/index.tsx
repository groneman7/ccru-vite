import { createFileRoute, redirect } from "@tanstack/react-router";
import dayjs from "dayjs";

export const Route = createFileRoute("/calendar/")({
  beforeLoad: () => {
    const now = dayjs();
    const year = now.year().toString();
    const month = (now.month() + 1).toString();

    throw redirect({
      to: "/calendar/$year/$month",
      params: { year: year, month: month },
      replace: true,
    });
  },
  component: () => null,

  head: () => ({
    meta: [{ title: "CCRU | Calendar" }],
  }),
});
