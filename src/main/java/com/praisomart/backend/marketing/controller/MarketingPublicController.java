package com.praisomart.backend.marketing.controller;

import com.praisomart.backend.marketing.entity.PopOffer;
import com.praisomart.backend.marketing.repository.PopOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/marketing")
public class MarketingPublicController {

    @Autowired
    private PopOfferRepository popOfferRepository;

    @GetMapping("/offers/active")
    public ResponseEntity<List<PopOffer>> getActiveOffers() {
        LocalDateTime now = LocalDateTime.now();
        List<PopOffer> activeOffers = popOfferRepository.findByIsActiveTrue()
                .stream()
                .filter(o -> o.getExpiryDate() == null || o.getExpiryDate().isAfter(now))
                .collect(Collectors.toList());
        return ResponseEntity.ok(activeOffers);
    }
}
