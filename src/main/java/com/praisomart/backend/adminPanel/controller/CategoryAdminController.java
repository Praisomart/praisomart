package com.praisomart.backend.adminPanel.controller;

import com.praisomart.backend.adminPanel.dto.CategoryRequestDTO;
import com.praisomart.backend.adminPanel.service.CategoryServiceAdmin;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
public class CategoryAdminController {

    private final CategoryServiceAdmin categoryServiceAdmin;

    public CategoryAdminController(CategoryServiceAdmin categoryServiceAdmin) {
        this.categoryServiceAdmin = categoryServiceAdmin;
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MINOR_ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(categoryServiceAdmin.getAllCategories());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MINOR_ADMIN')")
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequestDTO request) {
        return ResponseEntity.ok(categoryServiceAdmin.createCategory(request));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        categoryServiceAdmin.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}
