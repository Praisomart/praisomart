package com.praisomart.backend.reviews.dto;

import java.time.LocalDateTime;

public class ReviewResponseDTO {
    private Long id;
    private String userName;
    private Integer rating;
    private String comment;
    private String imageUrl;
    private String adminReply;
    private LocalDateTime createdAt;

    public ReviewResponseDTO(Long id, String userName, Integer rating, String comment, String imageUrl, String adminReply, LocalDateTime createdAt) {
        this.id = id;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
        this.imageUrl = imageUrl;
        this.adminReply = adminReply;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getUserName() {
        return userName;
    }

    public Integer getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getAdminReply() {
        return adminReply;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
