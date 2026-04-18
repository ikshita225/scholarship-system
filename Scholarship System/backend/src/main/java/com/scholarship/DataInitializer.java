package com.scholarship;

import com.scholarship.model.Scholarship;
import com.scholarship.model.User;
import com.scholarship.repository.ScholarshipRepository;
import com.scholarship.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScholarshipRepository scholarshipRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // OFFICIAL ADMIN ACCOUNT
        if (userRepository.findByEmail("master_admin@scholarship.com").isEmpty()) {
            userRepository.save(User.builder()
                .name("Master Admin")
                .email("master_admin@scholarship.com")
                .password(passwordEncoder.encode("Admin@2026"))
                .role(User.Role.ADMIN)
                .isVerified(true)
                .approved(true)
                .build());
        }

        // OFFICIAL VERIFIER ACCOUNT
        if (userRepository.findByEmail("official_verifier@scholarship.com").isEmpty()) {
            userRepository.save(User.builder()
                .name("Official Verifier")
                .email("official_verifier@scholarship.com")
                .password(passwordEncoder.encode("Verifier@2026"))
                .role(User.Role.VERIFIER)
                .isVerified(true)
                .approved(true)
                .build());
        }

        // SEED TEST STUDENT (Sakshi)
        if (userRepository.findByEmail("sakshi123@gmail.com").isEmpty()) {
            userRepository.save(User.builder()
                .name("Sakshi")
                .email("sakshi123@gmail.com")
                .password(passwordEncoder.encode("password"))
                .role(User.Role.STUDENT)
                .isVerified(true)
                .approved(true)
                .build());
        }

        // SEED SCHOLARSHIPS
        if (scholarshipRepository.count() == 0) {
            String[] courses = {"Computer Science", "BBA", "Architecture", "MBA", "Mathematics", "M.Com", "B.Tech"};
            int[] percTiers = {75, 77, 80, 82, 84, 85, 90};
            Random random = new Random();

            for (String course : courses) {
                scholarshipRepository.save(Scholarship.builder()
                    .course(course)
                    .minPercentage(percTiers[random.nextInt(3)])
                    .maxIncome(350000.0)
                    .isDefencePriorityActive(true)
                    .build());
            }
        }
    }
}
