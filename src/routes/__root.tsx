import { useState } from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Button, SidebarProvider } from "@/src/components/ui";
import { AppSidebar, Workspace } from "@/src/components";
import { SignIn } from "@/src/components/SignIn";
import { SignUp } from "@/src/components/SignUp";
import { authClient } from "../lib/auth-client";

export const Route = createRootRouteWithContext()({
  beforeLoad: () => {
    const session = authClient.getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: RootLayout,
  head: () => ({
    meta: [{ title: "CCRU | Home" }],
  }),
});

function SignInForm() {
  const [showSignIn, setShowSignIn] = useState(true);
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="flex flex-col gap-2 w-full max-w-md">
        {showSignIn ? <SignIn /> : <SignUp />}
        <Button
          variant="link"
          onClick={() => setShowSignIn(!showSignIn)}>
          {showSignIn ? "Sign up" : "Sign in"}
        </Button>
      </div>
    </div>
  );
}

function RootLayout() {
  return (
    <>
      <HeadContent />
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
      <Authenticated>
        <div className="bg-blue-50">
          <SidebarProvider>
            <AppSidebar />
            <div className="flex-1 flex flex-col mr-2 my-2 rounded-lg bg-white border-2 border-blue-100">
              <Workspace>
                <Outlet />
              </Workspace>
            </div>
          </SidebarProvider>
        </div>
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}
