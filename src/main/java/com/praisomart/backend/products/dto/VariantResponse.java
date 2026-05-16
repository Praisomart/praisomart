package com.praisomart.backend.products.dto;

public class VariantResponse {

    private Long id;
    private String attribute;
    private Double price;
    private Integer stock;
    private String color;

    // ✅ Constructor (correct order)
    public VariantResponse(Long id, String attribute, Double price, Integer stock, String color) {
        this.id = id;
        this.attribute = attribute;
        this.price = price;
        this.stock = stock;
        this.color = color;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSize() { return attribute; }
    public void setSize(String size) { this.attribute = attribute; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}