package com.template.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class TaskWorkflowService extends WorkflowExecutionService {
    @Override
    public boolean executeService(String serviceId, Map<String, String> params) {
        return true;
    }
}
