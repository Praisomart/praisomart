package com.praisomart.backend.adminPanel.controller;

import com.praisomart.backend.adminPanel.service.AdminDashboardService;
import com.praisomart.backend.orders.entity.Order;
import com.praisomart.backend.orders.repository.OrderRepository;
import com.praisomart.backend.wishlist.entity.WishlistEntity;
import com.praisomart.backend.wishlist.repository.WishlistRepository;
import com.praisomart.backend.auth.entity.User;
import com.praisomart.backend.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasAnyAuthority('ADMIN', 'MINOR_ADMIN')")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService dashboardService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<Order>> getRecentOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phoneNumber", u.getPhoneNumber());
            map.put("role", u.getRole());
            map.put("createdAt", u.getCreatedAt());
            map.put("isVerified", u.getVerified());
            return map;
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{userId}/toggle-verify")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> toggleVerifyUser(@PathVariable Long userId) {
        // Prevent self-action (cannot block self)
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.praisomart.backend.auth.security.CustomerUserDetails) {
            com.praisomart.backend.auth.security.CustomerUserDetails principal = (com.praisomart.backend.auth.security.CustomerUserDetails) auth.getPrincipal();
            if (principal.getUserId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "For security reasons, you cannot block or unverify your own account."));
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.praisomart.backend.exception.ResourceNotFoundException("User not found"));
        user.setVerified(!user.getVerified());
        userRepository.save(user);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("isVerified", user.getVerified());
        return ResponseEntity.ok(res);
    }

    @PutMapping("/users/{userId}/change-role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> changeUserRole(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        // Prevent self-action (cannot self-demote)
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.praisomart.backend.auth.security.CustomerUserDetails) {
            com.praisomart.backend.auth.security.CustomerUserDetails principal = (com.praisomart.backend.auth.security.CustomerUserDetails) auth.getPrincipal();
            if (principal.getUserId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "For security reasons, you cannot change your own role or self-demote."));
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.praisomart.backend.exception.ResourceNotFoundException("User not found"));
        
        String newRole = body.get("role");
        if (newRole != null && (newRole.equals("ADMIN") || newRole.equals("USER") || newRole.equals("MINOR_ADMIN"))) {
            user.setRole(newRole);
            userRepository.save(user);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("role", user.getRole());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/wishlists")
    public ResponseEntity<List<Map<String, Object>>> getWishlists() {
        List<WishlistEntity> items = wishlistRepository.findAll();
        List<Map<String, Object>> response = items.stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("isActive", item.getIsActive());
            map.put("addedAt", item.getAddedAt());
            
            if (item.getUser() != null) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", item.getUser().getId());
                userMap.put("name", item.getUser().getName());
                userMap.put("email", item.getUser().getEmail());
                map.put("user", userMap);
            }
            
            if (item.getProduct() != null) {
                Map<String, Object> prodMap = new HashMap<>();
                prodMap.put("id", item.getProduct().getId());
                prodMap.put("name", item.getProduct().getName());
                
                String imgUrl = null;
                if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
                    imgUrl = item.getProduct().getImages().iterator().next().getImageUrl();
                }
                prodMap.put("image", imgUrl);
                map.put("product", prodMap);
            }
            return map;
        }).collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/orders/{orderId}/tracking")
    public ResponseEntity<Order> updateTracking(
            @PathVariable Long orderId,
            @RequestBody TrackingRequest request) {
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new com.praisomart.backend.exception.ResourceNotFoundException("Order not found"));
        
        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
        }
        if (request.getCourierService() != null) {
            order.setCourierService(request.getCourierService());
        }
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        order.setUpdatedAt(java.time.LocalDateTime.now());
        
        return ResponseEntity.ok(orderRepository.save(order));
    }

    public static class TrackingRequest {
        private String trackingNumber;
        private String courierService;
        private String status;

        public String getTrackingNumber() { return trackingNumber; }
        public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
        public String getCourierService() { return courierService; }
        public void setCourierService(String courierService) { this.courierService = courierService; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
