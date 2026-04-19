package com.scholarship;

import com.scholarship.model.Scholarship;
import com.scholarship.model.User;
import com.scholarship.repository.ApplicationRepository;
import com.scholarship.repository.HelpRequestRepository;
import com.scholarship.repository.ScholarshipRepository;
import com.scholarship.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScholarshipRepository scholarshipRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

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

        // SEED SCHOLARSHIPS (Expanded & Diverse List - Capped at 400k Income)
        if (scholarshipRepository.count() != 30) {
            // Clear existing records to ensure the new diverse list is applied
            helpRequestRepository.deleteAll();
            applicationRepository.deleteAll();
            scholarshipRepository.deleteAll();

            Object[][] scholarshipData = {
                {"Computer Science", 85, 300000.0, 5000.0},
                {"BBA", 75, 350000.0, 4000.0},
                {"Architecture", 80, 350000.0, 5500.0},
                {"MBA", 88, 350000.0, 7000.0},
                {"Mathematics", 78, 300000.0, 5000.0},
                {"M.Com", 76, 350000.0, 4500.0},
                {"B.Tech", 83, 350000.0, 6000.0},
                {"BCA", 72, 300000.0, 4000.0},
                {"M.Tech", 90, 350000.0, 8500.0},
                {"Physics", 81, 250000.0, 5000.0},
                {"Chemistry", 79, 250000.0, 5000.0},
                {"Biology", 82, 300000.0, 5000.0},
                {"English Literature", 70, 300000.0, 4000.0},
                {"Economics", 84, 350000.0, 6000.0},
                {"Psychology", 77, 300000.0, 4500.0},
                {"Law", 86, 350000.0, 7000.0},
                {"Journalism", 74, 350000.0, 4500.0},
                {"Fine Arts", 65, 200000.0, 3500.0},
                {"Nursing", 82, 300000.0, 5500.0},
                {"Civil Engineering", 81, 350000.0, 5500.0},
                {"Mechanical Engineering", 82, 350000.0, 5500.0},
                {"Electrical Engineering", 83, 350000.0, 5500.0},
                {"Political Science", 72, 300000.0, 4000.0},
                {"History", 71, 250000.0, 4000.0},
                {"Geography", 73, 300000.0, 4000.0},
                {"Sociology", 74, 300000.0, 4000.0},
                {"Pharmacy", 84, 350000.0, 6000.0},
                {"Agriculture", 75, 250000.0, 4500.0},
                {"Commerce", 77, 350000.0, 4500.0},
                {"Education (B.Ed)", 78, 350000.0, 4500.0}
            };

            for (Object[] data : scholarshipData) {
                scholarshipRepository.save(Scholarship.builder()
                    .course((String) data[0])
                    .minPercentage((Integer) data[1])
                    .maxIncome((Double) data[2])
                    .baseAmount((Double) data[3])
                    .isDefencePriorityActive(true)
                    .build());
            }
        }
    }
}
