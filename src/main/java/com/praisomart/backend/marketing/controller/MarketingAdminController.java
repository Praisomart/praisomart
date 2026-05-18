package com.praisomart.backend.marketing.controller;

import com.praisomart.backend.marketing.entity.Coupon;
import com.praisomart.backend.marketing.entity.PopOffer;
import com.praisomart.backend.marketing.repository.CouponRepository;
import com.praisomart.backend.marketing.repository.PopOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/marketing")
@PreAuthorize("hasAnyAuthority('ADMIN', 'MINOR_ADMIN')")
public class MarketingAdminController {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private PopOfferRepository popOfferRepository;

    // ================= COUPONS =================

    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    @PostMapping("/coupons")
    public ResponseEntity<Coupon> saveCoupon(@RequestBody Coupon coupon) {
        if (coupon.getCode() != null) {
            coupon.setCode(coupon.getCode().trim().toUpperCase());
        }
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @DeleteMapping("/coupons/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Coupon deleted successfully"));
    }

    // ================= POP OFFERS =================

    @GetMapping("/offers")
    public ResponseEntity<List<PopOffer>> getAllOffers() {
        return ResponseEntity.ok(popOfferRepository.findAll());
    }

    @PostMapping("/offers")
    public ResponseEntity<PopOffer> saveOffer(@RequestBody PopOffer offer) {
        return ResponseEntity.ok(popOfferRepository.save(offer));
    }

    @DeleteMapping("/offers/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteOffer(@PathVariable Long id) {
        popOfferRepository.deleteById(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Pop-up offer deleted successfully"));
    }
}
