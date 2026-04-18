package com.scholarship.repository;

import com.scholarship.model.Scholarship;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScholarshipRepository extends JpaRepository<Scholarship, Long> {
}
