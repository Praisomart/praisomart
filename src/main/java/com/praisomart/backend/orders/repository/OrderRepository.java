package com.praisomart.backend.orders.repository;

import com.praisomart.backend.orders.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'PAID' OR o.status = 'DELIVERED'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'PAID' OR o.status = 'PENDING'")
    long countActiveOrders();

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o JOIN o.items i WHERE o.user.id = :userId AND i.product.id = :productId AND (o.status = 'PAID' OR o.status = 'DELIVERED' OR o.status = 'SHIPPED' OR o.status = 'PENDING')")
    boolean hasPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    boolean existsByUserIdAndCouponCodeIgnoreCase(Long userId, String couponCode);
}
