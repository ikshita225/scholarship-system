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
                        
                        String contentType = "application/octet-stream";
                        try {
                            String probedType = java.nio.file.Files.probeContentType(path);
                            if (probedType != null) contentType = probedType;
                        } catch (java.io.IOException e) {
                            // Default to octet-stream
                        }

                        return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getName() + "\"")
                                .contentType(MediaType.parseMediaType(contentType))
                                .body(resource);
                    } catch (java.net.MalformedURLException e) {
                        return ResponseEntity.notFound().<org.springframework.core.io.Resource>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
