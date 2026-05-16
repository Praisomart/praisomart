import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export const useCart = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: () => apiFetch("/cart/my"),
    enabled: !!token,
  });

  const addToCart = useMutation({
    mutationFn: (data: { productVariantId: number, quantity: number }) => 
      apiFetch("/cart/addTOCart", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add to cart");
    }
  });

  const updateQuantity = useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: number, quantity: number }) => 
      apiFetch(`/cart/items/${cartItemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const removeFromCart = useMutation({
    mutationFn: (cartItemId: number) => 
      apiFetch(`/cart/items/${cartItemId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    }
  });

  return { ...query, addToCart, updateQuantity, removeFromCart };
};
