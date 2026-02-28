import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Campus } from "@/lib/types";

export function useCampus() {
  return useQuery<Campus>({
    queryKey: ["campus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campus")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as Campus;
    },
    staleTime: 5 * 60 * 1000,
  });
}
