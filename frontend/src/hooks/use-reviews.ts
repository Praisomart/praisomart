import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  adminReply?: string;
  createdAt: string;
}

export const useReviews = (productId: number | string | undefined) => {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => {
      if (!productId) return [];
      return apiFetch(`/reviews/product/${productId}`);
    },
    enabled: !!productId,
  });

  const canReviewQuery = useQuery({
    queryKey: ["can-review", productId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token || !productId) return false;
      try {
        const res = await apiFetch(`/reviews/product/${productId}/can-review`);
        return !!res;
      } catch {
        return false;
      }
    },
    enabled: !!productId && !!localStorage.getItem("token"),
  });

  const addReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string; imageUrl?: string }) => {
      return apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(productId),
          ...data,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["can-review", productId] });
      toast.success("Review added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add review. Are you verified and have you purchased this product?");
    },
  });

  return {
    reviews: reviewsQuery.data || [],
    isLoading: reviewsQuery.isLoading,
    canReview: canReviewQuery.data ?? false,
    addReview: addReviewMutation,
  };
};
