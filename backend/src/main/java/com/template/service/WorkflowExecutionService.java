package com.template.service;

import com.template.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Thread-safe, production-grade workflow execution engine.
 * Fixes major issues from earlier design:
 * - Concurrency safety
 * - Async self-invocation
 * - TX commit timing for async triggers
 * - Error handling / fail-fast
 * - Consistent approval status handling
 * - MDC propagation to async threads
 */
@Service
public abstract class WorkflowExecutionService {

    private static final Logger log = LoggerFactory.getLogger(WorkflowExecutionService.class);

    @Autowired
    private WorkflowService workflowService;
    @Autowired
    private ApplicationContext applicationContext;
    @Autowired
    private WorkflowExecutionLogService executionLogService; // Injected logging service

    // Prevent multiple completion events from firing for same workflow
    private final Set<String> completedWorkflows = ConcurrentHashMap.newKeySet();

    // MDC Keys
    private static final String MDC_CORRELATION_ID = "correlationId";
    private static final String MDC_SERVICE_ID = "serviceId";
    private static final String MDC_WORKFLOW_ID = "workflowId";

    /**
     * Initiates a workflow instance from start nodes.
     * Publishes async triggers only after the transaction commits.
     *
     * @param serviceId The service ID associated with the workflow.
     * @param workflowId The ID of the workflow definition.
     * @param name A human-readable name for the workflow instance.
     */
    @Transactional
    public void initiateWorkflow(String serviceId, String workflowId, String name) {
        setupMdc(workflowId, serviceId);
        executionLogService.logWorkflowInitiation(workflowId, serviceId); // Log workflow start

        try {
            Workflow workflow = workflowService.getWorkflowById(workflowId);
            if (workflow == null) {
                log.error("Workflow not found: {}", workflowId);
                throw new IllegalArgumentException("Workflow not found: " + workflowId);
            }

            // Identify start nodes (nodes with no incoming edges)
            Set<String> targetNodeIds = workflow.getEdges().stream()
                    .map(Edge::getTarget)
                    .collect(Collectors.toSet());

            List<Node> startNodes = workflow.getNodes().stream()
                    .filter(node -> !targetNodeIds.contains(node.getId()))
                    .collect(Collectors.toList());

            if (startNodes.isEmpty()) {
                log.warn("No start nodes found for workflow {}; workflow may be misconfigured.", workflowId);
                return;
            }

            List<WorkflowExecutor> executorsToSave = new ArrayList<>();
            for (Node node : startNodes) {
                WorkflowExecutor executor = createNodeExecutor(workflowId, serviceId, node.getId(), name);
                executorsToSave.add(executor);
            }

            workflowService.saveWorkflowExecutors(executorsToSave);
            log.info("Initiated workflow {} with {} start nodes. Executors saved to DB.", workflowId, startNodes.size());
            executionLogService.logStartNodesSaved(workflowId, serviceId, startNodes.size()); // Log start nodes being saved

            // Defer async execution until AFTER_COMMIT to avoid stale reads
            for (WorkflowExecutor executor : executorsToSave) {
                eventBusPublish(new ExecutorStartEvent(executor.getId(),
                        workflowId,
                        serviceId,
                        captureMdcContext()));
            }
        } finally {
            MDC.clear();
        }
    }

    /**
     * Starts a workflow executor asynchronously AFTER the transaction commits.
     * This fixes the issue where an async call might see an incomplete DB state.
     *
     * @param evt The event containing the executor's ID and MDC context.
     */
    @TransactionalEventListener
    public void onExecutorStartEvent(ExecutorStartEvent evt) {
        MDC.clear(); // Ensure MDC is cleared to prevent leakage from the publishing thread
        getSelfProxy().startWorkflowFromExecutorAsync(evt.executorId, evt.mdcContext);
    }

