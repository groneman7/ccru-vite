import { useState } from "react";
import { createRootRouteWithContext, HeadContent, Outlet } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { SidebarProvider } from "@/src/components/ui";
import { AppSidebar, Workspace } from "@/src/components";
import { SignIn } from "@/src/components/SignIn";
import { SignUp } from "../components/SignUp";

export const Route = createRootRouteWithContext()({
  component: RootLayout,
  head: () => ({
    meta: [{ title: "CCRU | Home" }],
  }),
});

function SignInForm() {
  const [showSignIn, setShowSignIn] = useState(true);
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {showSignIn ? <SignIn /> : <SignUp />}
        <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          {showSignIn ? "Don&apos;t have an account? " : "Already have an account? "}
          <button
            onClick={() => setShowSignIn(!showSignIn)}
            className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline">
            {showSignIn ? "Sign up" : "Sign in"}
          </button>
        </p>
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
        <div className="flex flex-col min-h-svh min-w-svw bg-blue-50">
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
