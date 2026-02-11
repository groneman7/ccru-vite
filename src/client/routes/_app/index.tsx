import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  // BetterAuthLoading,
  SignedOut,
  WorkspaceHeader,
} from "~/client/components";
import { Button } from "~/client/components/ui";
import { trpc } from "~/client/lib/router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentUser } = Route.useRouteContext();

  const completeOnboarding = useMutation(
    trpc.users.completeOnboarding.mutationOptions(),
  );

  // if (userIsLoading) {
  //   return <BetterAuthLoading />;
  // }

  if (!currentUser) {
    return <SignedOut />;
  }

  const t1 = dayjs(currentUser.timestampFirstLogin);
  const t2 = dayjs();
  const timeSinceFirstLogin = t2.diff(t1, "hour");

  const getGreeting = (first24: boolean) => {
    const now = dayjs();
    if (now.hour() < 5) return first24 ? "Welcome" : "Welcome back";
    if (now.hour() >= 5 && now.hour() < 12) return "Good morning";
    if (now.hour() >= 12 && now.hour() < 17) return "Good afternoon";
    if (now.hour() >= 17) return "Good evening";
  };

  return (
    <>
      <WorkspaceHeader>
        {`${getGreeting(timeSinceFirstLogin < 24)}, ${currentUser.nameFirst ?? currentUser.displayName}.`}
      </WorkspaceHeader>
      {!currentUser.timestampOnboardingCompleted && (
        <Button
          onClick={() => completeOnboarding.mutate({ userId: currentUser.id })}
        >
          Mark onboarding complete
        </Button>
      )}
    </>
  );
}
