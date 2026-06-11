package com.hellotalk.service.impl;

import com.hellotalk.dto.request.ReportRequest;
import com.hellotalk.dto.response.UserResponse;
import com.hellotalk.entity.Report;
import com.hellotalk.entity.User;
import com.hellotalk.exception.AppException;
import com.hellotalk.repository.ReportRepository;
import com.hellotalk.repository.UserRepository;
import com.hellotalk.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void blockUser(Long userId) {
        User user = findById(userId);
        if (user.getRole() == User.Role.ADMIN) {
            throw new AppException("Cannot block an admin user");
        }
        user.setIsBlocked(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void unblockUser(Long userId) {
        User user = findById(userId);
        user.setIsBlocked(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = findById(userId);
        if (user.getRole() == User.Role.ADMIN) {
            throw new AppException("Cannot delete an admin user");
        }
        userRepository.delete(user);
    }

    @Override
    public List<Report> getPendingReports() {
        return reportRepository.findByStatus(Report.ReportStatus.PENDING);
    }

    @Override
    @Transactional
    public void dismissReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException("Report not found", HttpStatus.NOT_FOUND));
        report.setStatus(Report.ReportStatus.DISMISSED);
        reportRepository.save(report);
    }

    @Override
    @Transactional
    public void submitReport(String reporterUsername, ReportRequest request) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        User reportedUser = findById(request.getReportedUserId());

        if (reportRepository.existsByReporterIdAndReportedUserId(
                reporter.getId(), reportedUser.getId())) {
            throw new AppException("You have already reported this user");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .reportedUser(reportedUser)
                .reason(request.getReason())
                .build();

        reportRepository.save(report);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }
}
