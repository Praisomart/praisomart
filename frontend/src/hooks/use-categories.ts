import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Category {
  id: number;
  name: string;
  imageUrl?: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch("/categories"),
  });
};
