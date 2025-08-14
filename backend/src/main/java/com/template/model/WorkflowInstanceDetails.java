package com.template.model;


import lombok.Data;

import java.util.List;

/**
 * Data Transfer Object representing a complete workflow instance,
 * including its definition and all associated execution steps.
 */
@Data
public class WorkflowInstanceDetails {
    private Workflow workflow;
    private List<ExecutionStep> executionSteps;
    private List<ExecutionLog> executionLogs;

}

