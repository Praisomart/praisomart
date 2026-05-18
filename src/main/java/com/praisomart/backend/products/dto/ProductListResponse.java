package com.praisomart.backend.products.dto;


public class ProductListResponse {

    private Long id;
    private String name;
    private String color;
    private String image;
    private Double price;
    private Boolean inStock;
    private String categoryName;
    private Long defaultVariantId;


    // ✅ Constructor (correct order)
    public ProductListResponse(Long id, String name, String color,
                               String image, Double price, Boolean inStock, String categoryName) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.image = image;
        this.price = price;
        this.inStock = inStock;
        this.categoryName = categoryName;
    }

    public ProductListResponse() {
    }

    // Getters & Setters
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }

    public Long getDefaultVariantId() { return defaultVariantId; }
    public void setDefaultVariantId(Long defaultVariantId) { this.defaultVariantId = defaultVariantId; }
}
