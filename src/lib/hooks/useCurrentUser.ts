import { useQuery } from "convex/react";
import { api } from "api";
import { authClient } from "@/src/lib/auth-client";

/**
 * A hook to easily fetch the current user's data from the `users` table.
 *
 * @returns The user object, or `null` if the user is not authenticated.
 * Returns `undefined` while the query is loading.
 */
export const useCurrentUser = () => {
  const { data } = authClient.useSession();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    // The query will be skipped if the user is not authenticated.
    data ? {} : "skip"
  );

  return currentUser;
};
