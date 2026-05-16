package com.praisomart.backend.products.dto;

import java.util.List;

public class ProductDetailResponse {

    private Long id;
    private String name;
    private String description;
    private String color;
    private List<String> images;
    private Double price;
    private String categoryName;
    private List<String> availableColors;
    private List<VariantResponse> variants;

    // ✅ Constructor (correct order)
    public ProductDetailResponse(Long id, String name, String description,
                                     String color, Double price, String categoryName, 
                                     List<String> availableColors, List<String> images,
                                 List<VariantResponse> variants) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.color = color;
        this.price = price;
        this.categoryName = categoryName;
        this.availableColors = availableColors;
        this.images = images;
        this.variants = variants;
    }

    // Getters & Setters
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public List<String> getAvailableColors() { return availableColors; }
    public void setAvailableColors(List<String> availableColors) { this.availableColors = availableColors; }

    // Getters & Setters
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public List<VariantResponse> getVariants() { return variants; }
    public void setVariants(List<VariantResponse> variants) { this.variants = variants; }
}