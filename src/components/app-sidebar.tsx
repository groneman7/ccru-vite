import { Link, useNavigate } from "@tanstack/react-router";
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
} from "@/src/components/ui";
import { cn } from "@/src/components/utils";
import { CircleUserRound } from "lucide-react";
import { useClerk, useUser } from "@clerk/clerk-react";

export function AppSidebar() {
    const navigate = useNavigate();
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    if (!user) return null;

    const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "User";

    return (
        <Sidebar>
            <SidebarHeader className="px-4 pt-4">
                <span
                    className={cn(
                        "!font-(family-name:--temp-logo-font) text-2xl font-black select-none cursor-pointer",
                        "bg-clip-text text-transparent",
                        "bg-linear-120 from-sky-600 to-teal-400"
                    )}
                    onClick={() => navigate({ to: "/" })}>
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
                                    className="h-12 flex gap-2 items-center"
                                    aria-label="Account menu">
                                    <div className="bg-slate-50 p-0.5 rounded-full">
                                        {user.imageUrl ? (
                                            <img
                                                src={user.imageUrl}
                                                alt={name}
                                                className="size-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <CircleUserRound className="size-8 rounded-full text-slate-500 bg-slate-50" />
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center text-left">
                                        <span className="text-base font-semibold leading-5">{name}</span>
                                        <span className="text-xs text-slate-600">Medical Student</span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-dropdown-menu-trigger-width]"
                                align="start">
                                <DropdownMenuItem onClick={() => openUserProfile()}>Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
