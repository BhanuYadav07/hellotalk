package com.hellotalk.service;

import com.hellotalk.entity.Otp;

public interface OtpService {

    void sendOtp(String email);

    boolean verifyOtp(String email, String code);

    void invalidateOtps(String email);
}
