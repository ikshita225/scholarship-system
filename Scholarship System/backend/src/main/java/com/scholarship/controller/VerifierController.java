package com.scholarship.controller;

import com.scholarship.model.Application;
import com.scholarship.model.HelpRequest;
import com.scholarship.service.ScholarshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/verifier")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAuthority('ROLE_VERIFIER')")
public class VerifierController {

    @Autowired private ScholarshipService scholarshipService;

    @GetMapping("/pending")
    public List<Application> getPending() {
        return scholarshipService.getPendingApplications();
    }

    @PostMapping("/applications/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam("status") Application.Status status, @RequestParam(value = "remarks", required = false) String remarks) {
        try { return ResponseEntity.ok(scholarshipService.updateApplicationStatus(id, status, remarks)); } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // --- ESCALATED SUPPORT SYSTEM (New Verifier Gate) ---
    @GetMapping("/help-requests")
    public List<HelpRequest> getPendingHelp() {
        return scholarshipService.getPendingHelpForVerifier();
    }

    @PostMapping("/help-requests/{id}/status")
    public ResponseEntity<?> updateHelpStatus(@PathVariable Long id, @RequestParam("status") HelpRequest.RequestStatus status, @RequestParam("remarks") String remarks) {
        try { return ResponseEntity.ok(scholarshipService.updateHelpRequestStatus(id, status, remarks)); } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}
