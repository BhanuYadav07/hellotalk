package com.hellotalk.controller;

import com.hellotalk.dto.request.ReportRequest;
import com.hellotalk.dto.response.ApiResponse;
import com.hellotalk.dto.response.UserResponse;
import com.hellotalk.entity.Report;
import com.hellotalk.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/users
     * Get all registered users.
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("All users fetched", users));
    }

    /**
     * PATCH /api/admin/users/{userId}/block
     * Block a user account.
     */
    @PatchMapping("/users/{userId}/block")
    public ResponseEntity<ApiResponse<Void>> blockUser(@PathVariable Long userId) {
        adminService.blockUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User blocked successfully"));
    }

    /**
     * PATCH /api/admin/users/{userId}/unblock
     * Unblock a user account.
     */
    @PatchMapping("/users/{userId}/unblock")
    public ResponseEntity<ApiResponse<Void>> unblockUser(@PathVariable Long userId) {
        adminService.unblockUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User unblocked successfully"));
    }

    /**
     * DELETE /api/admin/users/{userId}
     * Permanently delete a user from the database.
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted from database"));
    }

    /**
     * GET /api/admin/reports
     * Get all pending reports.
     */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<Report>>> getPendingReports() {
        List<Report> reports = adminService.getPendingReports();
        return ResponseEntity.ok(ApiResponse.success("Pending reports fetched", reports));
    }

    /**
     * PATCH /api/admin/reports/{reportId}/dismiss
     * Dismiss a report.
     */
    @PatchMapping("/reports/{reportId}/dismiss")
    public ResponseEntity<ApiResponse<Void>> dismissReport(@PathVariable Long reportId) {
        adminService.dismissReport(reportId);
        return ResponseEntity.ok(ApiResponse.success("Report dismissed"));
    }
}
