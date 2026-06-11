package com.hellotalk.service;

import com.hellotalk.dto.request.*;
import com.hellotalk.dto.response.ApiResponse;
import com.hellotalk.dto.response.AuthResponse;

public interface AuthService {

    ApiResponse<String> signup(SignupRequest request);

    ApiResponse<String> verifyOtp(OtpVerifyRequest request);

    AuthResponse login(LoginRequest request);

    ApiResponse<String> forgotPassword(ForgotPasswordRequest request);

    ApiResponse<String> resetPassword(ResetPasswordRequest request);
}
