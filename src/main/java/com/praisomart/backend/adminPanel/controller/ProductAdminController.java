package com.praisomart.backend.adminPanel.controller;

import com.praisomart.backend.adminPanel.dto.ProductRequestDTO;
import com.praisomart.backend.adminPanel.service.ProductServiceAdmin;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
public class ProductAdminController {

    private final ProductServiceAdmin productServiceAdmin;

    public ProductAdminController(ProductServiceAdmin productServiceAdmin) {
        this.productServiceAdmin = productServiceAdmin;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createProduct(
            @Valid @RequestBody ProductRequestDTO request) {

        Long productId = productServiceAdmin.createProduct(request);

        return ResponseEntity.ok("Product created successfully with ID: " + productId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @org.springframework.web.bind.annotation.GetMapping("/{id}")
    public ResponseEntity<ProductRequestDTO> getProductById(@org.springframework.web.bind.annotation.PathVariable Long id) {
        return ResponseEntity.ok(productServiceAdmin.getProductById(id));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO request) {
        productServiceAdmin.updateProduct(id, request);
        return ResponseEntity.ok("Product updated successfully");
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@org.springframework.web.bind.annotation.PathVariable Long id) {
        productServiceAdmin.deleteProduct(id);
        return ResponseEntity.ok("Product archived successfully");
    }
}
