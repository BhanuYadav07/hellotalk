package com.hellotalk.service;

import com.hellotalk.dto.request.ReportRequest;
import com.hellotalk.dto.response.UserResponse;
import com.hellotalk.entity.Report;

import java.util.List;

public interface AdminService {

    List<UserResponse> getAllUsers();

    void blockUser(Long userId);

    void unblockUser(Long userId);

    void deleteUser(Long userId);

    List<Report> getPendingReports();

    void dismissReport(Long reportId);

    void submitReport(String reporterUsername, ReportRequest request);
}
