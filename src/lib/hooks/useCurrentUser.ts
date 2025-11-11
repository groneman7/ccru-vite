import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/src/lib/auth-client";

/**
 * A hook to easily fetch the current user's data from the `users` table.
 *
 * @returns The user object, or `null` if the user is not authenticated.
 * Returns `undefined` while the query is loading.
 */
export const useCurrentUser = () => {
  const session = authClient.useSession();
  const currentUser = useQuery(api.users.getCurrentUser, session.data ? {} : "skip");

  const isLoading = session.isPending || (session.data && currentUser === undefined);
  return { currentUser: currentUser ?? null, isLoading };
};
