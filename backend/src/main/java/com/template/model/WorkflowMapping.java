package com.template.model;

import java.time.LocalDateTime;

/**
 * Represents a mapping between a workflow and a specific functionality.
 * This is a simple POJO for use with JdbcTemplate.
 */
public class WorkflowMapping {

    private Long id;
    private String workflowId;
    private Long functionalityId;
    private String functionalityName;
    private String functionalityType;
    private LocalDateTime createdAt;

    // Default constructor for RowMapper
    public WorkflowMapping() {
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public Long getFunctionalityId() {
        return functionalityId;
    }

    public void setFunctionalityId(Long functionalityId) {
        this.functionalityId = functionalityId;
    }

    public String getFunctionalityName() {
        return functionalityName;
    }

    public void setFunctionalityName(String functionalityName) {
        this.functionalityName = functionalityName;
    }

    public String getFunctionalityType() {
        return functionalityType;
    }

    public void setFunctionalityType(String functionalityType) {
        this.functionalityType = functionalityType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
