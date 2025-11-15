import { AppSidebar, Workspace } from "@/components";
import { SignIn } from "@/components/SignIn";
import { SignUp } from "@/components/SignUp";
import { Button, SidebarProvider } from "@/components/ui";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createRootRouteWithContext()({
  component: RootLayout,
  head: () => ({
    meta: [{ title: "CCRU" }],
  }),
});

function SignInForm() {
  const [showSignIn, setShowSignIn] = useState(true);
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col gap-2">
        {showSignIn ? <SignIn /> : <SignUp />}
        <Button variant="link" onClick={() => setShowSignIn(!showSignIn)}>
          {showSignIn ? "Sign up" : "Sign in"}
        </Button>
      </div>
    </div>
  );
}

function RootLayout() {
  const { data, isLoading } = useQuery(trpc.events.list.queryOptions());
  if (!isLoading) {
    console.log(data);
  }

  return (
    <>
      <HeadContent />
      {/* <AuthLoading>
        <div>Loading...</div>
      </AuthLoading> */}
      {/* <Authenticated>
        <div className="bg-blue-50">
          <SidebarProvider>
            <AppSidebar />
            <div className="my-2 mr-2 flex flex-1 flex-col rounded-lg border-2 border-blue-100 bg-white">
              <Workspace>
                <Outlet />
              </Workspace>
            </div>
          </SidebarProvider>
        </div>
      </Authenticated> */}
      <div className="bg-blue-50">
        <SidebarProvider>
          <AppSidebar />
          <div className="my-2 mr-2 flex flex-1 flex-col rounded-lg border-2 border-blue-100 bg-white">
            <Workspace>
              <Outlet />
            </Workspace>
          </div>
        </SidebarProvider>
      </div>
      {/* <Unauthenticated>
        <SignInForm />
      </Unauthenticated> */}
    </>
  );
}
