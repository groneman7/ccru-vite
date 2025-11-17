import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  const response = useQuery(trpc.users.getOrCreateUser.queryOptions());
  return {
    user: response.data,
    userIsLoading: response.isLoading,
    ...response,
  };
}
