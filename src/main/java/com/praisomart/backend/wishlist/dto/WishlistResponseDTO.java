package com.praisomart.backend.wishlist.dto;

import java.time.LocalDateTime;


public class WishlistResponseDTO {

    private Long wishlistId;
    private Long productId;
    private String productName;
    private Double price;
    private String imageUrl;
    private LocalDateTime addedAt;
    private boolean isActive;
    private Long defaultVariantId;

    public WishlistResponseDTO() {}

    public WishlistResponseDTO(Long wishlistId, Long productId,
                               String productName, Double price,
                               String imageUrl, LocalDateTime addedAt,
                               boolean isActive) {
        this.wishlistId = wishlistId;
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.imageUrl = imageUrl;
        this.addedAt = addedAt;
        this.isActive=isActive;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getWishlistId() {
        return wishlistId;
    }

    public void setWishlistId(Long wishlistId) {
        this.wishlistId = wishlistId;
    }

    public Long getDefaultVariantId() {
        return defaultVariantId;
    }

    public void setDefaultVariantId(Long defaultVariantId) {
        this.defaultVariantId = defaultVariantId;
    }
}