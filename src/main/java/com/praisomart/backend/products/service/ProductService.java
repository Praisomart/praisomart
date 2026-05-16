package com.praisomart.backend.products.service;

import com.praisomart.backend.exception.BadRequestException;
import com.praisomart.backend.exception.ResourceNotFoundException;
import com.praisomart.backend.products.dto.*;
import com.praisomart.backend.products.entity.Product;
import com.praisomart.backend.products.entity.ProductImage;
import com.praisomart.backend.products.entity.ProductVariant;
import com.praisomart.backend.products.repository.ProductRepository;
import com.praisomart.backend.wishlist.repository.WishlistRepository;
import com.praisomart.backend.auth.entity.User;
import com.praisomart.backend.auth.repository.UserRepository;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository,
                          WishlistRepository wishlistRepository,
                          UserRepository userRepository) {

        this.productRepository = productRepository;
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
    }

    // ================= PRODUCT LIST =================
    public Page<ProductListResponse> getProducts(
            Long categoryId,
            String color,
            String size,
            String sort,
            int page,
            int sizePage
    ) {

        // ✅ sanitize inputs
        if (color != null) color = color.trim().toLowerCase();
        if (size != null) size = size.trim();

        Pageable pageable = PageRequest.of(page, sizePage);

        // ❌ REMOVED wishlist logic completely

        // ✅ fetch products
        Page<Product> pageResult = productRepository.findProductsWithFilters(
                categoryId,
                color,
                size,
                sort,
                pageable
        );

        // ✅ map response (NO STREAM)
        List<ProductListResponse> responseList = new ArrayList<>();

        for (Product p : pageResult.getContent()) {

            ProductListResponse dto = new ProductListResponse(
                    p.getId(),
                    p.getName(),
                    p.getColor(),
                    getPrimaryImage(p),
                    getMinPrice(p),
                    isInStock(p),
                    p.getCategory() != null ? p.getCategory().getName() : null
            );

            responseList.add(dto);
        }

        return new PageImpl<>(
                responseList,
                pageable,
                pageResult.getTotalElements()
        );
    }

    // ================= PRODUCT DETAIL =================
    public ProductDetailResponse getProductDetail(Long id) {

        Product p = productRepository.findProductDetail(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<String> availableColors = p.getVariants() == null ? List.of() :
                p.getVariants().stream()
                        .map(ProductVariant::getColor)
                        .filter(c -> c != null && !c.isBlank())
                        .distinct()
                        .toList();

        return new ProductDetailResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getColor(),
                getMinPrice(p),
                p.getCategory() == null ? "Uncategorized" : p.getCategory().getName(),
                availableColors,
                p.getImages() == null ? List.of() :
                        p.getImages().stream()
                                .map(img -> new ImageResponse(img.getImageUrl(), img.getColor(), img.getPrimary()))
                                .toList(),
                p.getVariants() == null ? List.of() :
                        p.getVariants().stream()
                                .map(v -> new VariantResponse(
                                        v.getId(),
                                        v.getAttribute(),
                                        v.getPrice().doubleValue(),
                                        v.getStock(),
                                        v.getColor()
                                ))
                                .toList()
        );
    }

    // ================= HELPERS =================
    private Double getMinPrice(Product p) {
        if (p.getVariants() == null || p.getVariants().isEmpty()) return 0.0;

        return p.getVariants().stream()
                .map(v -> v.getPrice().doubleValue())
                .min(Double::compareTo)
                .orElse(0.0);
    }

    private boolean isInStock(Product p) {
        if (p.getVariants() == null) return false;

        return p.getVariants().stream()
                .anyMatch(v -> v.getStock() > 0);
    }

    private String getPrimaryImage(Product p) {
        if (p.getImages() == null || p.getImages().isEmpty()) return null;

        return p.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getPrimary()))
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(
                        p.getImages().iterator().next().getImageUrl()
                );
    }

    public Page<ProductListResponse> searchProducts(
            String keyword,
            int page,
            int sizePage
    ) {

        if (keyword == null || keyword.isBlank()) {
            throw new BadRequestException(
                    "Keyword is required"
            );
        }

        keyword = keyword.trim().toLowerCase();

        Pageable pageable =
                PageRequest.of(page, sizePage);

        Page<Product> pageResult =
                productRepository.searchProducts(
                        keyword,
                        pageable
                );

        List<ProductListResponse> responseList =
                new ArrayList<>();

        for (Product p : pageResult.getContent()) {

            ProductListResponse dto =
                    new ProductListResponse(
                            p.getId(),
                            p.getName(),
                            p.getColor(),
                            getPrimaryImage(p),
                            getMinPrice(p),
                            isInStock(p),
                            p.getCategory() != null ? p.getCategory().getName() : null
                    );

            responseList.add(dto);
        }

        return new PageImpl<>(
                responseList,
                pageable,
                pageResult.getTotalElements()
        );
    }
}


