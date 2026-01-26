import { useQuery } from "@tanstack/react-query";
import { trpc } from "~client/lib/trpc";

export function useUser() {
  const response = useQuery(trpc.users.getCurrentUser.queryOptions());

  return {
    user: response.data,
    userIsLoading: response.isLoading,
    ...response,
  };
}
