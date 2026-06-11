package com.hellotalk.repository;

import com.hellotalk.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByStatus(Report.ReportStatus status);

    @Query("SELECT r FROM Report r WHERE r.reportedUser.id = :userId ORDER BY r.createdAt DESC")
    List<Report> findByReportedUserId(Long userId);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.reportedUser.id = :userId AND r.status = 'PENDING'")
    long countPendingReportsByUser(Long userId);

    boolean existsByReporterIdAndReportedUserId(Long reporterId, Long reportedUserId);
}
