package com.scholarship.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Map;

@Entity
@Table(name = "scholarships")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scholarship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scholarshipId;

    private String course;
    private Integer minPercentage; // Whole numbers only: 75, 80, 85, etc.
    private Double maxIncome;     // Will be between 300000 and 400000
    private Double baseAmount;    // The starting scholarship amount
    
    @Builder.Default
    private boolean isDefencePriorityActive = false; // Course-specific condition

    @ElementCollection
    @CollectionTable(name = "scholarship_additional_criteria", joinColumns = @JoinColumn(name = "scholarship_id"))
    @MapKeyColumn(name = "criterion_name")
    @Column(name = "criterion_value")
    private Map<String, String> additionalCriteria;
}
