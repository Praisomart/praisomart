import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Product } from "./use-products";

export const useProduct = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id) return null;
      return apiFetch(`/products/${id}`);
    },
    enabled: !!id,
  });
};
