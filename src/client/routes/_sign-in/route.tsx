import { cn } from "~client/utils";
import { createFileRoute, Outlet } from "@tanstack/react-router";

// import dayjs from "dayjs";

export const Route = createFileRoute("/_sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  // const time = dayjs().hour();
  // const isNight = time >= 19 || time <= 7;
  return (
    <div
      className={cn(
        "flex h-full flex-1 items-center justify-center",
        // isNight
        //   ? "bg-[url(src/assets/camping_vector_night.svg)]"
        //   : "bg-[url(src/assets/camping_vector.svg)]",
        "bg-cover bg-center bg-origin-border",
      )}
    >
      <Outlet />
    </div>
  );
}
