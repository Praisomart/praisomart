package com.praisomart.backend.auth.service;

import com.praisomart.backend.auth.dto.*;
import com.praisomart.backend.auth.entity.*;
import com.praisomart.backend.auth.enums.*;
import com.praisomart.backend.auth.repository.*;
import com.praisomart.backend.auth.security.JwtUtil;
import com.praisomart.backend.exception.*;

import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final SmsService smsService;

    public AuthService(UserRepository userRepository,
                       OtpVerificationRepository otpRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       EmailService emailService,
                       SmsService smsService) {

        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.smsService = smsService;
    }

    // ---------------- OTP ----------------
    private String generateOtp() {
        return String.valueOf(100000 + new SecureRandom().nextInt(900000));
    }

    // ---------------- VALIDATION ----------------
    private OtpChannel detectChannel(String identifier) {

        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        String mobileRegex = "^[6-9][0-9]{9}$";

        if (identifier.matches(emailRegex)) return OtpChannel.EMAIL;
        if (identifier.matches(mobileRegex)) return OtpChannel.SMS;

        throw new BadRequestException("Invalid identifier");
    }

    public IdentifierResponseDTO checkUser(String identifier) {

        boolean exists = userRepository.findByEmail(identifier).isPresent()
                || userRepository.findByPhoneNumber(identifier).isPresent();

        return new IdentifierResponseDTO(exists, "OK");
    }

    // ---------------- SEND OTP ----------------
    @Transactional
    public SendOtpResponseDTO sendOtp(SendOtpRequestDTO request) {

        String identifier = request.getIdentifier();
        OtpPurpose purpose = request.getPurpose();

        OtpChannel channel = detectChannel(identifier);

        var lastOtp = otpRepository
                .findTopByIdentifierAndPurposeOrderByCreatedAtDesc(identifier, purpose);

        if (lastOtp.isPresent()) {

            if (lastOtp.get().getCreatedAt()
                    .plusSeconds(30)
                    .isAfter(LocalDateTime.now())) {
                throw new BadRequestException("Wait 30 seconds before retry");
            }

            if (lastOtp.get().getResendCount() >= 5) {
                throw new BadRequestException("Too many OTP requests");
            }
        }

        otpRepository.deleteByIdentifierAndPurpose(identifier, purpose);

        String otp = generateOtp();

        OtpVerification entity = new OtpVerification();
        entity.setIdentifier(identifier);
        entity.setOtpCode(passwordEncoder.encode(otp));
        entity.setChannel(channel);
        entity.setPurpose(purpose);
        entity.setResendCount(lastOtp.map(o -> o.getResendCount() + 1).orElse(1));

        otpRepository.save(entity);

        if (channel == OtpChannel.EMAIL) {
            emailService.sendOtpEmail(identifier, otp, purpose.name());
        } else {
            smsService.sendOtpSms(identifier, otp, purpose.name());
        }

        return new SendOtpResponseDTO("OTP sent successfully");
    }

    // ---------------- VERIFY OTP ----------------
    @Transactional
    public OtpVerifyResponseDTO verifyOtp(String identifier, String otp, OtpPurpose purpose) {

        OtpVerification entity =
                otpRepository.findTopByIdentifierAndPurposeOrderByCreatedAtDesc(identifier, purpose)
                        .orElseThrow(() -> new ResourceNotFoundException("OTP not found"));

        if (entity.getAttempts() >= 3) {
            throw new BadRequestException("Too many attempts");
        }

        if (entity.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP expired");
        }

        if (!passwordEncoder.matches(otp, entity.getOtpCode())) {
            entity.setAttempts(entity.getAttempts() + 1);
            otpRepository.save(entity);
            throw new BadRequestException("Invalid OTP");
        }

        entity.setVerified(true);
        otpRepository.save(entity);

        otpRepository.deleteByIdentifierAndPurpose(identifier, purpose);

        return new OtpVerifyResponseDTO("OTP verified");
    }

    // ---------------- REGISTER ----------------
    @Transactional
    public RegisterResponseDTO register(RegisterRequestDTO request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password mismatch");
        }

        try {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            userRepository.save(user);

        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Email or Phone already exists");
        }

        User savedUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found after save"));

        String token = jwtUtil.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getName(),
                List.of(savedUser.getRole())
        );

        return new RegisterResponseDTO(token, "Success", savedUser.getName(), savedUser.getRole());
    }

    // ---------------- LOGIN ----------------
    public LoginResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByPhoneNumber(request.getIdentifier()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getName(),
                List.of(user.getRole())
        );

        return new LoginResponseDTO(token, "Login Success", user.getName(), user.getRole());
    }
}