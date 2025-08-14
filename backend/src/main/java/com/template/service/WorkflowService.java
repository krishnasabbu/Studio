package com.template.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.template.dao.*;
import com.template.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service class for managing workflow-related operations.
 * This class handles the business logic for creating, retrieving, updating, and deleting workflows,
 * as well as managing their execution instances and logs. It interacts with various repositories
 * to persist and retrieve data.
 */
@Service
public class WorkflowService {

    // Automatically injects the repository for managing workflow definitions
    @Autowired
    private WorkflowRepository workflowRepository;

    // Automatically injects the repository for managing execution logs
    @Autowired
    private ExecutionLogRepository executionLogRepository;

    // Automatically injects the repository for managing workflow execution instances
    @Autowired
    private WorkflowExecutorRepository executorRepository;

    // Automatically injects the repository for managing workflow mappings
    @Autowired
    private WorkflowMappingRepository workflowMappingRepository;

    // Defines a URL pattern for previewing a specific item
    private final String PREVIEW_URL = "/%s/view/%s";

    // Defines a URL pattern for viewing a workflow instance
    private final String WORKFLOW_URL = "/workflows/view/%s";

    /**
     * Retrieves all workflow definitions from the repository.
     * @return a list of all Workflow objects.
     */
    public List<Workflow> getAllWorkflows() {
        // Fetches all workflow entities from the database
        return workflowRepository.findAll();
    }

    /**
     * Retrieves a single workflow definition by its unique ID.
     * @param id The ID of the workflow to retrieve.
     * @return The Workflow object with the specified ID, or null if not found.
     */
    public Workflow getWorkflowById(String id) {
        // Finds a single workflow by its unique identifier
        return workflowRepository.findById(id);
    }

    /**
     * Creates a new workflow definition by saving it to the repository.
     * @param workflow The Workflow object to be saved.
     */
    public void createWorkflow(Workflow workflow) {
        try {
            // Saves the new workflow to the repository
            workflowRepository.save(workflow);
        } catch (JsonProcessingException e) {
            // Prints the stack trace for debugging purposes
            e.printStackTrace();
            // Throws a runtime exception if the JSON processing fails
            throw new RuntimeException("Failed to save workflow definition", e);
        }
    }

    /**
     * Updates an existing workflow definition.
     * @param id The ID of the workflow to update.
     * @param workflow The Workflow object containing the new data.
     */
    public void updateWorkflow(String id, Workflow workflow) {
        // Calls the repository to update the workflow with the given ID
        workflowRepository.update(id, workflow);
    }

    /**
     * Deletes a workflow definition by its ID.
     * Note: This method should be used with caution as it will also delete associated nodes and edges.
     * @param id The ID of the workflow to delete.
     */
    public void deleteWorkflow(String id) {
        // Deletes the workflow and its associated components by ID
        workflowRepository.deleteById(id);
    }

    /**
     * Saves a list of workflow executors in a single transaction.
     * This is useful for performance when triggering multiple nodes or edges at once.
     * @param workflowExecutors The list of WorkflowExecutor objects to be saved or updated.
     */
    @Transactional
    public void saveWorkflowExecutors(List<WorkflowExecutor> workflowExecutors) {
        // Saves all workflow executors in a single batch operation
        executorRepository.saveAll(workflowExecutors);
    }

    /**
     * Saves a single workflow executor.
     * This method will either insert a new executor or update an existing one based on its ID.
     * @param workflowExecutor The WorkflowExecutor object to be saved or updated.
     */
    @Transactional
    public void saveWorkflowExecutor(WorkflowExecutor workflowExecutor) {
        // Saves or updates a single workflow executor
        executorRepository.save(workflowExecutor);
    }

    /**
     * Retrieves a specific workflow executor by its unique ID.
     * @param workflowExecutorId The ID of the executor instance.
     * @return The WorkflowExecutor object, or null if no executor is found with that ID.
     */
    public WorkflowExecutor getWorkflowExecutor(String workflowExecutorId) {
        // Finds a workflow executor by its ID
        return executorRepository.findById(workflowExecutorId);
    }

    /**
     * Retrieves all executor instances for a given workflow definition.
     * This is used to track the progress and status of a complete workflow run.
     * @param workflowId The ID of the workflow instance.
     * @return A list of all WorkflowExecutor objects for the specified workflow.
     */
    public List<WorkflowExecutor> getWorkflowExecutorByWorkflowId(String workflowId) {
        // Finds all executors associated with a specific workflow
        return executorRepository.findByWorkflowId(workflowId);
    }

