import { useUser } from "~client/hooks";
import { authClient } from "~client/lib/auth-client";
import { trpc } from "~client/lib/trpc";
import { BetterAuthLoading, SignedOut, WorkspaceHeader } from "~client/components";
import { Button } from "~client/components/ui";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const Route = createFileRoute("/_app/")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) throw redirect({ to: "/sign-in" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user, userIsLoading } = useUser();
  const completeOnboarding = useMutation(
    trpc.users.completeOnboarding.mutationOptions(),
  );

  if (userIsLoading) {
    return <BetterAuthLoading />;
  }

  if (user === null) {
    return <SignedOut />;
  }

  const t1 = dayjs(user?.timestampFirstLogin);
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
        {`${getGreeting(timeSinceFirstLogin < 24)}, ${user?.nameFirst}.`}
      </WorkspaceHeader>
      {!user?.onBoardingCompleted && (
        <Button
          onClick={() => user && completeOnboarding.mutate({ userId: user.id })}
        >
          Mark onboarding complete
        </Button>
      )}
    </>
  );
}
