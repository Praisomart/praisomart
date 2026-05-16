package com.praisomart.backend.payment.controller;

import com.praisomart.backend.payment.dto.PaymentRequest;
import com.praisomart.backend.payment.service.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<String> createOrder(@RequestBody PaymentRequest request) {
        try {
            String order = paymentService.createOrder(
                    request.getAmount(),
                    request.getCurrency(),
                    request.getReceipt()
            );
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(order);
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