    /**
     * An asynchronous method that executes a given executor by ID.
     * MDC is propagated explicitly for logging correlation across threads.
     *
     * @param executorId The ID of the executor to run.
     * @param mdcContext The MDC context from the calling thread.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void startWorkflowFromExecutorAsync(String executorId, Map<String, String> mdcContext) {
        restoreMdcContext(mdcContext);
        log.info("Starting async execution for executorId: {}", executorId);
        executionLogService.logAsyncExecutorStart(executorId, mdcContext.get(MDC_WORKFLOW_ID), mdcContext.get(MDC_SERVICE_ID)); // Log async execution start
        try {
            startWorkflowFromExecutor(executorId);
        } finally {
            MDC.clear(); // Clear MDC after async execution
        }
    }

    /**
     * Core synchronous executor logic. This is public for async/proxy access.
     *
     * @param executorId The ID of the executor to run.
     */
    @Transactional
    public void startWorkflowFromExecutor(String executorId) {
        WorkflowExecutor executor = workflowService.getWorkflowExecutor(executorId);
        if (executor == null) {
            log.warn("Executor not found or already processed: {}", executorId);
            return;
        }

        setupMdc(executor.getWorkflowId(), executor.getServiceId());
        executionLogService.logSyncExecutorStart(executorId, executor.getWorkflowId(), executor.getServiceId()); // Log sync execution start

        Workflow workflow = workflowService.getWorkflowById(executor.getWorkflowId());
        if (workflow == null) {
            persistError(executor, "WORKFLOW_DEFINITION_NOT_FOUND", "Workflow definition missing", null, true);
            log.error("Workflow definition not found for executor {}", executorId);
            return;
        }

        if (executor.getStatus().isTerminal()) {
            log.debug("Executor {} already in terminal state ({}). Skipping execution.", executorId, executor.getStatus());
            return;
        }

        try {
            if (ExecutorType.NODE.equals(executor.getType())) {
                log.debug("Handling node execution for executor {}", executorId);
                handleNodeExecution(executor, workflow);
            } else if (ExecutorType.EDGE.equals(executor.getType())) {
                log.debug("Handling edge execution for executor {}", executorId);
                handleEdgeExecution(executor, workflow);
            } else {
                persistError(executor, "INVALID_EXECUTOR_TYPE", "Unknown executor type: " + executor.getType(), null, true);
                log.error("Invalid executor type {} for executor {}", executor.getType(), executorId);
            }

            // Check for workflow completion after each executor finishes, unless an error has already triggered a failure.
            if (!executor.getStatus().isTerminal() || executor.getStatus().equals(ExecutionStatus.COMPLETED)) {
                checkWorkflowCompletion(executor.getWorkflowId(), executor.getServiceId());
            }

        } catch (Exception e) {
            log.error("Unhandled exception during workflow execution for executor {}: {}", executorId, e.getMessage(), e);
            persistError(executor, "UNHANDLED_ERROR", "Internal execution error: " + e.getMessage(), e, true);
        } finally {
            MDC.clear(); // Clear MDC after synchronous execution
        }
    }

    /**
     * Approves a waiting executor and resumes the workflow.
     *
     * @param executorId The ID of the executor to approve.
     * @param approvedBy The user who approved the executor.
     * @param comments Any comments from the approver.
     */
    @Transactional
    public void approve(String executorId, String approvedBy, String comments) {
        updateApprovalStatus(executorId, ExecutionStatus.COMPLETED, approvedBy, comments, true);
    }

    /**
     * Rejects a waiting executor, which terminates that path of the workflow.
     *
     * @param executorId The ID of the executor to reject.
     * @param rejectedBy The user who rejected the executor.
     * @param comments Any comments from the approver.
     */
    @Transactional
    public void reject(String executorId, String rejectedBy, String comments) {
        updateApprovalStatus(executorId, ExecutionStatus.REJECTED, rejectedBy, comments, false);
    }

    /**
     * Updates the approval status of an edge executor.
     *
     * @param executorId The ID of the executor to update.
     * @param newStatus The new status to set (COMPLETED or REJECTED).
     * @param user The user performing the action.
     * @param comments The comments from the user.
     * @param resumeWorkflow If true, the workflow proceeds to the next node.
     */
    private void updateApprovalStatus(String executorId, ExecutionStatus newStatus, String user, String comments, boolean resumeWorkflow) {
        WorkflowExecutor executor = workflowService.getWorkflowExecutor(executorId);
        if (executor == null) {
            log.warn("Executor not found: {}", executorId);
            return;
        }

        setupMdc(executor.getWorkflowId(), executor.getServiceId());
        try {
            if (!ExecutorType.EDGE.equals(executor.getType())) {
                log.warn("Cannot {} non-edge executor {}. Type: {}", newStatus.name().toLowerCase(), executorId, executor.getType());
                return;
            }
            if (!ExecutionStatus.WAITING_FOR_APPROVAL.equals(executor.getStatus())) {
                log.warn("Executor {} not in WAITING_FOR_APPROVAL state. Current status: {}", executorId, executor.getStatus());
                return;
            }

            executor.setStatus(newStatus);
            executor.setApprovedBy(user);
            executor.setApprovalComments(comments);
            workflowService.saveWorkflowExecutor(executor);
            log.info("Executor {} set to status {} by {}", executorId, newStatus, user);
            executionLogService.logApprovalUpdate(executorId, newStatus.name(), user, executor.getName()); // Log approval status update

            if (resumeWorkflow) {
                resumeFromApprovedEdge(executor);
            }
            checkWorkflowCompletion(executor.getWorkflowId(), executor.getServiceId());
        } finally {
            MDC.clear();
        }
    }

