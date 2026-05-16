package com.praisomart.backend.adminPanel.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ProductImageDTO {

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    private Boolean isPrimary;

    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder;

    private String color;

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean primary) {
        isPrimary = primary;
    }
}