package com.scholarship.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicationId;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "scholarship_id", nullable = false)
    private Scholarship scholarship;

    private Double twelfthPercentage;
    private Double familyIncome;
    private String caste;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private Double finalAmount;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    @Builder.Default
    private List<Document> documents = new java.util.ArrayList<>();

    public enum Status {
        PENDING, 
        VERIFIED, 
        REJECTED_BY_VERIFIER, 
        APPROVED, 
        REJECTED_BY_ADMIN
    }
}
