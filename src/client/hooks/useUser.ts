import { useQuery } from "@tanstack/react-query";
import { trpc } from "~/client/lib/router";

export function useUser() {
  const response = useQuery(trpc.users.getCurrentUser.queryOptions());

  return {
    user: { ...response.data?.user, userType: response.data?.user_types },
    userIsLoading: response.isLoading,
    ...response,
  };
}
