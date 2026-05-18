package com.praisomart.backend.reviews.service;

import com.praisomart.backend.auth.entity.User;
import com.praisomart.backend.auth.repository.UserRepository;
import com.praisomart.backend.exception.BadRequestException;
import com.praisomart.backend.exception.ResourceNotFoundException;
import com.praisomart.backend.orders.repository.OrderRepository;
import com.praisomart.backend.products.entity.Product;
import com.praisomart.backend.products.repository.ProductRepository;
import com.praisomart.backend.reviews.dto.ReviewRequestDTO;
import com.praisomart.backend.reviews.dto.ReviewResponseDTO;
import com.praisomart.backend.reviews.entity.Review;
import com.praisomart.backend.reviews.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public ReviewResponseDTO addReview(Long userId, ReviewRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Check if user purchased the product (the true gate for leaving a review)
        boolean purchased = orderRepository.hasPurchasedProduct(userId, request.getProductId());
        if (!purchased) {
            throw new BadRequestException("You can only review products you have purchased");
        }

        // 2. Prevent duplicate reviews for the same product
        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new BadRequestException("You have already submitted a review for this product");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setImageUrl(request.getImageUrl());

        Review saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Transactional
    public ReviewResponseDTO replyToReview(Long reviewId, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setAdminReply(reply);
        Review saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    public List<ReviewResponseDTO> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ReviewResponseDTO mapToResponse(Review review) {
        return new ReviewResponseDTO(
                review.getId(),
                review.getUser().getName(),
                review.getRating(),
                review.getComment(),
                review.getImageUrl(),
                review.getAdminReply(),
                review.getCreatedAt()
        );
    }

    public boolean canUserReview(Long userId, Long productId) {
        if (userRepository.findById(userId).isEmpty()) {
            return false;
        }
        // Can only review if: purchased AND not already reviewed
        boolean hasPurchased = orderRepository.hasPurchasedProduct(userId, productId);
        boolean alreadyReviewed = reviewRepository.existsByUserIdAndProductId(userId, productId);
        return hasPurchased && !alreadyReviewed;
    }
}
