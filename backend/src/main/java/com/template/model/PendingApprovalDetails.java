package com.template.model;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for a detailed view of a single pending approval.
 */
@Data
public class PendingApprovalDetails {
    private String id;
    private String serviceName;
    private String workflowId;
    private String workflowName;
    private long instanceId;
    private String stageId;
    private String stageName;
    private String activityId;
    private String activityName;
    private String requestedBy;
    private LocalDateTime requestedAt;
    private String requiredRole;
    private ExecutionStatus status;
    private String priority; // Placeholder for future implementation
    private String description; // Placeholder for future implementation
    private String viewURL;
    private String viewWorkflowURL;
}

