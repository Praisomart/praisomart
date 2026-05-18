package com.praisomart.backend.marketing.repository;

import com.praisomart.backend.marketing.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCaseAndIsActiveTrue(String code);
    Optional<Coupon> findByCodeIgnoreCase(String code);
}
