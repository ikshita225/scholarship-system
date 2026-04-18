package com.scholarship.controller;

import com.scholarship.repository.DocumentRepository;
import com.scholarship.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private StorageService storageService;

    @GetMapping("/{id}")
    public ResponseEntity<org.springframework.core.io.Resource> getDocument(@PathVariable Long id) {
        return documentRepository.findById(id)
                .map(document -> {
                    try {
                        java.nio.file.Path path = storageService.load(document.getFilePath());
                        org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());
                        return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getName() + "\"")
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .body(resource);
                    } catch (java.net.MalformedURLException e) {
                        return ResponseEntity.notFound().<org.springframework.core.io.Resource>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
