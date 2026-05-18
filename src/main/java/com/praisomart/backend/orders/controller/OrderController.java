package com.praisomart.backend.orders.controller;

import com.praisomart.backend.auth.entity.User;
import com.praisomart.backend.auth.repository.UserRepository;
import com.praisomart.backend.auth.security.CustomerUserDetails;
import com.praisomart.backend.cart.entity.Cart;
import com.praisomart.backend.cart.entity.CartItem;
import com.praisomart.backend.cart.repository.CartItemRepository;
import com.praisomart.backend.cart.repository.CartRepository;
import com.praisomart.backend.orders.entity.Order;
import com.praisomart.backend.orders.entity.OrderItem;
import com.praisomart.backend.orders.repository.OrderRepository;
import com.praisomart.backend.products.entity.ProductVariant;
import com.praisomart.backend.products.repository.ProductVariantRepository;
import com.praisomart.backend.exception.ResourceNotFoundException;
import com.praisomart.backend.exception.BadRequestException;
import com.praisomart.backend.marketing.entity.Coupon;
import com.praisomart.backend.marketing.repository.CouponRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CouponRepository couponRepository;

    @PostMapping("/place")
    @Transactional
    public ResponseEntity<Order> placeOrder(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @RequestBody OrderPlaceRequest request) {

        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }

        Long userId = userDetails.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Active cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartIdAndIsActiveTrue(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Calculate amount and deduct stock
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = new Order();
        order.setUser(user);
        order.setPaymentMode(request.getPaymentMode());
        
        if ("COD".equalsIgnoreCase(request.getPaymentMode())) {
            order.setStatus("PENDING");
        } else {
            order.setStatus("PAID");
            order.setRazorpayOrderId(request.getRazorpayOrderId());
            order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        }
        order.setCreatedAt(LocalDateTime.now());

        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();
            if (variant.getStock() < item.getQuantity()) {
                throw new BadRequestException("Not enough stock for: " + variant.getProduct().getName());
            }

            // Deduct stock
            variant.setStock(variant.getStock() - item.getQuantity());
            variantRepository.save(variant);

            // Create OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(variant.getProduct());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());
            orderItem.setAttribute(variant.getAttribute());
            orderItems.add(orderItem);

            totalAmount = totalAmount.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

            // Deactivate cart item
            item.setIsActive(false);
            cartItemRepository.save(item);
        }

        // Apply coupon discount if provided
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String cleanCode = request.getCouponCode().trim();
            
            Coupon coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(cleanCode)
                .orElseThrow(() -> new BadRequestException("Invalid or expired coupon code"));
            
            if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("This coupon code has expired!");
            }
            
            boolean alreadyUsed = orderRepository.existsByUserIdAndCouponCodeIgnoreCase(userId, coupon.getCode());
            if (alreadyUsed) {
                throw new BadRequestException("You have already used this coupon code. Limit: 1 per user.");
            }
            
            BigDecimal discount = totalAmount.multiply(BigDecimal.valueOf(coupon.getDiscountPercentage() / 100.0));
            totalAmount = totalAmount.subtract(discount);
            
            order.setCouponCode(coupon.getCode().toUpperCase());
            order.setDiscountAmount(discount);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);
        order.setUpdatedAt(LocalDateTime.now());

        // Save order (cascade will save items)
        Order savedOrder = orderRepository.save(order);

        // Deactivate cart as well
        cart.setIsActive(false);
        cartRepository.save(cart);

        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/validate-coupon")
    public ResponseEntity<?> validateCoupon(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @RequestParam String code) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Please sign in to apply coupon codes"));
        }
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Coupon code cannot be empty"));
        }
        String cleanCode = code.trim();
        
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(cleanCode).orElse(null);
        if (coupon == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid coupon code"));
        }
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "This coupon code has expired!"));
        }
        
        boolean alreadyUsed = orderRepository.existsByUserIdAndCouponCodeIgnoreCase(userDetails.getUserId(), coupon.getCode());
        if (alreadyUsed) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "You have already used this coupon code. Limit: 1 per user."));
        }
        return ResponseEntity.ok(java.util.Map.of(
            "code", coupon.getCode(),
            "discountPercentage", coupon.getDiscountPercentage(),
            "message", coupon.getDiscountPercentage() + "% discount applied successfully!"
        ));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal CustomerUserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        return ResponseEntity.ok(orderRepository.findByUserId(userDetails.getUserId()));
    }

    public static class OrderPlaceRequest {
        private String paymentMode; // "COD" or "ONLINE"
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String couponCode;

        public String getPaymentMode() { return paymentMode; }
        public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
    }
}
