import { useEffect } from "react";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { SidebarProvider } from "@/src/components/ui";
import { AppSidebar } from "@/src/components/app-sidebar";

export const Route = createRootRouteWithContext()({
    component: RootLayout,
});

function UserSync() {
    const { user, isSignedIn } = useUser();
    const createUser = useMutation(api.users.createUser);

    useEffect(() => {
        if (isSignedIn && user.id) {
            createUser({
                clerkId: user.id,
            }).catch(() => {
                // User should already exist, ignore error
            });
        }
    }, [isSignedIn, user, createUser]);

    return null;
}

function SignInForm() {
    return (
        <div className="flex flex-col gap-8 w-96 mx-auto">
            <p>Log in to see the numbers</p>
            <SignInButton mode="modal">
                <button className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2">
                    Sign in
                </button>
            </SignInButton>
            <SignUpButton mode="modal">
                <button className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2">
                    Sign up
                </button>
            </SignUpButton>
        </div>
    );
}

function RootLayout() {
    return (
        <>
            <Authenticated>
                <UserSync />
                <div className="flex flex-col min-h-svh min-w-svw bg-blue-50">
                    <SidebarProvider>
                        <AppSidebar />
                        {/* <SidebarTrigger /> */}
                        <div className="flex-1 mr-2 my-2 rounded-lg bg-white border-2 border-blue-100">
                            <Outlet />
                        </div>
                    </SidebarProvider>
                    <Outlet />
                </div>
            </Authenticated>
            <Unauthenticated>
                <SignInForm />
            </Unauthenticated>
        </>
    );
}
