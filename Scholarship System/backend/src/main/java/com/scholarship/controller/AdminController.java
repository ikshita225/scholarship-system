package com.scholarship.controller;

import com.scholarship.model.Application;
import com.scholarship.model.HelpRequest;
import com.scholarship.model.Scholarship;
import com.scholarship.service.ScholarshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    @Autowired private ScholarshipService scholarshipService;

    @GetMapping("/verified")
    public List<Application> getVerified() { return scholarshipService.getVerifiedApplications(); }

    @GetMapping("/all-applications")
    public List<Application> getAll() { return scholarshipService.getAllApplications(); }

    @PostMapping("/applications/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam("status") Application.Status status, @RequestParam(value = "remarks", required = false) String remarks) {
        try { return ResponseEntity.ok(scholarshipService.updateApplicationStatus(id, status, remarks)); } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/scholarships")
    public Scholarship create(@RequestBody Scholarship s) { return scholarshipService.createScholarship(s); }

    @PutMapping("/scholarships/{id}")
    public Scholarship update(@PathVariable Long id, @RequestBody Scholarship s) { return scholarshipService.updateScholarship(id, s); }

    @DeleteMapping("/scholarships/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) { scholarshipService.deleteScholarship(id); return ResponseEntity.ok("Deleted"); }

    // --- ESCALATED SUPPORT SYSTEM (Admin Final Authority) ---
    @GetMapping("/help-requests")
    public List<HelpRequest> getVerifiedHelp() {
        return scholarshipService.getVerifiedHelpForAdmin();
    }

    @PostMapping("/help-requests/{id}/status")
    public ResponseEntity<?> updateHelpStatus(@PathVariable Long id, @RequestParam("status") HelpRequest.RequestStatus status, @RequestParam("remarks") String remarks) {
        try { return ResponseEntity.ok(scholarshipService.updateHelpRequestStatus(id, status, remarks)); } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}
