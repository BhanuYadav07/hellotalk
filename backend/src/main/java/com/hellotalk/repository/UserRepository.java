package com.hellotalk.repository;

import com.hellotalk.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByUsernameAndEmail(String username, String email);

    @Query("SELECT u FROM User u WHERE u.isBlocked = false AND u.isVerified = true AND u.id <> :userId")
    List<User> findAllActiveUsersExcept(Long userId);
    // ADD THIS to UserRepository.java
    @Query("SELECT u FROM User u WHERE " +
            "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "AND u.id <> :currentUserId " +
            "AND u.role <> 'ADMIN' " +          // ← hides admin
            "AND u.isBlocked = false " +         // ← hides blocked users
            "AND u.isVerified = true")
    List<User> searchActiveUsers(String q, Long currentUserId);

    List<User> findByIsBlocked(Boolean isBlocked);
}