    // ----- Core NODE & EDGE handling -----

    /**
     * Handles the execution of a node.
     *
     * @param executor The executor for the node.
     * @param workflow The parent workflow.
     */
    private void handleNodeExecution(WorkflowExecutor executor, Workflow workflow) {
        Node node = getNode(workflow, executor.getChildrenId());
        if (node == null) {
            persistError(executor, "NODE_NOT_FOUND", "Missing node: " + executor.getChildrenId(), null, true);
            log.error("Node definition not found for executor {}", executor.getId());
            return;
        }

        // Only persist RUNNING status if not already in a terminal state
        if (!executor.getStatus().isTerminal()) {
            beforeNodeExecution(node, executor);
            executor.setStatus(ExecutionStatus.RUNNING);
            workflowService.saveWorkflowExecutor(executor);
            log.info("Node executor {} (Node ID: {}) started execution.", executor.getId(), node.getId());
            executionLogService.logNodeExecutionStarted(executor); // Log node execution start
        } else {
            log.debug("Node executor {} (Node ID: {}) already in terminal state ({}). Skipping execution.", executor.getId(), node.getId(), executor.getStatus());
            return;
        }

        boolean success = false;
        try {
            // Execute the business logic for the service associated with the node
            success = executeService(executor.getServiceId(), node.getData().getParameters());
            log.info("Service execution for node {} (Executor ID: {}) completed with success: {}", node.getId(), executor.getId(), success);
        } catch (Exception e) {
            log.error("Service execution for node {} (Executor ID: {}) failed: {}", node.getId(), executor.getId(), e.getMessage(), e);
            persistError(executor, "SERVICE_EXECUTION_ERROR", "Business task failed: " + e.getMessage(), e, false);
        }

        // Final status update for the node executor
        executor.setStatus(success ? ExecutionStatus.COMPLETED : ExecutionStatus.FAILED);
        workflowService.saveWorkflowExecutor(executor);
        log.info("Node executor {} (Node ID: {}) status updated to {}.", executor.getId(), node.getId(), executor.getStatus());
        executionLogService.logNodeExecutionResult(executor, success); // Log node execution result

        afterNodeExecution(node, executor, success);

        if (success) {
            triggerOutgoingEdges(node.getId(), executor);
        }
    }

    /**
     * Handles the execution of an edge.
     *
     * @param executor The executor for the edge.
     * @param workflow The parent workflow.
     */
    private void handleEdgeExecution(WorkflowExecutor executor, Workflow workflow) {
        Edge edge = getEdge(workflow, executor.getChildrenId());
        if (edge == null) {
            persistError(executor, "EDGE_NOT_FOUND", "Missing edge: " + executor.getChildrenId(), null, true);
            log.error("Edge definition not found for executor {}", executor.getId());
            return;
        }

        if (edge.getData() != null && edge.getData().isAutoApprove()) {
            executor.setStatus(ExecutionStatus.COMPLETED);
            workflowService.saveWorkflowExecutor(executor);
            log.info("Edge executor {} (Edge ID: {}) auto-approved.", executor.getId(), edge.getId());
            executionLogService.logEdgeExecutionStatus(executor, "auto-approved"); // Log auto-approval
            triggerNodeExecution(edge.getTarget(), executor);
        } else {
            executor.setStatus(ExecutionStatus.WAITING_FOR_APPROVAL);
            if (edge.getData() != null) {
                executor.setAssignedApprover(edge.getData().getApproverRole());
                if (edge.getData().getApprovalTimeout() != null) {
                    // executor.setApprovalDeadline(LocalDateTime.now().plusHours(edge.getData().getApprovalTimeout()));
                }
            }
            workflowService.saveWorkflowExecutor(executor);
            log.info("Edge executor {} (Edge ID: {}) is WAITING_FOR_APPROVAL. Approver: {}", executor.getId(), edge.getId(), executor.getAssignedApprover());
            executionLogService.logEdgeExecutionStatus(executor, "WAITING_FOR_APPROVAL"); // Log waiting for approval
            onApprovalRequest(edge, executor);
        }
    }

