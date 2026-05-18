import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export const useSuggestions = (productId: number | string | undefined) => {
  return useQuery({
    queryKey: ["suggestions", productId],
    queryFn: () => {
      if (!productId) return { content: [] };
      return apiFetch(`/products/${productId}/suggested`);
    },
    enabled: !!productId,
  });
};
