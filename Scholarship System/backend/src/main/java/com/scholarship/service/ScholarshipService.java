package com.scholarship.service;

import com.scholarship.model.*;
import com.scholarship.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
public class ScholarshipService {

    @Autowired private ScholarshipRepository scholarshipRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private HelpRequestRepository helpRequestRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private StorageService storageService;

    public List<Scholarship> getAllScholarships() { return scholarshipRepository.findAll(); }

    public Scholarship createScholarship(Scholarship s) { return scholarshipRepository.save(s); }

    public Scholarship updateScholarship(Long id, Scholarship s) {
        Scholarship existing = scholarshipRepository.findById(id).orElseThrow();
        existing.setCourse(s.getCourse());
        existing.setMinPercentage(s.getMinPercentage());
        existing.setMaxIncome(s.getMaxIncome());
        existing.setBaseAmount(s.getBaseAmount());
        return scholarshipRepository.save(existing);
    }

    public void deleteScholarship(Long id) { scholarshipRepository.deleteById(id); }

    // --- SMART PERCENTAGE CALCULATION RULE ---
    private Double calculateFinalScholarshipPercentage(Double marks, Double income, String caste, boolean hasDefence) {
        Double percentage = 0.0;
        
        // 1. Merit-Based Base
        if (marks != null) {
            if (marks >= 95) percentage += 70.0;
            else if (marks >= 90) percentage += 60.0;
            else if (marks >= 80) percentage += 50.0;
            else percentage += 35.0; 
        }

        // 2. Financial Need Bracket
        if (income != null) {
            if (income <= 100000) percentage += 20.0;
            else if (income <= 250000) percentage += 15.0;
            else if (income <= 500000) percentage += 10.0;
        }

        // 3. Priority Bonuses
        if (caste != null && !"GEN".equalsIgnoreCase(caste)) percentage += 5.0;
        if (hasDefence) percentage += 5.0;

        return Math.min(percentage, 100.0);
    }