    // ----- Trigger logic -----

    /**
     * Triggers the creation of executors for all outgoing edges from a completed node.
     *
     * @param sourceNodeId The ID of the node that just completed.
     * @param parent The parent executor of the completed node.
     */
    private void triggerOutgoingEdges(String sourceNodeId, WorkflowExecutor parent) {
        Workflow workflow = workflowService.getWorkflowById(parent.getWorkflowId());
        if (workflow == null) {
            log.error("Workflow definition not found when triggering outgoing edges from node {}", sourceNodeId);
            return;
        }

        List<Edge> edges = workflow.getEdges().stream()
                .filter(e -> e.getSource().equalsIgnoreCase(sourceNodeId))
                .collect(Collectors.toList());

        if (edges.isEmpty()) {
            log.info("No outgoing edges found from node {} for workflow {}", sourceNodeId, parent.getWorkflowId());
        }

        List<WorkflowExecutor> edgeExecutorsToSave = new ArrayList<>();
        for (Edge edge : edges) {
            WorkflowExecutor edgeExec = new WorkflowExecutor();
            edgeExec.setWorkflowId(parent.getWorkflowId());
            edgeExec.setServiceId(parent.getServiceId());
            edgeExec.setType(ExecutorType.EDGE);
            edgeExec.setName(parent.getName());
            edgeExec.setChildrenId(edge.getId());
            edgeExec.setStatus(ExecutionStatus.PENDING);
            edgeExecutorsToSave.add(edgeExec);
        }
        workflowService.saveWorkflowExecutors(edgeExecutorsToSave);
        log.info("Created {} edge executors for outgoing edges from node {}", edgeExecutorsToSave.size(), sourceNodeId);
        executionLogService.logOutgoingEdgesTriggered(parent, sourceNodeId, edgeExecutorsToSave.size()); // Log edge creation

        for (WorkflowExecutor edgeExec : edgeExecutorsToSave) {
            eventBusPublish(new ExecutorStartEvent(edgeExec.getId(),
                    edgeExec.getWorkflowId(),
                    edgeExec.getServiceId(),
                    captureMdcContext()));
        }
    }

    /**
     * Triggers the execution of a new node.
     *
     * @param nodeId The ID of the node to trigger.
     * @param parent The parent executor (an edge).
     */
    private void triggerNodeExecution(String nodeId, WorkflowExecutor parent) {
        // Check if there's already an active executor for this node in this workflow
        List<WorkflowExecutor> existingExecutors = workflowService.getWorkflowExecutorByWorkflowIdAndChildrenId(
                parent.getWorkflowId(), nodeId);

        boolean active = existingExecutors.stream()
                .anyMatch(e -> !e.getStatus().isTerminal());

        if (active) {
            log.debug("Node {} for workflow {} already has an active executor. Skipping trigger.", nodeId, parent.getWorkflowId());
            return; // Prevent duplicate executors
        }

        // If no active executor, create and save a new one
        WorkflowExecutor nodeExec = createNodeExecutor(parent.getWorkflowId(), parent.getServiceId(), nodeId, parent.getName());
        workflowService.saveWorkflowExecutor(nodeExec);
        log.info("Created new node executor {} for node {} in workflow {}", nodeExec.getId(), nodeId, parent.getWorkflowId());

        eventBusPublish(new ExecutorStartEvent(nodeExec.getId(),
                nodeExec.getWorkflowId(),
                nodeExec.getServiceId(),
                captureMdcContext()));
    }

    /**
     * Resumes the workflow from an approved edge by triggering its target node.
     *
     * @param approvedEdgeExecutor The executor for the approved edge.
     */
    private void resumeFromApprovedEdge(WorkflowExecutor approvedEdgeExecutor) {
        Workflow workflow = workflowService.getWorkflowById(approvedEdgeExecutor.getWorkflowId());
        if (workflow == null) {
            log.error("Workflow definition not found for approved edge executor {}", approvedEdgeExecutor.getId());
            return;
        }
        Edge edge = getEdge(workflow, approvedEdgeExecutor.getChildrenId());
        if (edge == null) {
            log.error("Edge not found for approved edge executor {}", approvedEdgeExecutor.getId());
            return;
        }
        log.info("Resuming workflow from approved edge {} (Executor ID: {}). Triggering target node {}.", edge.getId(), approvedEdgeExecutor.getId(), edge.getTarget());
        triggerNodeExecution(edge.getTarget(), approvedEdgeExecutor);
    }

