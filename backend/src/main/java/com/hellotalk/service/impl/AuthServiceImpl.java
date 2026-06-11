package com.hellotalk.service.impl;

import com.hellotalk.dto.request.*;
import com.hellotalk.dto.response.ApiResponse;
import com.hellotalk.dto.response.AuthResponse;
import com.hellotalk.dto.response.UserResponse;
import com.hellotalk.entity.Otp;
import com.hellotalk.entity.User;
import com.hellotalk.exception.AppException;
import com.hellotalk.repository.UserRepository;
import com.hellotalk.security.JwtUtils;
import com.hellotalk.service.AuthService;
import com.hellotalk.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public ApiResponse<String> signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email '" + request.getEmail() + "' is already registered");
        }

        // Save user as unverified
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername().toLowerCase().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .isVerified(false)
                .build();

        userRepository.save(user);

        // Send OTP
        otpService.sendOtp(request.getEmail());

        return ApiResponse.success("OTP sent to " + request.getEmail() + ". Please verify your account.");
    }

    @Override
    @Transactional
    public ApiResponse<String> verifyOtp(OtpVerifyRequest request) {

        boolean valid = otpService.verifyOtp(
                request.getEmail(),
                request.getCode());

        if (!valid) {
            throw new AppException("Invalid or expired OTP code");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User not found"));

        user.setIsVerified(true);
        userRepository.save(user);

        return ApiResponse.success(
                "Account verified successfully! You can now log in.");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException("User not found"));

        if (!user.getIsVerified()) {
            throw new AppException("Please verify your email before logging in");
        }

        // Update status to ONLINE
        user.setStatus(User.OnlineStatus.ONLINE);
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername());
        return AuthResponse.of(token, UserResponse.from(user));
    }

    @Override
    @Transactional
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {

        userRepository.findByUsernameAndEmail(
                        request.getUsername(),
                        request.getEmail())
                .orElseThrow(() ->
                        new AppException(
                                "No account found with this username and email combination"));

        otpService.sendOtp(request.getEmail());

        return ApiResponse.success(
                "OTP sent to " + request.getEmail());
    }

    @Override
    @Transactional
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) {

        boolean valid = otpService.verifyOtp(
                request.getEmail(),
                request.getCode());

        if (!valid) {
            throw new AppException("Invalid or expired OTP code");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User not found"));

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()));

        userRepository.save(user);

        return ApiResponse.success(
                "Password reset successfully. You can now log in.");
    }
}