import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => apiFetch("/wishlist/my"),
    enabled: !!token,
  });

  const addToWishlist = useMutation({
    mutationFn: (productId: number) => 
      apiFetch(`/wishlist/add?productId=${productId}`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add to wishlist");
    }
  });

  const removeFromWishlist = useMutation({
    mutationFn: (productId: number) => 
      apiFetch(`/wishlist/remove?productId=${productId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    }
  });

  return { ...query, addToWishlist, removeFromWishlist };
};
