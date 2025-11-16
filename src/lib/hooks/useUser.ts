import { trpc } from "@/lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useUser() {
  const { data } = useQuery(trpc.users.getOrCreateUser.queryOptions());
  return data;
}
