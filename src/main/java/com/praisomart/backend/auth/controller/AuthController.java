package com.praisomart.backend.auth.controller;

import com.praisomart.backend.auth.dto.*;
import com.praisomart.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private AuthService authService;

    public AuthController(AuthService authService){
         this.authService=authService;
    }

    @PostMapping("/check-user")
    public ResponseEntity<IdentifierResponseDTO> checkUser(
            @RequestBody IdentifierRequestDTO request) {
        return ResponseEntity.ok(authService.checkUser(request.getIdentifier()));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<SendOtpResponseDTO> sendOtp(
            @RequestBody SendOtpRequestDTO request) {
        return ResponseEntity.ok(authService.sendOtp(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<OtpVerifyResponseDTO> verifyOtp(
            @RequestBody OtpVerifyRequestDTO request) {

        return ResponseEntity.ok(
                authService.verifyOtp(
                        request.getIdentifier(),
                        request.getOtp(),
                        request.getPurpose()
                )
        );
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(
            @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }
}