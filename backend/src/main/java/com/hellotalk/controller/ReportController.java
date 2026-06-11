package com.hellotalk.controller;

import com.hellotalk.dto.request.ReportRequest;
import com.hellotalk.dto.response.ApiResponse;
import com.hellotalk.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final AdminService adminService;

    /**
     * POST /api/reports
     * Submit a report against another user.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> reportUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReportRequest request) {
        adminService.submitReport(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Report submitted. Admins will review it shortly."));
    }
}
