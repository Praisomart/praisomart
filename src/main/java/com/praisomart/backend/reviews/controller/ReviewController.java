package com.praisomart.backend.reviews.controller;

import com.praisomart.backend.auth.security.CustomerUserDetails;
import com.praisomart.backend.reviews.dto.ReviewRequestDTO;
import com.praisomart.backend.reviews.dto.ReviewResponseDTO;
import com.praisomart.backend.reviews.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.praisomart.backend.reviews.dto.ReviewReplyRequestDTO;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> addReview(
            @AuthenticationPrincipal CustomerUserDetails user,
            @Valid @RequestBody ReviewRequestDTO request) {

        return ResponseEntity.ok(reviewService.addReview(user.getUserId(), request));
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ReviewResponseDTO> replyToReview(
            @AuthenticationPrincipal CustomerUserDetails user,
            @PathVariable Long reviewId,
            @RequestBody ReviewReplyRequestDTO request) {

        if (user == null || !user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"))) {
            throw new com.praisomart.backend.exception.UnauthorizedException("Only admin can reply to reviews");
        }

        return ResponseEntity.ok(reviewService.replyToReview(reviewId, request.getReply()));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDTO>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/product/{productId}/can-review")
    public ResponseEntity<Boolean> canUserReview(
            @AuthenticationPrincipal CustomerUserDetails user,
            @PathVariable Long productId) {
        if (user == null) {
            return ResponseEntity.ok(false);
        }
        return ResponseEntity.ok(reviewService.canUserReview(user.getUserId(), productId));
    }
}
