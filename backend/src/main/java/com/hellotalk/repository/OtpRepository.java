package com.hellotalk.repository;

import com.hellotalk.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {

    @Query("""
            SELECT o
            FROM Otp o
            WHERE o.email = :email
            AND o.code = :code
            AND o.isUsed = false
            AND o.expiresAt > :now
            ORDER BY o.createdAt DESC
            """)
    Optional<Otp> findValidOtp(
            String email,
            String code,
            LocalDateTime now
    );

    @Modifying
    @Transactional
    @Query("""
            UPDATE Otp o
            SET o.isUsed = true
            WHERE o.email = :email
            """)
    void invalidateOtpsForEmail(String email);

    @Modifying
    @Transactional
    @Query("""
            DELETE FROM Otp o
            WHERE o.expiresAt < :now
            """)
    void deleteExpiredOtps(LocalDateTime now);
}