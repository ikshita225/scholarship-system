package com.scholarship.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String filePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "help_request_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private HelpRequest helpRequest;
}
