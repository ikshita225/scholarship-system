package com.scholarship.controller;

import com.scholarship.model.Application;
import com.scholarship.model.HelpRequest;
import com.scholarship.model.Scholarship;
import com.scholarship.service.ScholarshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private ScholarshipService scholarshipService;

    @GetMapping("/scholarships")
    public List<Scholarship> getScholarships() {
        return scholarshipService.getAllScholarships();
    }

    @PostMapping("/apply")
    public ResponseEntity<?> apply(
            @RequestParam("studentId") Long studentId,
            @RequestParam("scholarshipId") Long scholarshipId,
            @RequestParam("twelfthPercentage") Integer marks,
            @RequestParam("familyIncome") Double income,
            @RequestParam("caste") String caste,
            org.springframework.web.multipart.MultipartHttpServletRequest request) {
        try {
            Map<String, MultipartFile> files = request.getFileMap();
            Application app = scholarshipService.applyForScholarship(studentId, scholarshipId, marks, income, caste, files);
            return ResponseEntity.ok(app);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-applications/{studentId}")
    public List<Application> getMyApplications(@PathVariable Long studentId) {
        return scholarshipService.getStudentApplications(studentId);
    }

    // --- HELP REQUESTS ---
    @PostMapping("/help-requests")
    public ResponseEntity<?> help(
            @RequestParam("studentId") Long studentId,
            @RequestParam("scholarshipId") Long scholarshipId,
            @RequestParam("reason") String reason,
            org.springframework.web.multipart.MultipartHttpServletRequest request) {
        try {
            Map<String, MultipartFile> files = request.getFileMap();
            HelpRequest req = scholarshipService.submitHelpRequest(studentId, scholarshipId, reason, files);
            return ResponseEntity.ok(req);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Upload failed");
        }
    }

    @GetMapping("/help-requests/{studentId}")
    public List<HelpRequest> getMyHelp(@PathVariable Long studentId) {
        return scholarshipService.getHelpRequestsForStudent(studentId);
    }
}
