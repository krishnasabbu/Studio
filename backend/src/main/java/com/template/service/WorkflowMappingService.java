package com.template.service;

import com.template.dao.WorkflowMappingRepository;
import com.template.model.WorkflowMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service class for managing WorkflowMapping entities.
 * Contains business logic for CRUD operations, now using JdbcTemplate.
 */
@Service
public class WorkflowMappingService {

    private final WorkflowMappingRepository workflowMappingRepository;

    @Autowired
    public WorkflowMappingService(WorkflowMappingRepository workflowMappingRepository) {
        this.workflowMappingRepository = workflowMappingRepository;
    }

    public WorkflowMapping save(WorkflowMapping workflowMapping) {
        return workflowMappingRepository.save(workflowMapping);
    }

    public List<WorkflowMapping> findAll() {
        return workflowMappingRepository.findAll();
    }

    public Optional<WorkflowMapping> findById(Long id) {
        return workflowMappingRepository.findById(id);
    }

    public boolean deleteById(Long id) {
        int deletedRows = workflowMappingRepository.deleteById(id);
        return deletedRows > 0;
    }
}