    // ----- Completion & Error -----

    /**
     * Checks if all executors for a given workflow instance are in a terminal state.
     * If so, it marks the workflow as completed.
     *
     * @param workflowId The ID of the workflow.
     * @param serviceId The ID of the service.
     */
    private void checkWorkflowCompletion(String workflowId, String serviceId) {
        String key = workflowId + ":" + serviceId;
        // Basic in-memory check to prevent multiple completion events
        if (completedWorkflows.contains(key)) {
            log.debug("Workflow completion already handled for workflow {}", key);
            return;
        }

        List<WorkflowExecutor> allExecutors = workflowService.getWorkflowExecutorByWorkflowId(workflowId);
        boolean allFinished = allExecutors.stream()
                .allMatch(e -> e.getStatus().isTerminal());

        if (allFinished) {
            completedWorkflows.add(key); // Mark as handled
            log.info("Workflow {} for service {} completed. All executors are in terminal state.", workflowId, serviceId);
            executionLogService.logWorkflowCompletionCheck(workflowId, serviceId, true); // Log workflow completion
            onWorkflowCompleted(workflowId, serviceId);
        } else {
            log.debug("Workflow {} for service {} is not yet completed. {} active executors found.",
                    workflowId, serviceId, allExecutors.stream().filter(e -> !e.getStatus().isTerminal()).count());
            executionLogService.logWorkflowCompletionCheck(workflowId, serviceId, false); // Log incomplete workflow
        }
    }

    /**
     * Persists an error for a given executor and optionally fails the entire workflow.
     *
     * @param executor The executor where the error occurred.
     * @param code The error code.
     * @param msg The error message.
     * @param t The throwable that caused the error (can be null).
     * @param failWorkflow A flag to indicate if the entire workflow should be failed.
     */
    private void persistError(WorkflowExecutor executor, String code, String msg, Throwable t, boolean failWorkflow) {
        executor.setErrorCode(code);
        executor.setErrorMessage(msg);
        if (t != null) {
            executor.setErrorStackTrace(Arrays.stream(t.getStackTrace())
                    .limit(50) // Limit stack trace to avoid excessively large entries
                    .map(Objects::toString)
                    .collect(Collectors.joining("\n")));
        }
        executor.setStatus(ExecutionStatus.FAILED);
        workflowService.saveWorkflowExecutor(executor);

        log.error("Error [{}]: {} for executor {} (Workflow: {}, Service: {})",
                code, msg, executor.getId(), executor.getWorkflowId(), executor.getServiceId(), t);

        if (failWorkflow) {
            log.info("Triggering workflow failure for workflow {} due to error in executor {}", executor.getWorkflowId(), executor.getId());
            onWorkflowFailed(executor.getWorkflowId(), executor.getServiceId(), msg);
        }
    }

    // ----- Utility -----

    /**
     * Sets up the MDC (Mapped Diagnostic Context) for logging correlation.
     *
     * @param workflowId The ID of the workflow.
     * @param serviceId The ID of the service.
     */
    private void setupMdc(String workflowId, String serviceId) {
        MDC.put(MDC_CORRELATION_ID, workflowId + ":" + serviceId);
        MDC.put(MDC_SERVICE_ID, String.valueOf(serviceId));
        MDC.put(MDC_WORKFLOW_ID, workflowId);
    }

    /**
     * Captures the current MDC context.
     *
     * @return A map of the MDC context.
     */
    private Map<String, String> captureMdcContext() {
        Map<String, String> context = MDC.getCopyOfContextMap();
        return context == null ? new HashMap<>() : new HashMap<>(context);
    }

    /**
     * Restores the MDC context for a thread.
     *
     * @param ctx The MDC context to restore.
     */
    private void restoreMdcContext(Map<String, String> ctx) {
        MDC.setContextMap(ctx == null ? Map.of() : ctx);
    }

    /**
     * Creates a new WorkflowExecutor object for a node.
     *
     * @param workflowId The ID of the workflow.
     * @param serviceId The ID of the service.
     * @param nodeId The ID of the node.
     * @param name The name of the executor.
     * @return A new WorkflowExecutor object.
     */
    private WorkflowExecutor createNodeExecutor(String workflowId, String serviceId, String nodeId, String name) {
        WorkflowExecutor exec = new WorkflowExecutor();
        exec.setWorkflowId(workflowId);
        exec.setServiceId(serviceId);
        exec.setType(ExecutorType.NODE);
        exec.setName(name);
        exec.setChildrenId(nodeId);
        exec.setStatus(ExecutionStatus.PENDING);
        exec.setCreatedAt(LocalDateTime.now());
        return exec;
    }

