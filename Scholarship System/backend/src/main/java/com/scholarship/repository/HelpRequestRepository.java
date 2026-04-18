package com.scholarship.repository;

import com.scholarship.model.HelpRequest;
import com.scholarship.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {
    List<HelpRequest> findByStudent(User student);
    List<HelpRequest> findByStatus(HelpRequest.RequestStatus status);
    List<HelpRequest> findByStatusIn(List<HelpRequest.RequestStatus> statuses);
}
