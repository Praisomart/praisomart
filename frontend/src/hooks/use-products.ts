import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  mainImage?: string;
  rating?: number;
  categoryName?: string;
  tag?: string;
}

export const useProducts = (categoryId?: number | string) => {
  return useQuery({
    queryKey: ["products", categoryId],
    queryFn: () => {
      const query = categoryId ? `?categoryId=${categoryId}` : "";
      return apiFetch(`/products${query}`);
    },
  });
};