    /**
     * Retrieves all executor instances for a specific node or edge within a workflow.
     * This is a critical method for the concurrency logic, as it helps check if
     * a particular node is already being processed.
     * @param workflowId The ID of the workflow instance.
     * @param childrenId The ID of the node or edge.
     * @return A list of WorkflowExecutor objects for the specified node/edge in the workflow.
     */
    public List<WorkflowExecutor> getWorkflowExecutorByWorkflowIdAndChildrenId(String workflowId, String childrenId) {
        // Finds executors for a specific node or edge within a workflow
        return executorRepository.findByWorkflowIdAndChildrenId(workflowId, childrenId);
    }

    /**
     * Retrieves all workflow executor instances associated with a given service ID.
     * @param serviceId The ID of the service instance.
     * @return A list of WorkflowExecutor objects for the specified service.
     */
    public List<WorkflowExecutor> getWorkflowExecutorByServiceId(String serviceId) {
        // Finds all executors associated with a specific service ID
        return executorRepository.findByServiceId(serviceId);
    }

    public Optional<WorkflowInstanceDetails> getWorkflowInstanceDetails(String serviceId) {
        List<WorkflowExecutor> workflowExecutors = executorRepository.findByServiceId(serviceId);

        // Return an empty Optional if no executors are found for the serviceId.
        if (workflowExecutors.isEmpty()) {
            return Optional.empty();
        }

        // Get the workflow ID from the first executor and fetch the workflow definition.
        String workflowId = workflowExecutors.get(0).getWorkflowId();
        Workflow workflow = workflowRepository.findById(workflowId);

        // Return an empty Optional if the workflow definition is not found.
        if (workflow == null) {
            return Optional.empty();
        }

        List<ExecutionLog> executionLogs = executionLogRepository.findByServiceId(serviceId);

        // Generate the execution steps using a separate helper method for clarity.
        List<ExecutionStep> steps = createExecutionSteps(workflow, workflowExecutors);

        WorkflowInstanceDetails workflowInstanceDetails = new WorkflowInstanceDetails();
        workflowInstanceDetails.setWorkflow(workflow);
        workflowInstanceDetails.setExecutionSteps(steps);
        workflowInstanceDetails.setExecutionLogs(executionLogs);

        return Optional.of(workflowInstanceDetails);
    }

    /**
     * Helper method to create a list of execution steps from a workflow and its executors.
     */
    private List<ExecutionStep> createExecutionSteps(Workflow workflow, List<WorkflowExecutor> workflowExecutors) {
        Map<String, WorkflowExecutor> executorMap = workflowExecutors.stream()
                .collect(Collectors.toMap(WorkflowExecutor::getChildrenId, Function.identity()));

        Map<String, Node> nodeMap = workflow.getNodes().stream()
                .collect(Collectors.toMap(Node::getId, Function.identity()));

        List<ExecutionStep> steps = new ArrayList<>();
        Set<String> addedNodes = new HashSet<>();

        for (Edge edge : workflow.getEdges()) {
            // Add the source node step if not already added.
            Node sourceNode = nodeMap.get(edge.getSource());
            if (sourceNode != null && addedNodes.add(sourceNode.getId())) {
                addStep(steps, executorMap.get(sourceNode.getId()), sourceNode.getId(), sourceNode.getData().getStageName(), ExecutorType.NODE);
            }

            // Add the edge step.
            addStep(steps, executorMap.get(edge.getId()), edge.getId(), edge.getData().getApproverRole(), ExecutorType.EDGE);

            // Add the target node step if not already added.
            Node targetNode = nodeMap.get(edge.getTarget());
            if (targetNode != null && addedNodes.add(targetNode.getId())) {
                addStep(steps, executorMap.get(targetNode.getId()), targetNode.getId(), targetNode.getData().getStageName(), ExecutorType.NODE);
            }
        }
        return steps;
    }

    /**
     * Helper method to add an ExecutionStep, handling cases where the executor is null.
     */
    private void addStep(List<ExecutionStep> steps, WorkflowExecutor executor, String id, String name, ExecutorType defaultType) {
        if (executor != null) {
            steps.add(new ExecutionStep(id, name, executor.getType().toString(), executor.getStatus().toString()));
        } else {
            steps.add(new ExecutionStep(id, name, defaultType.toString(), ExecutionStatus.PENDING.toString()));
        }
    }
    /**
     * Retrieves a summary of all workflow instances, including counts for total, running, completed, and pending approvals.
     * @return A WorkflowInstanceSummary object containing the aggregated counts.
     */
    public WorkflowInstanceSummary getWorkflowInstanceSummary() {
        // Retrieves the total count of workflows from the repository
        int totalCount = workflowRepository.countAll();

        // Retrieves all workflow executors from the repository
        List<WorkflowExecutor> executorList = executorRepository.findAll();

        // Initializes counters for different workflow statuses
        int runningCount = 0;
        int completedCount = 0;
        int pendingApprovalCount = 0;

        // Groups the list of executors by their service ID
        Map<String, List<WorkflowExecutor>> groupedByServiceId = executorList.stream()
                .collect(Collectors.groupingBy(WorkflowExecutor::getServiceId));

        // Iterates through each group of executors to determine the status of each workflow instance
        for (List<WorkflowExecutor> executors : groupedByServiceId.values()) {
            // Checks if any executor in the group is in a "WAITING_FOR_APPROVAL" state
            boolean hasWaitingApproval = executors.stream()
                    .anyMatch(e -> ExecutionStatus.WAITING_FOR_APPROVAL.equals(e.getStatus()));

            // Checks if all executors in the group are in a "COMPLETED" state
            boolean allCompleted = executors.stream()
                    .allMatch(e -> ExecutionStatus.COMPLETED.equals(e.getStatus()));

            // Updates the counters based on the workflow's status
            if (hasWaitingApproval) {
                // Increments pending and running counts if an approval is needed
                pendingApprovalCount++;
                runningCount++;
            } else if (allCompleted) {
                // Increments completed count if the entire workflow is finished
                completedCount++;
            } else {
                // Otherwise, the workflow is considered to be running
                runningCount++;
            }
        }

        // Returns a new summary object with the calculated counts
        return new WorkflowInstanceSummary(totalCount, runningCount, completedCount, pendingApprovalCount);
    }

