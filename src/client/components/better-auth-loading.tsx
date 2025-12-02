import { BetterAuthLogo } from "~client/components";
import { LoaderCircle } from "lucide-react";

export function BetterAuthLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoaderCircle className="size-16 animate-spin" />
      <div className="-mb-3 flex w-96 flex-col">
        <span className="-mb-6 ml-9">Secured by</span>
        <BetterAuthLogo />
      </div>
    </div>
  );
}
