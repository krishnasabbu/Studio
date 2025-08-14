package com.template.service;

import com.template.dao.ExecutionLogRepository;
import com.template.model.ExecutionLog;
import com.template.model.WorkflowExecutor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class WorkflowExecutionLogService {

    @Autowired
    private ExecutionLogRepository logRepository;

    /**
     * Helper method to create and persist an ExecutionLog entry.
     * This centralizes the logging logic to avoid code duplication.
     *
     * @param level       The log level (e.g., INFO, SUCCESS, ERROR).
     * @param message     A brief, descriptive message for the log.
     * @param details     A more detailed message for tracing and debugging.
     * @param workflowId  The ID of the workflow.
     * @param serviceId   The ID of the service.
     * @param executorId  The ID of the executor.
     * @param stepId      The ID of the workflow step (node or edge ID).
     * @param stepName    The dynamic name of the step (e.g., Node Name, Approver Role).
     * @param performedBy The user or system component that performed the action.
     */
    private void log(ExecutionLog.Level level, String message, String details, String workflowId, String serviceId, String executorId, String stepId, String stepName, String performedBy) {
        ExecutionLog log = new ExecutionLog();
        log.setTimestamp(new Timestamp(System.currentTimeMillis()));
        log.setServiceId(serviceId);
        log.setExecutorId(executorId);
        log.setStepId(stepId);
        log.setStepName(stepName); // <-- Now sets the dynamic step name
        log.setLevel(level.toString());
        log.setMessage(message);
        log.setDetails(details);
        log.setPerformedBy(performedBy);

        logRepository.create(log);
    }

    // --- Specific Logging Methods ---

    public void logWorkflowInitiation(String workflowId, String serviceId) {
        // Step name is "Workflow" as this log is for the entire workflow process
        log(ExecutionLog.Level.INFO, "Workflow initiated", "Starting new workflow instance.", workflowId, serviceId, null, "system", "Workflow", "system");
    }

    public void logStartNodesSaved(String workflowId, String serviceId, int count) {
        log(ExecutionLog.Level.INFO, "Start nodes saved", "Initiated workflow with " + count + " start nodes. Executors saved to DB.", workflowId, serviceId, null, "system", "Workflow", "system");
    }

    public void logAsyncExecutorStart(String executorId, String workflowId, String serviceId) {
        log(ExecutionLog.Level.INFO, "Async executor started", "Starting async execution for executorId: " + executorId, workflowId, serviceId, executorId, "system", "Workflow", "system");
    }

    public void logSyncExecutorStart(String executorId, String workflowId, String serviceId) {
        log(ExecutionLog.Level.INFO, "Sync executor started", "Starting synchronous execution for executorId: " + executorId, workflowId, serviceId, executorId, "system", "Workflow", "system");
    }

    public void logNodeExecutionStarted(WorkflowExecutor executor) {
        // Step name is the name of the node
        log(ExecutionLog.Level.INFO, "Node execution started", "Node executor " + executor.getId() + " started execution.", executor.getWorkflowId(), executor.getServiceId(), executor.getId(), executor.getChildrenId(), executor.getName(), "system");
    }

    public void logNodeExecutionResult(WorkflowExecutor executor, boolean success) {
        ExecutionLog.Level level = success ? ExecutionLog.Level.SUCCESS : ExecutionLog.Level.ERROR;
        String message = success ? "Node execution succeeded" : "Node execution failed";
        String details = "Node executor " + executor.getId() + " (Node ID: " + executor.getChildrenId() + ") status updated to " + (success ? "COMPLETED" : "FAILED") + ".";
        log(level, message, details, executor.getWorkflowId(), executor.getServiceId(), executor.getId(), executor.getChildrenId(), executor.getName(), "system");
    }

    public void logOutgoingEdgesTriggered(WorkflowExecutor parentExecutor, String sourceNodeId, int count) {
        log(ExecutionLog.Level.INFO, "Outgoing edges triggered", "Created " + count + " edge executors for outgoing edges from node " + sourceNodeId, parentExecutor.getWorkflowId(), parentExecutor.getServiceId(), parentExecutor.getId(), sourceNodeId, "Workflow", "system");
    }

    public void logEdgeExecutionStatus(WorkflowExecutor executor, String status) {
        // Step name is the assigned approver, making the log more specific
        String stepName = "Approval (" + executor.getAssignedApprover() + ")";
        log(ExecutionLog.Level.INFO, "Edge executor status updated", "Edge executor " + executor.getId() + " (Edge ID: " + executor.getChildrenId() + ") is " + status + ".", executor.getWorkflowId(), executor.getServiceId(), executor.getId(), executor.getChildrenId(), stepName, "system");
    }

    public void logWorkflowCompletionCheck(String workflowId, String serviceId, boolean isCompleted) {
        ExecutionLog.Level level = isCompleted ? ExecutionLog.Level.SUCCESS : ExecutionLog.Level.INFO;
        String message = isCompleted ? "Workflow completed" : "Workflow check";
        String details = isCompleted ? "All executors are in a terminal state." : "Workflow is not yet completed. Active executors found.";
        log(level, message, details, workflowId, serviceId, null, "system", "Workflow", "system");
    }

    public void logApprovalUpdate(String executorId, String newStatus, String user, String stepName) {
        log(ExecutionLog.Level.INFO, "Approval status updated", "Executor " + executorId + " set to status " + newStatus + " by " + user + ".", null, null, executorId, "system", stepName, user);
    }
}