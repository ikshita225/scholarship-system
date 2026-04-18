package com.scholarship.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "help_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "scholarship_id", nullable = false)
    private Scholarship scholarship;

    @Column(columnDefinition = "TEXT")
    private String reason;

    // Added to store feedback from Verifier/Admin
    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(length = 255)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING_VERIFIER;

    @OneToMany(mappedBy = "helpRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    @Builder.Default
    private List<Document> documents = new java.util.ArrayList<>();

    public enum RequestStatus {
        PENDING_REQUEST,      // Backwards Compatibility for Legacy Submissions
        PENDING_VERIFIER,
        VERIFIED_BY_VERIFIER, // This moves it to Admin's View
        REJECTED_BY_VERIFIER, // Sends it back to Student
        REQUEST_APPROVED,     // Final Admin Signature
        REQUEST_REJECTED      // Final Admin Rejection
    }
}
