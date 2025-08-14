package com.template.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class WorkflowExecutor {
    private String id;
    private String workflowId;
    private String name;
    private String serviceId;
    private ExecutorType type;
    private String childrenId;
    private ExecutionStatus status;
    private String errorCode;
    private String errorMessage;
    private String errorStackTrace;
    private String approvedBy;
    private String approvalComments;
    private String assignedApprover;
    private LocalDateTime approvalDeadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WorkflowExecutor() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getWorkflowId() { return workflowId; }
    public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }
    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    public ExecutorType getType() { return type; }
    public void setType(ExecutorType type) { this.type = type; }
    public String getChildrenId() { return childrenId; }
    public void setChildrenId(String childrenId) { this.childrenId = childrenId; }
    public ExecutionStatus getStatus() { return status; }
    public void setStatus(ExecutionStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public String getErrorStackTrace() { return errorStackTrace; }
    public void setErrorStackTrace(String errorStackTrace) { this.errorStackTrace = errorStackTrace; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public String getApprovalComments() { return approvalComments; }
    public void setApprovalComments(String approvalComments) { this.approvalComments = approvalComments; }
    public String getAssignedApprover() { return assignedApprover; }
    public void setAssignedApprover(String assignedApprover) { this.assignedApprover = assignedApprover; }
    public LocalDateTime getApprovalDeadline() { return approvalDeadline; }
    public void setApprovalDeadline(LocalDateTime approvalDeadline) { this.approvalDeadline = approvalDeadline; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "WorkflowExecutor{" +
                "id='" + id + '\'' +
                ", workflowId='" + workflowId + '\'' +
                ", serviceId=" + serviceId +
                ", type=" + type +
                ", childrenId='" + childrenId + '\'' +
                ", status=" + status +
                '}';
    }
}