    /**
     * Retrieves a list of details for all workflow instances that are pending approval.
     * @return A list of PendingApprovalDetails objects.
     */
    public List<PendingApprovalDetails> getPendingApprovalDetails() {
        List<WorkflowExecutor> pendingExecutors = executorRepository.findPendingApprovalEdges();
        List<PendingApprovalDetails> pendingApprovalDetailsList = new ArrayList<>();

        // Group executors by workflowId to fetch workflow details only once per workflow.
        Map<String, List<WorkflowExecutor>> groupedByWorkflow = pendingExecutors.stream()
                .collect(Collectors.groupingBy(WorkflowExecutor::getWorkflowId));

        for (Map.Entry<String, List<WorkflowExecutor>> entry : groupedByWorkflow.entrySet()) {
            String workflowId = entry.getKey();
            List<WorkflowExecutor> executors = entry.getValue();

            Workflow workflow = workflowRepository.findById(workflowId);
            if (workflow == null) {
                continue; // Skip if the workflow definition is not found.
            }

            // Pre-fetch nodes and edges into maps for faster lookups.
            Map<String, Node> nodeMap = workflow.getNodes().stream()
                    .collect(Collectors.toMap(Node::getId, Function.identity()));

            Map<String, Edge> edgeMap = workflow.getEdges().stream()
                    .collect(Collectors.toMap(Edge::getId, Function.identity()));

            Optional<WorkflowMapping> workflowMappingOptional = workflowMappingRepository.findByWorkflowId(workflow.getId());
            String functionality = workflowMappingOptional.map(WorkflowMapping::getFunctionalityName).orElse(null);

            for (WorkflowExecutor executor : executors) {
                Edge edge = edgeMap.get(executor.getChildrenId());
                if (edge == null) {
                    continue; // Skip if the edge is not found.
                }

                Node targetNode = nodeMap.get(edge.getTarget());
                if (targetNode == null) {
                    continue; // Skip if the target node is not found.
                }

                PendingApprovalDetails details = new PendingApprovalDetails();
                details.setId(executor.getId());
                details.setServiceName(executor.getName());
                details.setWorkflowId(workflow.getId());
                details.setWorkflowName(workflow.getName());
                details.setStageId(targetNode.getId());
                details.setStageName(targetNode.getData().getStageName());
                details.setActivityId(edge.getId());
                details.setActivityName(edge.getData().getApproverRole());
                details.setRequiredRole(edge.getData().getApproverRole());
                details.setRequestedBy(workflow.getCreatedBy());
                details.setRequestedAt(LocalDateTime.ofInstant(workflow.getCreatedAt(), ZoneId.systemDefault()));
                details.setStatus(executor.getStatus());

                if (functionality != null) {
                    details.setViewURL(this.getPreviewURL(functionality, executor.getServiceId()));
                    details.setViewWorkflowURL(this.getWorkflowURL(executor.getServiceId()));
                }

                pendingApprovalDetailsList.add(details);
            }
        }

        return pendingApprovalDetailsList;
    }

    /**
     * Generates a URL for viewing a workflow instance.
     * @param serviceId The ID of the service instance.
     * @return A formatted URL string.
     */
    private String getWorkflowURL(String serviceId) {
        // Uses String.format to insert the service ID into the predefined URL pattern
        return String.format(WORKFLOW_URL, serviceId);
    }


    /**
     * Generates a URL for previewing an item associated with a functionality.
     * @param functionality The name of the functionality.
     * @param id The ID of the item.
     * @return A formatted URL string.
     */
    private String getPreviewURL(String functionality, String id) {
        // Formats the URL with the functionality (in lowercase) and the item ID
        return String.format(PREVIEW_URL, functionality.toLowerCase(), id);
    }
}