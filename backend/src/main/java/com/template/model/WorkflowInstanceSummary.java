package com.template.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WorkflowInstanceSummary {
    private int total;
    private int running;
    private int completed;
    private int pendingApproval;
}
