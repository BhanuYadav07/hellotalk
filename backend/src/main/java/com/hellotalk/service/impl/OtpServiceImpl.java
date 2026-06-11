package com.hellotalk.service.impl;

import com.hellotalk.entity.Otp;
import com.hellotalk.exception.AppException;
import com.hellotalk.repository.OtpRepository;
import com.hellotalk.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final Logger logger =
            LoggerFactory.getLogger(OtpServiceImpl.class);

    private final OtpRepository otpRepository;
    private final JavaMailSender mailSender;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendOtp(String email) {

        // Invalidate previous OTPs
        otpRepository.invalidateOtpsForEmail(email);

        String code = generateCode();

        Otp otp = Otp.builder()
                .email(email)
                .code(code)
                .expiresAt(
                        LocalDateTime.now()
                                .plusMinutes(otpExpiryMinutes))
                .build();

        otpRepository.save(otp);

        try {
            sendEmail(email, code);
        } catch (Exception e) {
            logger.error(
                    "Failed to send OTP email to {}: {}",
                    email,
                    e.getMessage());

            throw new AppException(
                    "Failed to send OTP email. Please try again.");
        }
    }

    @Override
    public boolean verifyOtp(String email, String code) {

        Optional<Otp> optOtp =
                otpRepository.findValidOtp(
                        email,
                        code,
                        LocalDateTime.now());

        if (optOtp.isEmpty()) {
            return false;
        }

        Otp otp = optOtp.get();
        otp.setIsUsed(true);

        otpRepository.save(otp);

        return true;
    }

    @Override
    public void invalidateOtps(String email) {
        otpRepository.invalidateOtpsForEmail(email);
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private void sendEmail(String to, String code) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(to);

        message.setSubject(
                "Hello Talk - Verification Code");

        message.setText(
                "Welcome to Hello Talk!\n\n" +
                        "Your OTP Code is: " + code + "\n\n" +
                        "This code expires in " +
                        otpExpiryMinutes +
                        " minutes.\n\n" +
                        "If you did not request this OTP, " +
                        "please ignore this email."
        );

        mailSender.send(message);
    }
}