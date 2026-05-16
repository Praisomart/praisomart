package com.praisomart.backend.products.dto;

public class ImageResponse {
    private String imageUrl;
    private String color;
    private Boolean isPrimary;

    public ImageResponse(String imageUrl, String color, Boolean isPrimary) {
        this.imageUrl = imageUrl;
        this.color = color;
        this.isPrimary = isPrimary;
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Boolean getPrimary() { return isPrimary; }
    public void setPrimary(Boolean primary) { isPrimary = primary; }
}
