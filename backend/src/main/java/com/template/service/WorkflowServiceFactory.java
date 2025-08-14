package com.template.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class WorkflowServiceFactory {

    private final Map<String, WorkflowExecutionService> workflowServices;

    public WorkflowServiceFactory(Map<String, WorkflowExecutionService> services) {
        this.workflowServices = services;
    }

    public WorkflowExecutionService get(String type) {
        String beanName = type + "WorkflowService";
        WorkflowExecutionService service = workflowServices.get(beanName);
        if (service == null) {
            throw new IllegalArgumentException("No workflow service found for: " + type);
        }
        return service;
    }
}
