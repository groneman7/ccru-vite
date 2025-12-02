import { trpc } from "~client/lib/trpc";
import { formatPhoneNumber } from "~client/utils";
import { WorkspaceContent, WorkspaceHeader } from "~client/components";
import { Tabs, TabsList, TabsTrigger } from "~client/components/ui";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatchRoute,
} from "@tanstack/react-router";
import { Mail, Phone, UserRound } from "lucide-react";

export const Route = createFileRoute("/_app/admin/users/$userId")({
  component: RouteComponent,
});

function RouteComponent() {
  const userId = Number(Route.useParams().userId);
  const matchRoute = useMatchRoute();
  const isProfileActive = matchRoute({ to: "/admin/users/$userId/profile" });
  const isHistoryActive = matchRoute({ to: "/admin/users/$userId/history" });
  // const isAccountActive = matchRoute({ to: "/admin/users/$userId/account" });

  const { data: userSummary } = useQuery(
    trpc.users.getUserSummary.queryOptions({
      userId,
      attributeKeysToSelect: ["USER ROLE", "ACCOUNT TYPE"],
    }),
  );

  if (!userSummary) return null;
  return (
    <>
      <WorkspaceHeader>Admin / Users</WorkspaceHeader>
      <WorkspaceContent orientation="horizontal">
        {/* User storyboard */}
        <div className="flex w-96 flex-col gap-6">
          {/* Photo and name */}
          <div className="flex items-center justify-start gap-4 border-b px-2 pb-6">
            {/* Photo */}
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-6 border-blue-900">
              <UserRound className="h-full w-full bg-blue-500/44 stroke-white p-2" />
            </div>
            {/* Name */}
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">
                {userSummary.nameFirst}
                {userSummary.nameMiddle && ` ${userSummary.nameMiddle}`}
              </span>
              <span className="text-2xl font-bold">{userSummary.nameLast}</span>
            </div>
          </div>
          {/* Attributes */}
          <div className="flex flex-col items-start gap-2">
            <span className="text-lg">
              {userSummary.attributes["USER ROLE"]?.valueDisplay}
            </span>
            <div className="flex flex-wrap gap-1">
              <span className="rounded bg-slate-100 px-1">
                {userSummary.attributes["ACCOUNT TYPE"]?.valueDisplay}
              </span>
            </div>
          </div>
          {/* User info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Phone className="size-4" />
              <span>
                {userSummary.phoneNumber
                  ? // TODO: Hard-coded country code
                    formatPhoneNumber("+1", userSummary.phoneNumber)
                  : "No phone number"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4" />
              <span>{userSummary.email ?? "No email"}</span>
            </div>
          </div>
          {/* Test info */}
          <div className="flex flex-col gap-1">
            <span>Member since 2023</span>
            <span>Hours served: 400</span>
          </div>
        </div>
        {/* Main content */}
        <div className="flex flex-1 flex-col gap-1">
          <Tabs defaultValue={isProfileActive ? "profile" : "history"}>
            <TabsList>
              <TabsTrigger value="profile">
                <Link
                  to="/admin/users/$userId/profile"
                  params={{ userId: userId.toString() }}
                >
                  Profile
                </Link>
              </TabsTrigger>
              <TabsTrigger value="history">
                <Link
                  to="/admin/users/$userId/history"
                  params={{ userId: userId.toString() }}
                >
                  History
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Outlet />
        </div>
      </WorkspaceContent>
    </>
  );
}
