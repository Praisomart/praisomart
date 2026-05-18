package com.praisomart.backend.products.controller;

import com.praisomart.backend.auth.security.CustomerUserDetails;
import com.praisomart.backend.products.dto.*;
import com.praisomart.backend.products.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService){
        this.productService = productService;
    }

    // ================= LIST =================
    @GetMapping
    public ResponseEntity<Page<ProductListResponse>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String size,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int sizePage
    ) {

        return ResponseEntity.ok(
                productService.getProducts(
                        categoryId,
                        color,
                        size,
                        sort,
                        page,
                        sizePage
                )
        );
    }

    // ================= DETAIL =================
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProductDetail(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductListResponse>>
    searchProducts(

            @RequestParam String keyword,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return ResponseEntity.ok(
                productService.searchProducts(
                        keyword,
                        page,
                        size
                )
        );
    }

    @GetMapping("/{id}/suggested")
    public ResponseEntity<Page<ProductListResponse>> getSuggestedProducts(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getSuggestedProducts(id));
    }
}