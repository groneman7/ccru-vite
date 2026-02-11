import { IconClipboardListFilled } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/positions/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <IconClipboardListFilled className="size-24 text-gray-300" />
      <span className="text-xl text-gray-400 select-none">
        Select a position to edit.
      </span>
    </div>
  );
}
