import { queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAccess, getPlans } from "./billing.functions";
export const plansQuery = queryOptions({ queryKey: ["premium-plans"], queryFn: () => getPlans(), staleTime: 300_000 });
export function useAccess(userId: string) {
  const fn = useServerFn(getAccess);
  return useQuery({ queryKey: ["access", userId], queryFn: () => fn() });
}
