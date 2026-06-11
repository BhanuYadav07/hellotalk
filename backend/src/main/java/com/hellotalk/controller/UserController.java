package com.hellotalk.controller;

import com.hellotalk.dto.request.UpdateProfileRequest;
import com.hellotalk.dto.response.ApiResponse;
import com.hellotalk.dto.response.UserResponse;
import com.hellotalk.entity.User;
import com.hellotalk.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/me
     * Get current user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse response = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", response));
    }

    /**
     * PUT /api/users/me
     * Update current user's profile.
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", response));
    }

    /**
     * PATCH /api/users/me/status
     * Update online status (ONLINE |OFFLINE).
     */
    @PatchMapping("/me/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String status) {
        User.OnlineStatus onlineStatus = User.OnlineStatus.valueOf(status.toUpperCase());
        UserResponse response = userService.updateStatus(userDetails.getUsername(), onlineStatus);
        return ResponseEntity.ok(ApiResponse.success("Status updated", response));
    }

    /**
     * GET /api/users/search?q=query
     * Search users by name or username.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String q) {
        List<UserResponse> users = userService.searchUsers(q, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Search results", users));
    }

    /**
     * GET /api/users/{id}
     * Get a user's public profile by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User found", response));
    }
}
