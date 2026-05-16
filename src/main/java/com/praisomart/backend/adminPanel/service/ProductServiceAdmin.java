package com.praisomart.backend.adminPanel.service;

import com.praisomart.backend.adminPanel.dto.ProductImageDTO;
import com.praisomart.backend.adminPanel.dto.ProductRequestDTO;
import com.praisomart.backend.adminPanel.dto.ProductVariantDTO;
import com.praisomart.backend.adminPanel.dto.ProductAdminResponseDTO;
import com.praisomart.backend.exception.BadRequestException;
import com.praisomart.backend.exception.ResourceNotFoundException;
import com.praisomart.backend.products.entity.Category;
import com.praisomart.backend.products.entity.Product;
import com.praisomart.backend.products.entity.ProductImage;
import com.praisomart.backend.products.entity.ProductVariant;
import com.praisomart.backend.products.repository.CategoryRepository;
import com.praisomart.backend.products.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class ProductServiceAdmin {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductServiceAdmin(ProductRepository productRepository,
                               CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public Long createProduct(ProductRequestDTO request) {

        // 1. Basic Validation
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Product name is required");
        }

        if (request.getCategoryId() == null) {
            throw new BadRequestException("Category is required");
        }

        if (request.getVariants() == null || request.getVariants().isEmpty()) {
            throw new BadRequestException("At least one variant is required");
        }

        // 2. Fetch Category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // 3. Create Product
        Product product = new Product();
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setColor(request.getColor());
        product.setCategory(category);
        product.setActive(true);

        //  4. Map Variants
        Set<ProductVariant> variants = new HashSet<>();

        for (ProductVariantDTO v : request.getVariants()) {

            if (v.getPrice() == null) {
                throw new BadRequestException("Variant price is required");
            }

            ProductVariant variant = new ProductVariant();

            // ATTRIBUTE
            String attribute = (v.getAttribute() == null || v.getAttribute().isBlank())
                    ? "DEFAULT"
                    : v.getAttribute().trim();

            variant.setAttribute(attribute);

            variant.setPrice(v.getPrice());
            variant.setStock(v.getStock() != null ? v.getStock() : 0);
            variant.setColor(v.getColor() != null ? v.getColor().trim() : null);
            variant.setIsActive(true);

            // SKU GENERATION
            String baseName = request.getName().toUpperCase().replaceAll(" ", "-");
            String colorCode = v.getColor() != null ? v.getColor().toUpperCase() : "NA";

            String generatedSku = baseName + "-" + colorCode + "-" + attribute.toUpperCase()
                    + "-" + System.currentTimeMillis();

            variant.setSku(generatedSku);

            variant.setProduct(product);

            variants.add(variant);
        }

        // 5. Map Images
        Set<ProductImage> images = new HashSet<>();

        if (request.getImages() != null) {

            boolean hasPrimary = false;

            for (ProductImageDTO i : request.getImages()) {

                if (i.getImageUrl() == null || i.getImageUrl().isBlank()) {
                    continue;
                }

                ProductImage image = new ProductImage();
                image.setImageUrl(i.getImageUrl().trim());
                image.setColor(i.getColor() != null ? i.getColor().trim() : null);
                image.setPrimary(i.getIsPrimary() != null && i.getIsPrimary());
                image.setDisplayOrder(i.getDisplayOrder() != null ? i.getDisplayOrder() : 0);

                if (Boolean.TRUE.equals(i.getIsPrimary())) {
                    hasPrimary = true;
                }

                image.setProduct(product); // IMPORTANT

                images.add(image);
            }

            // Ensure at least one primary image
            if (!images.isEmpty() && !hasPrimary) {
                images.iterator().next().setPrimary(true);
            }
        }

        product.setVariants(variants);
        product.setImages(images);

        // 6. Save
        Product saved = productRepository.save(product);

        return saved.getId();
    }

    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        product.setActive(false);

        productRepository.save(product);
    }

    public ProductAdminResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductAdminResponseDTO response = new ProductAdminResponseDTO();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setColor(product.getColor());
        response.setCategoryId(product.getCategory().getId());

        response.setVariants(product.getVariants().stream().map(v -> {
            ProductVariantDTO dto = new ProductVariantDTO();
            dto.setAttribute(v.getAttribute());
            dto.setPrice(v.getPrice());
            dto.setStock(v.getStock());
            dto.setColor(v.getColor());
            return dto;
        }).toList());

        response.setImages(product.getImages().stream().map(i -> {
            ProductImageDTO dto = new ProductImageDTO();
            dto.setImageUrl(i.getImageUrl());
            dto.setIsPrimary(i.getPrimary());
            dto.setDisplayOrder(i.getDisplayOrder());
            dto.setColor(i.getColor());
            return dto;
        }).toList());

        return response;
    }

    public void updateProduct(Long id, ProductRequestDTO request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setColor(request.getColor());
        product.setCategory(category);

        // Update Variants (for simplicity, we replace them or update existing ones)
        // In a real app, you'd match by ID, but here we'll clear and add new ones if provided
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            product.getVariants().clear();
            for (ProductVariantDTO v : request.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setAttribute(v.getAttribute() != null ? v.getAttribute().trim() : "DEFAULT");
                variant.setPrice(v.getPrice());
                variant.setStock(v.getStock() != null ? v.getStock() : 0);
                variant.setColor(v.getColor() != null ? v.getColor().trim() : null);
                variant.setProduct(product);
                variant.setIsActive(true);
                // SKU update logic could go here
                product.getVariants().add(variant);
            }
        }

        // Update Images (specifically for Cover Image)
        if (request.getImages() != null) {
            product.getImages().clear();
            boolean hasPrimary = false;
            for (ProductImageDTO i : request.getImages()) {
                if (i.getImageUrl() == null || i.getImageUrl().isBlank()) continue;
                ProductImage image = new ProductImage();
                image.setImageUrl(i.getImageUrl().trim());
                image.setColor(i.getColor() != null ? i.getColor().trim() : null);
                image.setPrimary(i.getIsPrimary() != null && i.getIsPrimary());
                image.setProduct(product);
                if (Boolean.TRUE.equals(i.getIsPrimary())) hasPrimary = true;
                product.getImages().add(image);
            }
            if (!product.getImages().isEmpty() && !hasPrimary) {
                product.getImages().iterator().next().setPrimary(true);
            }
        }

        productRepository.save(product);
    }
}