    /**
     * Finds a node in a workflow by its ID.
     *
     * @param workflow The workflow to search.
     * @param id The ID of the node.
     * @return The Node object or null if not found.
     */
    private Node getNode(Workflow workflow, String id) {
        return workflow.getNodes().stream()
                .filter(n -> n.getId().equalsIgnoreCase(id))
                .findFirst().orElse(null);
    }

    /**
     * Finds an edge in a workflow by its ID.
     *
     * @param workflow The workflow to search.
     * @param id The ID of the edge.
     * @return The Edge object or null if not found.
     */
    private Edge getEdge(Workflow workflow, String id) {
        return workflow.getEdges().stream()
                .filter(e -> e.getId().equalsIgnoreCase(id))
                .findFirst().orElse(null);
    }

    /**
     * Gets a self-proxy of the bean to enable @Async and @Transactional annotations to work.
     *
     * @return A proxy of the WorkflowExecutionService bean.
     */
    private WorkflowExecutionService getSelfProxy() {
        return applicationContext.getBean(WorkflowExecutionService.class);
    }

    /**
     * Publishes an event to the Spring application context.
     *
     * @param evt The event to publish.
     */
    private void eventBusPublish(ExecutorStartEvent evt) {
        applicationContext.publishEvent(evt);
    }

    // ----- Lifecycle Hooks (protected to allow overriding in subclasses) -----

    /**
     * Hook method called before a node's service is executed.
     *
     * @param node The node being executed.
     * @param executor The executor for the node.
     */
    protected void beforeNodeExecution(Node node, WorkflowExecutor executor) {
        log.debug("Hook: beforeNodeExecution for node {} (Executor ID: {})", node.getId(), executor.getId());
    }

    /**
     * Hook method called after a node's service is executed.
     *
     * @param node The node that was executed.
     * @param executor The executor for the node.
     * @param success The result of the execution.
     */
    protected void afterNodeExecution(Node node, WorkflowExecutor executor, boolean success) {
        log.debug("Hook: afterNodeExecution for node {} (Executor ID: {}). Success: {}", node.getId(), executor.getId(), success);
    }

    /**
     * Hook method called when an approval is requested for an edge.
     *
     * @param edge The edge requiring approval.
     * @param executor The executor for the edge.
     */
    protected void onApprovalRequest(Edge edge, WorkflowExecutor executor) {
        log.info("Hook: onApprovalRequest for edge {} (Executor ID: {}). Approver: {}", edge.getId(), executor.getId(), executor.getAssignedApprover());
    }

    /**
     * Hook method called when a workflow instance successfully completes.
     *
     * @param workflowId The ID of the completed workflow.
     * @param serviceId The ID of the service.
     */
    protected void onWorkflowCompleted(String workflowId, String serviceId) {
        log.info("Hook: onWorkflowCompleted for workflow {} (Service ID: {})", workflowId, serviceId);
    }

    /**
     * Hook method called when a workflow instance fails.
     *
     * @param workflowId The ID of the failed workflow.
     * @param serviceId The ID of the service.
     * @param error The error message.
     */
    protected void onWorkflowFailed(String workflowId, String serviceId, String error) {
        log.error("Hook: onWorkflowFailed for workflow {} (Service ID: {}). Error: {}", workflowId, serviceId, error);
    }

    /**
     * Abstract method to be implemented by a concrete service,
     * which executes the business logic for a given serviceId and parameters.
     *
     * @param serviceId The ID of the service to execute.
     * @param params Parameters for the service execution.
     * @return true if the service execution was successful, false otherwise.
     */
    public abstract boolean executeService(String serviceId, Map<String, String> params);

    // ----- Inner Classes -----
    public static class ExecutorStartEvent {
        public final String executorId;
        public final String workflowId;
        public final String serviceId;
        public final Map<String, String> mdcContext;

        public ExecutorStartEvent(String id, String wf, String sid, Map<String, String> ctx) {
            this.executorId = id;
            this.workflowId = wf;
            this.serviceId = sid;
            this.mdcContext = ctx;
        }
    }
}