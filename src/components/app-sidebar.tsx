import { SignedOut } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Spinner,
} from "@/components/ui";
import { cn } from "@/components/utils";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/lib/hooks";
import { Link, useNavigate } from "@tanstack/react-router";
import { CircleUserRound, LoaderCircle } from "lucide-react";

export function AppSidebar() {
  const { data: user, isLoading: userIsLoading } = useUser();
  const { signOut } = authClient;
  const nav = useNavigate();

  if (userIsLoading)
    return (
      <Sidebar>
        <Sidebar>
          <SidebarHeader className="px-4 pt-4">
            <span
              className={cn(
                "cursor-pointer !font-(family-name:--temp-logo-font) text-2xl font-black select-none",
                "bg-clip-text text-transparent",
                "bg-linear-120 from-sky-600 to-teal-400",
              )}
              onClick={() => nav({ to: "/" })}
            >
              CCRU
            </span>
          </SidebarHeader>
        </Sidebar>
      </Sidebar>
    );

  if (user === null) {
    // Shouldn't happen, if this actually renders, we should probably fire something on Sentry
    return (
      <Sidebar>
        <SidebarHeader className="px-4 pt-4">
          <span
            className={cn(
              "cursor-pointer !font-(family-name:--temp-logo-font) text-2xl font-black select-none",
              "bg-clip-text text-transparent",
              "bg-linear-120 from-sky-600 to-teal-400",
            )}
            onClick={() => nav({ to: "/" })}
          >
            CCRU
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SignedOut />
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-4">
        <span
          className={cn(
            "cursor-pointer !font-(family-name:--temp-logo-font) text-2xl font-black select-none",
            "bg-clip-text text-transparent",
            "bg-linear-120 from-sky-600 to-teal-400",
          )}
          onClick={() => nav({ to: "/" })}
        >
          CCRU
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/ui">UI</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/calendar">Calendar</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/positions">Positions</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="flex h-12 items-center gap-2"
                  aria-label="Account menu"
                >
                  <div className="rounded-full bg-slate-50 p-0.5">
                    {/* {user?.imageUrl ? (
                      <img
                        src={currentUser?.imageUrl}
                        alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <CircleUserRound className="size-8 rounded-full bg-slate-50 text-slate-500" />
                    )} */}
                    <CircleUserRound className="size-8 rounded-full bg-slate-50 text-slate-500" />
                  </div>
                  <div className="flex flex-col justify-center text-left">
                    <span className="text-base leading-5 font-semibold">
                      {user?.nameFirst} {user?.nameLast}
                    </span>
                    {/* TODO: Hardcoded */}
                    <span className="text-xs text-slate-600">
                      Medical Student
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width]"
                align="start"
              >
                {/* <DropdownMenuItem onClick={() => openUserProfile()}>
                  Profile
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={() => {
                    signOut();
                    nav({ to: "/sign-in" });
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
