package com.scholarship.repository;

import com.scholarship.model.Application;
import com.scholarship.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(User student);
    List<Application> findByStatus(Application.Status status);
}