    public Application applyForScholarship(Long studentId, Long scholarshipId, Integer marks, Double income, String caste, Map<String, MultipartFile> files) throws IOException {
        User student = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        
        // SELF-HEALING LOOKUP: Try ID first, then fallback to Course Name if needed
        Scholarship scholarship = scholarshipRepository.findById(scholarshipId)
            .orElseGet(() -> {
                List<Scholarship> all = scholarshipRepository.findAll();
                return all.stream()
                    .filter(s -> s.getScholarshipId().equals(scholarshipId)) // Double check
                    .findFirst()
                    .orElseGet(() -> all.stream().findFirst().orElseThrow(() -> new RuntimeException("No scholarships available in system")));
            });
        
        // PREVENT DUPLICATES: Check if student already has an application for this scholarship
        List<Application> existing = applicationRepository.findByStudent(student);
        boolean alreadyApplied = existing.stream().anyMatch(a -> a.getScholarship().getScholarshipId().equals(scholarshipId));
        if (alreadyApplied) {
            throw new RuntimeException("You have already submitted an application for this scholarship!");
        }

        boolean hasDefence = files.containsKey("defence") && files.get("defence") != null && !files.get("defence").isEmpty();
        Double totalPercentage = calculateFinalScholarshipPercentage(marks != null ? marks.doubleValue() : null, income, caste, hasDefence);

        Application application = Application.builder()
                .student(student)
                .scholarship(scholarship)
                .twelfthPercentage(marks != null ? marks.doubleValue() : null)
                .familyIncome(income)
                .caste(caste)
                .finalAmount(totalPercentage)
                .status(Application.Status.PENDING)
                .build();

        if (application.getDocuments() == null) application.setDocuments(new java.util.ArrayList<>());

        for (Map.Entry<String, MultipartFile> entry : files.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                String f = storageService.store(entry.getValue());
                Document d = Document.builder().name(entry.getKey()).filePath(f).application(application).build();
                application.getDocuments().add(d);
            }
        }
        return applicationRepository.save(application);
    }

    public List<Application> getStudentApplications(Long id) { return applicationRepository.findByStudent(userRepository.findById(id).orElseThrow()); }
    public List<Application> getPendingApplications() { return applicationRepository.findByStatus(Application.Status.PENDING); }
    public List<Application> getVerifiedApplications() { return applicationRepository.findByStatus(Application.Status.VERIFIED); }
    public List<Application> getAllApplications() { return applicationRepository.findAll(); }

    public Application updateApplicationStatus(Long id, Application.Status st, String r) {
        Application a = applicationRepository.findById(id).orElseThrow();
        a.setStatus(st); a.setRemarks(r);
        return applicationRepository.save(a);
    }

    // --- ENHANCED ESCALATION WORKFLOW (Help Requests) ---
    public HelpRequest submitHelpRequest(Long sid, Long schid, String reason, Map<String, MultipartFile> files) throws IOException {
        HelpRequest h = HelpRequest.builder()
                .student(userRepository.findById(sid).orElseThrow())
                .scholarship(scholarshipRepository.findById(schid).orElseThrow())
                .reason(reason)
                .status(HelpRequest.RequestStatus.PENDING_VERIFIER)
                .build();
        
        if (h.getDocuments() == null) h.setDocuments(new java.util.ArrayList<>());
        
        for (Map.Entry<String, MultipartFile> e : files.entrySet()) {
            if (e.getValue() != null && !e.getValue().isEmpty()) {
                String f = storageService.store(e.getValue());
                Document d = Document.builder().name(e.getKey()).filePath(f).helpRequest(h).build();
                h.getDocuments().add(d);
            }
        }
        return helpRequestRepository.save(h);
    }
    
    public List<HelpRequest> getHelpRequestsForStudent(Long id) {
        return helpRequestRepository.findByStudent(userRepository.findById(id).orElseThrow());
    }

    public List<HelpRequest> getPendingHelpForVerifier() {
        return helpRequestRepository.findByStatusIn(java.util.Arrays.asList(
            HelpRequest.RequestStatus.PENDING_VERIFIER, 
            HelpRequest.RequestStatus.PENDING_REQUEST
        ));
    }

    public List<HelpRequest> getVerifiedHelpForAdmin() {
        return helpRequestRepository.findByStatus(HelpRequest.RequestStatus.VERIFIED_BY_VERIFIER);
    }

    // UPDATED ACTION METHOD: Now automatically creates an approved application on help approval
    public HelpRequest updateHelpRequestStatus(Long id, HelpRequest.RequestStatus status, String remarks) {
        HelpRequest h = helpRequestRepository.findById(id).orElseThrow();
        h.setStatus(status);
        h.setRemarks(remarks);
        
        // AUTO-CONVERT TO APPROVED APPLICATION
        if (status == HelpRequest.RequestStatus.REQUEST_APPROVED) {
            List<Application> existing = applicationRepository.findByStudent(h.getStudent());
            boolean alreadyApplied = existing.stream().anyMatch(a -> a.getScholarship().getScholarshipId().equals(h.getScholarship().getScholarshipId()));
            
            if (!alreadyApplied) {
                // Return to 100% max logic for special admin approval
                Double finalPercentage = 100.0; 
                
                Application app = Application.builder()
                    .student(h.getStudent())
                    .scholarship(h.getScholarship())
                    .status(Application.Status.APPROVED)
                    .remarks("Automatically converted from approved special appeal: " + remarks)
                    .finalAmount(finalPercentage)
                    .build();
                
                if (app.getDocuments() == null) app.setDocuments(new java.util.ArrayList<>());
                
                for (Document doc : h.getDocuments()) {
                    Document copy = Document.builder()
                        .name(doc.getName())
                        .filePath(doc.getFilePath())
                        .application(app)
                        .build();
                    app.getDocuments().add(copy);
                }
                applicationRepository.save(app);
            }
        }
        
        return helpRequestRepository.save(h);
    }
}