//package com.praisomart.backend.products.service;
//
//import com.praisomart.backend.exception.ResourceNotFoundException;
//import com.praisomart.backend.products.dto.*;
//import com.praisomart.backend.products.entity.Product;
//import com.praisomart.backend.products.entity.ProductImage;
//import com.praisomart.backend.products.repository.ProductRepository;
//import com.praisomart.backend.wishlist.repository.WishlistRepository;
//import com.praisomart.backend.auth.entity.User;
//import com.praisomart.backend.auth.repository.UserRepository;
//
//import org.springframework.data.domain.*;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//public class ProductService {
//
//    private final ProductRepository productRepository;
//    private final WishlistRepository wishlistRepository;
//    private final UserRepository userRepository;
//
//    public ProductService(ProductRepository productRepository,
//                          WishlistRepository wishlistRepository,
//                          UserRepository userRepository) {
//
//        this.productRepository = productRepository;
//        this.wishlistRepository = wishlistRepository;
//        this.userRepository = userRepository;
//    }
//
//    // ================= PRODUCT LIST =================
//    public Page<ProductListResponse> getProducts(
//            Long categoryId,
//            String color,
//            String size,
//            String sort,
//            int page,
//            int sizePage,
//            Long userId   // ⭐ ADDED FOR WISHLIST
//    ) {
//
//        if (color != null) color = color.trim().toLowerCase();
//        if (size != null) size = size.trim();
//
//        Pageable pageable = PageRequest.of(page, sizePage);
//
//        User user = null;
//        if (userId != null) {
//            user = userRepository.findById(userId)
//                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//        }
//
//        User finalUser = user;
//
//        Page<Product> pageResult = productRepository.findProductsWithFilters(
//                categoryId,
//                color,
//                size,
//                sort,
//                pageable
//        );
//
//        List<ProductListResponse> responseList = pageResult.getContent()
//                .stream()
//                .map(p -> new ProductListResponse(
//                        p.getId(),
//                        p.getName(),
//                        p.getColor(),
//                        getPrimaryImage(p),
//                        getMinPrice(p),
//                        isInStock(p),
//                        isWishlisted(finalUser, p) // ⭐ IMPORTANT
//                ))
//                .toList();
//
//        return new PageImpl<>(
//                responseList,
//                pageable,
//                pageResult.getTotalElements()
//        );
//    }
//
//    // ================= PRODUCT DETAIL =================
//    public ProductDetailResponse getProductDetail(Long id) {
//
//        Product p = productRepository.findProductDetail(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
//
//        return new ProductDetailResponse(
//                p.getId(),
//                p.getName(),
//                p.getDescription(),
//                p.getColor(),
//                p.getImages().stream()
//                        .map(ProductImage::getImageUrl)
//                        .toList(),
//                p.getVariants().stream()
//                        .map(v -> new VariantResponse(
//                                v.getAttribute(),
//                                v.getPrice().doubleValue(),
//                                v.getStock()
//                        ))
//                        .toList()
//        );
//    }
//
//    // ================= WISHLIST CHECK =================
//    private boolean isWishlisted(User user, Product product) {
//
//        if (user == null) return false;
//
//        return wishlistRepository.existsByUserAndProduct(user, product);
//    }
//
//    // ================= HELPERS =================
//    private Double getMinPrice(Product p) {
//        return p.getVariants().stream()
//                .map(v -> v.getPrice().doubleValue())
//                .min(Double::compareTo)
//                .orElse(0.0);
//    }
//
//    private boolean isInStock(Product p) {
//        return p.getVariants().stream()
//                .anyMatch(v -> v.getStock() > 0);
//    }
//
//    private String getPrimaryImage(Product p) {
//        return p.getImages().stream()
//                .filter(img -> Boolean.TRUE.equals(img.getPrimary()))
//                .findFirst()
//                .map(ProductImage::getImageUrl)
//                .orElse(
//                        p.getImages().stream()
//                                .findFirst()
//                                .map(ProductImage::getImageUrl)
//                                .orElse(null)
//                );
//    }
//}