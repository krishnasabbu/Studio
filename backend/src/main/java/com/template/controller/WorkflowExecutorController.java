package com.template.controller;

import com.template.model.*;
import com.template.service.WorkflowExecutionService;
import com.template.service.WorkflowService;
import com.template.service.WorkflowServiceFactory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for managing workflow execution instances.
 * Exposes API endpoints for retrieving execution status and handling approvals.
 */
@RestController
@RequestMapping("/api/workflow-executors")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Workflow Executor API", description = "API for monitoring and managing running workflow instances")
public class WorkflowExecutorController {

    private final WorkflowService workflowService;

    private final WorkflowServiceFactory workflowServiceFactory;

    @Autowired
    public WorkflowExecutorController(WorkflowService workflowService, WorkflowExecutionService workflowExecutionService, WorkflowServiceFactory workflowServiceFactory) {
        this.workflowService = workflowService;
        this.workflowServiceFactory = workflowServiceFactory;
    }

    /**
     * API 1: Retrieves all execution steps (executors) for a specific service instance.
     *
     * @param serviceId The ID of the service instance.
     * @return A list of WorkflowExecutor objects.
     */
    @GetMapping("/services/{serviceId}")
    @Operation(summary = "Get all execution steps for a specific service instance")
    public ResponseEntity<List<WorkflowExecutor>> getExecutorsByServiceId(
            @Parameter(description = "ID of the service instance", required = true) @PathVariable String serviceId) {
        List<WorkflowExecutor> executors = workflowService.getWorkflowExecutorByServiceId(serviceId);
        if (executors.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(executors, HttpStatus.OK);
    }

    /**
     * API 2: Retrieves the complete workflow definition and all its execution steps for a service instance.
     *
     * @param serviceId The ID of the service instance.
     * @return A DTO containing the workflow definition and execution details.
     */
    @GetMapping("/details-by-service/{serviceId}")
    @Operation(summary = "Get a complete workflow instance with all its execution details")
    public ResponseEntity<WorkflowInstanceDetails> getWorkflowDetailsByServiceId(
            @Parameter(description = "ID of the service instance", required = true) @PathVariable String serviceId) {
        Optional<WorkflowInstanceDetails> details = workflowService.getWorkflowInstanceDetails(serviceId);
        return details
                .map(d -> new ResponseEntity<>(d, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * API 3: Approves a specific waiting workflow executor.
     *
     * @param executorId The ID of the executor to approve.
     * @param request A DTO containing the approver and comments.
     * @return A success message or an error if the executor is not found or cannot be approved.
     */
    @PostMapping("/{executorId}/approve")
    @Operation(summary = "Approve a workflow executor waiting for approval")
    public ResponseEntity<String> approveExecutor(
            @Parameter(description = "ID of the executor to approve", required = true) @PathVariable String executorId,
            @RequestBody ApprovalRequest request) {
        try {
            WorkflowExecutionService service = workflowServiceFactory.get(request.getType());
            service.approve(executorId, request.getApprovedBy(), request.getComments());
            return new ResponseEntity<>("Executor " + executorId + " approved successfully.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * API 3: Rejects a specific waiting workflow executor.
     *
     * @param executorId The ID of the executor to reject.
     * @param request A DTO containing the rejector and comments.
     * @return A success message or an error if the executor is not found or cannot be rejected.
     */
    @PostMapping("/{executorId}/reject")
    @Operation(summary = "Reject a workflow executor waiting for approval")
    public ResponseEntity<String> rejectExecutor(
            @Parameter(description = "ID of the executor to reject", required = true) @PathVariable String executorId,
            @RequestBody ApprovalRequest request) {
        try {
            WorkflowExecutionService service = workflowServiceFactory.get(request.getType());
            service.reject(executorId, request.getApprovedBy(), request.getComments());
            return new ResponseEntity<>("Executor " + executorId + " rejected successfully.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * API 4: Retrieves all executors that are waiting for approval.
     *
     * @return A list of DTOs containing detailed information for each pending approval.
     */
    @GetMapping("/pending-approvals")
    @Operation(summary = "Get a list of all pending approval tasks")
    public ResponseEntity<List<PendingApprovalDetails>> getPendingApprovals() {
        List<PendingApprovalDetails> pendingApprovals = workflowService.getPendingApprovalDetails();
        return new ResponseEntity<>(pendingApprovals, HttpStatus.OK);
    }

    /**
     * API: Retrieves summary statistics of workflow instances grouped by serviceId.
     *
     * @return A DTO containing counts of total, running, completed, and pending approval workflows.
     */
    @GetMapping("/workflow-summary")
    @Operation(summary = "Get summary of workflow instance states")
    public ResponseEntity<WorkflowInstanceSummary> getWorkflowInstanceSummary() {
        WorkflowInstanceSummary summary = workflowService.getWorkflowInstanceSummary();
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }


}
