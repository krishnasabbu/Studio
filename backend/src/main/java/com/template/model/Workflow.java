package com.template.model;

// Workflow.java

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class Workflow {
    private String id;
    private String name;
    private String description;
    private String version;
    private String status;
    private List<Node> nodes;
    private List<Edge> edges;
    private String createdBy;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // getters and setters
}

