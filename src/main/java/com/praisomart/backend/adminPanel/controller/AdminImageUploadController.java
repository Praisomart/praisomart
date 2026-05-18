package com.praisomart.backend.adminPanel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminImageUploadController {

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Uploaded file is empty");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            // Ensure directories exist
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generate unique filename
            String cleanOriginalName = file.getOriginalFilename() != null ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_") : "file";
            String uniqueFileName = UUID.randomUUID().toString() + "_" + cleanOriginalName;
            
            Path path = Paths.get(UPLOAD_DIR, uniqueFileName);
            Files.write(path, file.getBytes());

            Map<String, String> res = new HashMap<>();
            // Return relative URL that will be served via resource mapping /uploads/**
            res.put("url", "/uploads/" + uniqueFileName);
            return ResponseEntity.ok(res);

        } catch (IOException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "File upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }
}
